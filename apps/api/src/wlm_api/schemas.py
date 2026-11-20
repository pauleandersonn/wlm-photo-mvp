from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
import uuid
from .models import MontageMode, AiRenderStyle, MemoryStatus, JobStatus, ThemeStyle


class EventBase(BaseModel):
    couple_names: str = Field(..., min_length=1, max_length=200)
    date_formatted: str = Field(..., min_length=1, max_length=100)
    venue: str = Field(..., min_length=1, max_length=300)
    theme_style: ThemeStyle = ThemeStyle.champagne
    couple_photo_url: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    couple_names: Optional[str] = Field(None, min_length=1, max_length=200)
    date_formatted: Optional[str] = Field(None, min_length=1, max_length=100)
    venue: Optional[str] = Field(None, min_length=1, max_length=300)
    theme_style: Optional[ThemeStyle] = None
    couple_photo_url: Optional[str] = None
    couple_media_id: Optional[str] = None


class EventRead(EventBase):
    id: uuid.UUID
    title: str
    couple_media_id: Optional[str] = None
    template_aspect_ratio: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemoryBase(BaseModel):
    guest_name: str = Field(..., min_length=1, max_length=200)
    mode: MontageMode = MontageMode.classic
    ai_style: Optional[AiRenderStyle] = None
    template_style: str = "champagne"
    guest_photo_url: str
    guest_media_id: Optional[str] = None


class MemoryCreate(MemoryBase):
    event_id: uuid.UUID


class MemoryRead(MemoryBase):
    id: uuid.UUID
    token: str
    result_image_url: str
    result_media_id: Optional[str] = None
    status: MemoryStatus
    prompt_used: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemoryApprove(BaseModel):
    pass


class MemoryRegenerate(BaseModel):
    pass


class GenerationJobRead(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    memory_id: Optional[uuid.UUID] = None
    status: JobStatus
    mode: MontageMode
    ai_style: Optional[AiRenderStyle] = None
    error: Optional[str] = None
    progress: int
    payload: dict
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    url: str
    media_id: str


class HealthResponse(BaseModel):
    status: str
    version: str