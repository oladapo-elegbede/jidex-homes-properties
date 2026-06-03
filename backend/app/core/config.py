"""
Application Configuration
=========================
Centralizes all environment-based configuration using Pydantic Settings.

Pydantic Settings automatically:
- Reads values from .env file
- Validates each value's type
- Crashes loudly at startup if anything is missing or wrong

This is the single source of truth for ALL configuration in our app.

Why this matters:
- No hardcoded values scattered across the codebase
- Easy to change settings without touching code
- Type-safe (you can't accidentally use a number as a string)
- Production-ready pattern used by professional teams
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Each field declared here must have a corresponding entry in .env
    Pydantic enforces the types automatically.
    """

    # ── Application ──────────────────────────────────────────
    APP_NAME: str = "Jidex Homes & Properties"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT Authentication ────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # ── CORS ──────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def allowed_origins_list(self) -> List[str]:
        """
        Parse the comma-separated ALLOWED_ORIGINS string into a list.

        Why a property?
        - .env files only support string values
        - But FastAPI's CORS middleware needs a Python list
        - This property converts the string into a list automatically

        Example:
            "http://localhost:5173,https://jidex.vercel.app"
            becomes:
            ["http://localhost:5173", "https://jidex.vercel.app"]
        """
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
        ]

    # ── First Admin Account ───────────────────────────────────
    FIRST_ADMIN_EMAIL: str = "admin@jidexhomes.com"
    FIRST_ADMIN_PASSWORD: str = "ChangeMe123!"
    FIRST_ADMIN_NAME: str = "Platform Admin"

    # ── Pydantic Settings Configuration ───────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",       # Ignore unknown env variables
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    @lru_cache means:
    - Settings are read from .env only ONCE (first call)
    - Subsequent calls return the same cached instance
    - This is both a performance optimization AND a correctness guarantee

    Usage anywhere in the app:
        from app.core.config import settings
        print(settings.APP_NAME)
        print(settings.DATABASE_URL)
    """
    return Settings()


# Convenience export — import this directly
settings = get_settings()