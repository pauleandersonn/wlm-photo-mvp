import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Text,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from .db import Base
import enum


class MontageMode(str, enum.Enum):
    classic = "classic"
    ai = "ai"


class AiRenderStyle(str, enum.Enum):
    hyperrealistic = "hyperrealistic"
    pixar = "pixar"
    cartoon = "cartoon"


class MemoryStatus(str, enum.Enum):
    ready = "ready"
    processing = "processing"
    approved = "approved"
    rejected = "rejected"


class JobStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class ThemeStyle(str, enum.Enum):
    champagne = "champagne"
    minimalist = "minimalist"
    botanical = "botanical"
    blacktie = "blacktie"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    couple_names: Mapped[str] = mapped_column(String(200), nullable=False)
    date_formatted: Mapped[str] = mapped_column(String(100), nullable=False)
    venue: Mapped[str] = mapped_column(String(300), nullable=False)
    couple_photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    couple_media_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    theme_style: Mapped[ThemeStyle] = mapped_column(
        SQLEnum(ThemeStyle), default=ThemeStyle.champagne, nullable=False
    )
    template_aspect_ratio: Mapped[str] = mapped_column(String(20), default="10x15")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    memories: Mapped[list["Memory"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )
    jobs: Mapped[list["GenerationJob"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_events_created_at", "created_at"),
    )


class Memory(Base):
    __tablename__ = "memories"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    token: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    guest_name: Mapped[str] = mapped_column(String(200), nullable=False)
    mode: Mapped[MontageMode] = mapped_column(
        SQLEnum(MontageMode), default=MontageMode.classic, nullable=False
    )
    ai_style: Mapped[AiRenderStyle | None] = mapped_column(
        SQLEnum(AiRenderStyle), nullable=True
    )
    template_style: Mapped[str] = mapped_column(String(50), default="champagne")
    guest_photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    guest_media_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    result_image_url: Mapped[str] = mapped_column(Text, nullable=False)
    result_media_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[MemoryStatus] = mapped_column(
        SQLEnum(MemoryStatus), default=MemoryStatus.ready, nullable=False
    )
    prompt_used: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    event: Mapped["Event"] = relationship(back_populates="memories")
    job: Mapped["GenerationJob | None"] = relationship(back_populates="memory")

    __table_args__ = (
        Index("ix_memories_event_id_created_at", "event_id", "created_at"),
        Index("ix_memories_token", "token"),
    )


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    memory_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("memories.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus), default=JobStatus.pending, nullable=False
    )
    mode: Mapped[MontageMode] = mapped_column(
        SQLEnum(MontageMode), default=MontageMode.classic, nullable=False
    )
    ai_style: Mapped[AiRenderStyle | None] = mapped_column(
        SQLEnum(AiRenderStyle), nullable=True
    )
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    progress: Mapped[int] = mapped_column(default=0)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    event: Mapped["Event"] = relationship(back_populates="jobs")
    memory: Mapped["Memory | None"] = relationship(back_populates="job")

    __table_args__ = (
        Index("ix_generation_jobs_event_id_status", "event_id", "status"),
        Index("ix_generation_jobs_created_at", "created_at"),
    )