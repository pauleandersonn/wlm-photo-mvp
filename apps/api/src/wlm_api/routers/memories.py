from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
from ....db import get_db
from ....models import Memory, Event, MemoryStatus
from ....schemas import MemoryCreate, MemoryRead, MemoryApprove, MemoryRegenerate

router = APIRouter(prefix="/memories", tags=["memories"])


@router.post("", response_model=MemoryRead, status_code=status.HTTP_201_CREATED)
async def create_memory(payload: MemoryCreate, db: AsyncSession = Depends(get_db)) -> MemoryRead:
    # Verify event exists
    event_result = await db.execute(select(Event).where(Event.id == payload.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    token = uuid.uuid4().hex[:10]
    memory = Memory(
        event_id=payload.event_id,
        token=token,
        guest_name=payload.guest_name,
        mode=payload.mode,
        ai_style=payload.ai_style,
        template_style=payload.template_style,
        guest_photo_url=payload.guest_photo_url,
        guest_media_id=payload.guest_media_id,
        result_image_url=payload.guest_photo_url,  # placeholder, updated after processing
        status=MemoryStatus.processing,
    )
    db.add(memory)
    await db.commit()
    await db.refresh(memory)
    return MemoryRead.model_validate(memory)


@router.get("", response_model=List[MemoryRead])
async def list_memories(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> List[MemoryRead]:
    result = await db.execute(
        select(Memory).where(Memory.event_id == event_id).order_by(Memory.created_at.desc())
    )
    memories = result.scalars().all()
    return [MemoryRead.model_validate(m) for m in memories]


@router.get("/{memory_id}", response_model=MemoryRead)
async def get_memory(memory_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> MemoryRead:
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Lembrança não encontrada")
    return MemoryRead.model_validate(memory)


@router.get("/by-token/{token}", response_model=MemoryRead)
async def get_memory_by_token(token: str, db: AsyncSession = Depends(get_db)) -> MemoryRead:
    result = await db.execute(select(Memory).where(Memory.token == token))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Token inválido")
    return MemoryRead.model_validate(memory)


@router.post("/{memory_id}/approve", response_model=MemoryRead)
async def approve_memory(
    memory_id: uuid.UUID, payload: MemoryApprove, db: AsyncSession = Depends(get_db)
) -> MemoryRead:
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Lembrança não encontrada")

    memory.status = MemoryStatus.approved
    await db.commit()
    await db.refresh(memory)
    return MemoryRead.model_validate(memory)


@router.post("/{memory_id}/regenerate", response_model=MemoryRead)
async def regenerate_memory(
    memory_id: uuid.UUID, payload: MemoryRegenerate, db: AsyncSession = Depends(get_db)
) -> MemoryRead:
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Lembrança não encontrada")

    # Reset status to processing, actual regeneration would be queued
    memory.status = MemoryStatus.processing
    await db.commit()
    await db.refresh(memory)
    return MemoryRead.model_validate(memory)


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(memory_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Lembrança não encontrada")

    await db.delete(memory)
    await db.commit()