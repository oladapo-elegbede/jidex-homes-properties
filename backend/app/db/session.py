"""
Database Session Management
============================
Provides the SQLAlchemy engine and session factory.

Key concepts:
- Engine:  The connection to PostgreSQL (think of it as the database "pipe")
- Session: A unit of work with the database (open → query → commit → close)

The get_db dependency is used in FastAPI route functions
to provide a fresh database session per request.

Connection lifecycle per request:
    1. Request arrives at route
    2. get_db() creates a new session
    3. Route handler uses the session
    4. Response is sent
    5. Session is automatically closed (even if an error occurred)
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings


# ── Database Engine ───────────────────────────────────────────────────────────
#
# The engine is the entry point to the database.
# It manages a "connection pool" — a set of connections kept ready for use.
#
# Why a pool?
# - Opening a database connection is SLOW (network handshake, auth, etc.)
# - The pool keeps connections open and reuses them
# - Result: queries are much faster
#
# Settings explained:
# - pool_pre_ping=True   → Test connections before use (handles network drops)
# - pool_size=10         → Keep 10 connections open by default
# - max_overflow=20      → Allow up to 20 EXTRA connections under heavy load
# - echo=settings.DEBUG  → Print SQL queries in dev mode (great for debugging)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)


# ── Session Factory ───────────────────────────────────────────────────────────
#
# SessionLocal is a FACTORY that creates new Session objects.
# Each call to SessionLocal() returns a brand new session.
#
# Settings explained:
# - autocommit=False      → We manually commit transactions (safer)
# - autoflush=False       → We manually flush when needed (predictable)
# - expire_on_commit=False → Objects stay accessible after commit
#                           (otherwise SQLAlchemy invalidates them)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# ── FastAPI Dependency ────────────────────────────────────────────────────────
#
# This function is THE STAR of the file.
#
# FastAPI calls it before every request that needs the database.
# It creates a fresh session, hands it to the route, then closes it.
#
# Why a generator (yield instead of return)?
# - yield = "pause here, give the value, resume when done"
# - This allows us to do CLEANUP after the request completes
# - The try/finally guarantees the session is closed even if errors occur

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session per request.

    Usage in a route:
        @router.get("/users")
        def list_users(db: Session = Depends(get_db)):
            return db.query(User).all()
            # When the function returns, db is automatically closed

    The try/finally pattern ensures the session is ALWAYS closed,
    preventing connection pool leaks.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()