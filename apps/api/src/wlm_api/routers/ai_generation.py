"""AI Image Generation Router."""
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid

from ...services.image_generation import (
    ImageGenerationService,
    GenerationRequest,
    GenerationResult,
    ImageProvider,
    ImageStyle,
    image_generation_service,
)
from ...models import Memory, MemoryStatus
from ...db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


router = APIRouter(prefix="/api/v1/ai", tags=["ai-generation"])


class AIGenerateRequest(BaseModel):
    memory_id: Optional[str] = None  # If regenerating existing memory
    event_id: Optional[str] = None   # If creating new
    guest_name: str = "Convidado"
    prompt: str = Field(..., min_length=1, max_length=2000)
    negative_prompt: Optional[str] = None
    style: ImageStyle = ImageStyle.HYPERREALISTIC
    provider: Optional[ImageProvider] = None
    reference_images: List[str] = []  # base64 encoded
    width: int = Field(default=1024, ge=256, le=2048)
    height: int = Field(default=1024, ge=256, le=2048)
    steps: int = Field(default=30, ge=10, le=100)
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0)
    seed: Optional[int] = None


class AIGenerateResponse(BaseModel):
    success: bool
    memory_id: Optional[str] = None
    image_url: Optional[str] = None
    provider: Optional[str] = None
    error: Optional[str] = None
    metadata: dict = {}


@router.post("/generate", response_model=AIGenerateResponse)
async def generate_image(
    payload: AIGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> AIGenerateResponse:
    """Generate AI image for wedding memory."""

    # Build generation request
    request = GenerationRequest(
        prompt=payload.prompt,
        negative_prompt=payload.negative_prompt,
        style=payload.style,
        reference_images=payload.reference_images,
        width=payload.width,
        height=payload.height,
        steps=payload.steps,
        guidance_scale=payload.guidance_scale,
        seed=payload.seed,
    )

    # Generate image
    result = await image_generation_service.generate(
        request,
        preferred_provider=payload.provider,
        fallback=True,
    )

    if not result.success:
        return AIGenerateResponse(
            success=False,
            error=result.error,
            provider=result.provider.value if result.provider else None,
        )

    # If memory_id provided, update existing memory
    memory_id = payload.memory_id
    if memory_id:
        try:
            mem_uuid = uuid.UUID(memory_id)
            mem_result = await db.execute(select(Memory).where(Memory.id == mem_uuid))
            memory = mem_result.scalar_one_or_none()
            if memory:
                memory.result_image_url = result.image_url
                memory.status = MemoryStatus.ready
                memory.prompt_used = payload.prompt
                await db.commit()
        except ValueError:
            pass

    # If event_id but no memory_id, could create new memory (optional)
    # For now just return the generated image

    return AIGenerateResponse(
        success=True,
        memory_id=memory_id,
        image_url=result.image_url,
        provider=result.provider.value if result.provider else None,
        metadata=result.metadata or {},
    )


@router.get("/providers")
async def list_providers() -> dict:
    """List available image generation providers."""
    available = image_generation_service.get_available_providers()
    return {
        "available": [p.value for p in available],
        "all": [p.value for p in ImageProvider],
        "styles": [s.value for s in ImageStyle],
    }


@router.post("/generate-and-save")
async def generate_and_save(
    payload: AIGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> AIGenerateResponse:
    """Generate AI image and save as new memory."""

    # Generate first
    result = await generate_image(payload, background_tasks, db)

    if not result.success:
        return result

    # Create new memory record
    from ...models import Memory, MemoryStatus, MontageMode

    new_memory = Memory(
        event_id=uuid.UUID(payload.event_id) if payload.event_id else uuid.uuid4(),
        token=uuid.uuid4().hex[:10],
        guest_name=payload.guest_name,
        mode=MontageMode.ai,
        ai_style=payload.style,
        template_style="ai-generated",
        guest_photo_url=payload.reference_images[0] if payload.reference_images else "",
        result_image_url=result.image_url,
        status=MemoryStatus.ready,
        prompt_used=payload.prompt,
    )
    db.add(new_memory)
    await db.commit()
    await db.refresh(new_memory)

    return AIGenerateResponse(
        success=True,
        memory_id=str(new_memory.id),
        image_url=result.image_url,
        provider=result.provider,
        metadata=result.metadata,
    )