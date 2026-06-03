"""
SQLAlchemy Declarative Base
============================
This module defines the base class that ALL ORM models inherit from.

Why a shared Base?
- All models must inherit from the same Base for SQLAlchemy to track them
- Alembic uses Base.metadata to detect schema changes for migrations
- It's the single source of truth for "what tables exist"

This is the pattern:
1. Models inherit from Base
2. Base is imported in alembic/env.py
3. Alembic reads Base.metadata to know what tables exist
4. Alembic generates migration files based on differences

If you create a new model and forget to import it where Base is used,
Alembic will NOT include it in migrations.
"""

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, DateTime
from datetime import datetime, timezone


# ── The Declarative Base ──────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.

    Every model that inherits from this class will:
    - Be tracked by SQLAlchemy's metadata
    - Be discoverable by Alembic for migrations
    - Have access to all SQLAlchemy ORM features

    Usage:
        class User(Base):
            __tablename__ = "users"
            id = Column(...)
    """
    pass


# ── Reusable Mixins ───────────────────────────────────────────────────────────

class TimestampMixin:
    """
    Adds created_at and updated_at columns to any model.

    Why a mixin instead of putting these on Base directly?
    - Not all tables need timestamps (junction tables, lookup tables)
    - Mixins allow opt-in rather than forcing it everywhere
    - Cleaner separation of concerns

    Usage:
        class User(Base, TimestampMixin):
            __tablename__ = "users"
            id = Column(...)
            # created_at and updated_at automatically added
    """

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        doc="Timestamp when this record was created (UTC).",
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        doc="Timestamp when this record was last updated (UTC).",
    )