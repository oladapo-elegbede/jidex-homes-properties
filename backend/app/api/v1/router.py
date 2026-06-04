"""
API v1 Master Router
=====================
Combines all v1 endpoint routers into a single router.

This is where we register every endpoint module:
- auth.py        → /auth/*
- (later) users.py     → /users/*
- (later) properties.py → /properties/*

Then we mount this master router in main.py with prefix /api/v1.

Result:
    Final URL structure:
        /api/v1/auth/register
        /api/v1/auth/login
        /api/v1/auth/me
        /api/v1/users/...    (later)
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth


# ── Master v1 Router ──────────────────────────────────────────────────────────
api_v1_router = APIRouter()


# ── Include All Endpoint Routers ──────────────────────────────────────────────
# As we add more endpoint files, we include them here:
api_v1_router.include_router(auth.router)
# api_v1_router.include_router(users.router)         # later
# api_v1_router.include_router(properties.router)    # later