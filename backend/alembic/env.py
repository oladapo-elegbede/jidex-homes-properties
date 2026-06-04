"""
Alembic Migration Environment
==============================
Configures how Alembic connects to the database
and discovers our SQLAlchemy models.

Two migration modes:
- online:  Connected to a live database (used normally)
- offline: Generates SQL scripts without a connection (rarely used)

We use 'online' mode during development.
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# ── Add Project Root To Python Path ───────────────────────────────────────────
# This lets Alembic import our app modules from anywhere in the project.
# Without this line, "from app.core.config import settings" would fail.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ── Import Our Project Configuration ──────────────────────────────────────────
from app.core.config import settings
from app.db.base import Base

# ── Import All Models For Auto-Detection ──────────────────────────────────────
# Alembic compares Base.metadata to the current database state.
# Models must be imported so Base.metadata knows they exist.
# As we add more models, we import them here too.
import app.models  # noqa: F401


# ── Alembic Configuration Object ──────────────────────────────────────────────
config = context.config


# ── Inject Our Database URL From .env ─────────────────────────────────────────
# Instead of hardcoding the database URL in alembic.ini,
# we pull it from our settings (which reads from .env).
# This means: one source of truth for database connection.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


# ── Set Up Python Logging ─────────────────────────────────────────────────────
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ── Target Metadata ───────────────────────────────────────────────────────────
# This tells Alembic what schema to compare against.
# Base.metadata contains all tables registered with our Base class.
target_metadata = Base.metadata


# ── Offline Migration Mode ────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This generates SQL scripts without a database connection.
    Useful for reviewing what would happen before running it for real.

    Usage:
        alembic upgrade head --sql
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ── Online Migration Mode (the normal way) ────────────────────────────────────
def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    This actually connects to the database and applies changes.
    This is what runs when you do: alembic upgrade head
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# ── Decide Which Mode To Use ──────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
