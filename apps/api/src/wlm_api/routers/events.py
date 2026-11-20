from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
from ....db import get_db
from ....models import Event
from ....schemas import EventCreate, EventUpdate, EventRead

router = APIRouter(prefix="/events", tags=["events"])


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, db: AsyncSession = Depends(get_db)) -> EventRead:
    event = Event(
        title=f"Casamento de {payload.couple_names}",
        couple_names=payload.couple_names,
        date_formatted=payload.date_formatted,
        venue=payload.venue,
        theme_style=payload.theme_style,
        couple_photo_url=payload.couple_photo_url,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return EventRead.model_validate(event)


@router.get("", response_model=List[EventRead])
async def list_events(db: AsyncSession = Depends(get_db)) -> List[EventRead]:
    result = await db.execute(select(Event).order_by(Event.created_at.desc()))
    events = result.scalars().all()
    return [EventRead.model_validate(e) for e in events]


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> EventRead:
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return EventRead.model_validate(event)


@router.patch("/{event_id}", response_model=EventRead)
async def update_event(
    event_id: uuid.UUID, payload: EventUpdate, db: AsyncSession = Depends(get_db)
) -> EventRead:
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)
    return EventRead.model_validate(event)