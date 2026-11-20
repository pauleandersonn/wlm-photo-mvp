from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import base64
from ....db import get_db
from ....models import Event
from ....schemas import UploadResponse
from ....services.storage import get_storage

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/guest-photo", response_model=UploadResponse)
async def upload_guest_photo(
    base64: str = Form(...),
    mime_type: str = Form(...),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    try:
        # Decode base64
        image_data = base64.b64decode(base64)
        media_id = uuid.uuid4().hex[:12]
        key = f"uploads/guests/{media_id}.{mime_type.split('/')[-1]}"
        storage = get_storage()
        storage.write(key, image_data)
        # For local storage, return the local URL
        url = f"/api/upload/serve/{key}"
        return UploadResponse(url=url, media_id=media_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro no upload: {str(e)}")


@router.post("/events/{event_id}/couple-photo", response_model=UploadResponse)
async def upload_couple_photo(
    event_id: uuid.UUID,
    base64: str = Form(...),
    mime_type: str = Form(...),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    try:
        image_data = base64.b64decode(base64)
        media_id = uuid.uuid4().hex[:12]
        key = f"events/{event_id}/couple/{media_id}.{mime_type.split('/')[-1]}"
        storage = get_storage()
        storage.write(key, image_data)
        url = f"/api/upload/serve/{key}"
        return UploadResponse(url=url, media_id=media_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro no upload: {str(e)}")


@router.get("/serve/{path:path}")
async def serve_file(path: str):
    from fastapi.responses import FileResponse
    import os
    storage = get_storage()
    # For local storage, path is relative to storage root
    full_path = storage.get_path(path)
    if not full_path or not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(full_path)