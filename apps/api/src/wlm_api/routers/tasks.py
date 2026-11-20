from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
import uuid
import io
from PIL import Image
from ....db import get_db
from ....models import Event, Memory, GenerationJob, MemoryStatus, JobStatus, MontageMode
from ....schemas import MemoryRead, GenerationJobRead
from ....services.montage import montage_engine
from ....services.storage import get_storage

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/process-classic/{memory_id}", response_model=MemoryRead)
async def process_classic_montage(
    memory_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> MemoryRead:
    """Process a classic montage for a memory."""
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Lembrança não encontrada")

    event_result = await db.execute(select(Event).where(Event.id == memory.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Update job status if exists
    job_result = await db.execute(
        select(GenerationJob).where(GenerationJob.memory_id == memory_id)
    )
    job = job_result.scalar_one_or_none()

    if job:
        job.status = JobStatus.processing
        job.started_at = __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
        await db.commit()

    # Process in background
    background_tasks.add_task(
        _process_classic_task,
        str(memory_id),
        str(event.id),
    )

    memory.status = MemoryStatus.processing
    await db.commit()
    await db.refresh(memory)
    return MemoryRead.model_validate(memory)


async def _process_classic_task(memory_id: str, event_id: str):
    """Background task to process classic montage."""
    from ....db import async_session_maker
    from ....models import Memory, Event, MemoryStatus, GenerationJob, JobStatus

    async with async_session_maker() as db:
        try:
            mem_result = await db.execute(select(Memory).where(Memory.id == memory_id))
            memory = mem_result.scalar_one_or_none()
            if not memory:
                return

            evt_result = await db.execute(select(Event).where(Event.id == event_id))
            event = evt_result.scalar_one_or_none()
            if not event:
                memory.status = MemoryStatus.rejected
                await db.commit()
                return

            # Load images
            couple_img = await montage_engine.load_image_from_url(event.couple_photo_url or "")
            guest_img = await montage_engine.load_image_from_url(memory.guest_photo_url)

            # Render montage
            result_key = await montage_engine.render_classic_souvenir(
                event, couple_img, guest_img, memory.guest_name
            )

            # Update memory with result
            storage = get_storage()
            result_url = storage.get_url(result_key)
            memory.result_image_url = result_url
            memory.status = MemoryStatus.ready
            await db.commit()

            # Update job if exists
            job_result = await db.execute(
                select(GenerationJob).where(GenerationJob.memory_id == memory_id)
            )
            job = job_result.scalar_one_or_none()
            if job:
                job.status = JobStatus.completed
                job.progress = 100
                job.completed_at = __import__('datetime').datetime.now(__import__('datetime').timezone.utc)
                await db.commit()

        except Exception as e:
            # Mark as failed
            mem_result = await db.execute(select(Memory).where(Memory.id == memory_id))
            memory = mem_result.scalar_one_or_none()
            if memory:
                memory.status = MemoryStatus.rejected
                await db.commit()

            job_result = await db.execute(
                select(GenerationJob).where(GenerationJob.memory_id == memory_id)
            )
            job = job_result.scalar_one_or_none()
            if job:
                job.status = JobStatus.failed
                job.error = str(e)
                await db.commit()


@router.post("/process-ai/{memory_id}", response_model=MemoryRead)
async def process_ai_montage(
    memory_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> MemoryRead:
    """Process an AI montage for a memory (placeholder - requires external API)."""
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Lembrança não encontrada")

    # For now, mark as failed since AI requires external API
    memory.status = MemoryStatus.rejected

    job_result = await db.execute(
        select(GenerationJob).where(GenerationJob.memory_id == memory_id)
    )
    job = job_result.scalar_one_or_none()
    if job:
        job.status = JobStatus.failed
        job.error = "AI processing requires external API integration"

    await db.commit()
    await db.refresh(memory)
    return MemoryRead.model_validate(memory)