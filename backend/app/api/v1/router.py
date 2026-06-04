"""
API v1 Master Router
=====================
Combines all v1 endpoint routers into a single router.

This is where we register every endpoint module:
- auth.py         → /auth/*
- properties.py   → /properties/*
- agent_ops.py    → /agent/*
- (later) users.py     → /users/*
- (later) admin.py     → /admin/*

Then we mount this master router in main.py with prefix /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, properties, agent_ops


# ── Master v1 Router ──────────────────────────────────────────────────────────
api_v1_router = APIRouter()


# ── Include All Endpoint Routers ──────────────────────────────────────────────
api_v1_router.include_router(auth.router)
api_v1_router.include_router(properties.router)
api_v1_router.include_router(agent_ops.router)
# api_v1_router.include_router(users.router)         # later
# api_v1_router.include_router(admin.router)          # later