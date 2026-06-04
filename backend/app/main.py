"""
Jidex Homes & Properties — FastAPI Application
===============================================
Entry point of the backend API.

Responsibilities:
- Create and configure the FastAPI application instance
- Register CORS middleware (so the React frontend can call us)
- Include the v1 API router (all endpoints)
- Set up application metadata (title, description, version)

This file is intentionally THIN. Business logic lives in services,
data logic lives in repositories, validation lives in schemas.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_v1_router


# ── FastAPI Application Instance ──────────────────────────────────────────────
app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description=(
        "Premium Property Marketplace Platform API. "
        "Provides endpoints for property listings, user authentication, "
        "agent management, and platform administration."
    ),
    version="1.0.0",
    docs_url="/api/docs",          # Swagger UI: /api/docs
    redoc_url="/api/redoc",        # ReDoc UI:   /api/redoc
    openapi_url="/api/openapi.json",
)


# ── CORS Middleware ───────────────────────────────────────────────────────────
# CORS (Cross-Origin Resource Sharing) lets the React frontend
# (running on a different port) make requests to this API.
#
# Without CORS, browsers block frontend → backend communication for security.
# We read allowed origins from settings (which reads from .env).

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,        # Allow cookies and auth headers
    allow_methods=["*"],           # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],           # Allow all request headers
)


# ── Include API v1 Router ─────────────────────────────────────────────────────
# This single line mounts ALL v1 endpoints under /api/v1
# Final URL structure:
#   /api/v1/auth/register
#   /api/v1/auth/login
#   /api/v1/auth/me

app.include_router(api_v1_router, prefix="/api/v1")


# ── Root Endpoint ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def read_root():
    """
    Root endpoint — confirms the API is running.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": "1.0.0",
        "docs": "/api/docs",
    }


# ── Health Check Endpoint ─────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.

    Used by deployment platforms (Railway, Render) to verify
    the app is running and ready to receive traffic.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }