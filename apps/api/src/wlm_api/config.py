import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "We Love Memory API"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = os.getenv(
        "DATABASE_URL", "sqlite+aiosqlite:///./wlm.db"
    )

    # Supabase
    supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
    supabase_service_key: Optional[str] = os.getenv("SUPABASE_SERVICE_KEY")
    supabase_bucket: str = "wlm-assets"

    # Redis / Queue
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # External AI API (placeholder)
    ai_api_url: Optional[str] = os.getenv("AI_API_URL")
    ai_api_key: Optional[str] = os.getenv("AI_API_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()