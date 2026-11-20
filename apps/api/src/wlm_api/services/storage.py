import os
import shutil
from pathlib import Path
from typing import Optional, BinaryIO
from ....config import get_settings


class LocalStorage:
    def __init__(self, root: str = "./storage"):
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def write(self, key: str, data: bytes) -> None:
        path = self.root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def read(self, key: str) -> bytes:
        path = self.root / key
        if not path.exists():
            raise FileNotFoundError(f"File not found: {key}")
        return path.read_bytes()

    def exists(self, key: str) -> bool:
        path = self.root / key
        return path.exists()

    def delete(self, key: str) -> None:
        path = self.root / key
        if path.exists():
            path.unlink()

    def get_path(self, key: str) -> Optional[Path]:
        path = self.root / key
        return path if path.exists() else None

    def get_url(self, key: str) -> str:
        return f"/api/upload/serve/{key}"


class SupabaseStorage:
    def __init__(self):
        self.settings = get_settings()
        self._client = None

    @property
    def client(self):
        if self._client is None and self.settings.supabase_url and self.settings.supabase_service_key:
            from supabase import create_client
            self._client = create_client(self.settings.supabase_url, self.settings.supabase_service_key)
        return self._client

    def write(self, key: str, data: bytes) -> None:
        if not self.client:
            raise RuntimeError("Supabase not configured")
        self.client.storage.from_(self.settings.supabase_bucket).upload(
            key, data, {"content-type": "image/jpeg", "upsert": "true"}
        )

    def read(self, key: str) -> bytes:
        if not self.client:
            raise RuntimeError("Supabase not configured")
        return self.client.storage.from_(self.settings.supabase_bucket).download(key)

    def exists(self, key: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.storage.from_(self.settings.supabase_bucket).download(key)
            return True
        except Exception:
            return False

    def delete(self, key: str) -> None:
        if not self.client:
            return
        self.client.storage.from_(self.settings.supabase_bucket).remove([key])

    def get_path(self, key: str) -> Optional[Path]:
        # Supabase doesn't support local paths
        return None

    def get_url(self, key: str) -> str:
        if not self.client:
            raise RuntimeError("Supabase not configured")
        return self.client.storage.from_(self.settings.supabase_bucket).get_public_url(key)


_storage_instance = None


def get_storage() -> LocalStorage | SupabaseStorage:
    global _storage_instance
    if _storage_instance is None:
        settings = get_settings()
        if settings.supabase_url and settings.supabase_service_key:
            _storage_instance = SupabaseStorage()
        else:
            _storage_instance = LocalStorage()
    return _storage_instance