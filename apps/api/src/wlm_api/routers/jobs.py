from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
from ....db import get_db
from ....models import GenerationJob, JobStatus
from ....schemas import GenerationJobRead

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=List[GenerationJobRead])
async def list_jobs(
    event_id: uuid.UUID, status: JobStatus | None = None, db: AsyncSession = Depends(get_db)
) -> List[GenerationJobRead]:
    query = select(GenerationJob).where(GenerationJob.event_id == event_id)
    if status:
        query = query.where(GenerationJob.status == status)
    query = query.order_by(GenerationJob.created_at.desc())
    result = await db.execute(query)
    jobs = result.scalars().all()
    return [GenerationJobRead.model_validate(j) for j in jobs]


@router.get("/{job_id}", response_model=GenerationJobRead)
async def get_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> GenerationJobRead:
    result = await db.execute(select(GenerationJob).where(GenerationJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return GenerationJobRead.model_validate(job)


@router.get("/{job_id}/status")
async def get_job_status(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GenerationJob).where(GenerationJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return {"status": job.status.value, "progress": job.progress}