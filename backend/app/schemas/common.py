"""
Common Schemas
===============
Reusable Pydantic schemas used across the API.

The most important one is the response envelope, which gives
our API a consistent shape for ALL responses.

Why a consistent envelope?
- Frontend always knows what to expect
- Easy error handling (always check `success` field)
- Pagination is uniform across all list endpoints
- This is how production APIs are built (Stripe, GitHub, etc.)
"""

from typing import Generic, Optional, TypeVar, List
from pydantic import BaseModel, Field


# ── Generic Type Variable ─────────────────────────────────────────────────────
# T is a placeholder for "any type". This lets us reuse the same response
# schema for different data shapes:
#   - SuccessResponse[UserResponse]    → wraps a User
#   - SuccessResponse[List[Property]]  → wraps a list of Properties
T = TypeVar("T")


# ── Generic Success Response ──────────────────────────────────────────────────
class SuccessResponse(BaseModel, Generic[T]):
    """
    Standard envelope for ALL successful API responses.

    Example output:
        {
            "success": true,
            "message": "User registered successfully.",
            "data": { ... user object ... }
        }
    """
    success: bool = True
    message: str = "Success."
    data: Optional[T] = None


# ── Generic Error Response ────────────────────────────────────────────────────
class ErrorResponse(BaseModel):
    """
    Standard envelope for ALL error API responses.

    Example output:
        {
            "success": false,
            "message": "Email already registered.",
            "data": null,
            "errors": { "email": "This email is already in use." }
        }
    """
    success: bool = False
    message: str
    data: Optional[None] = None
    errors: Optional[dict] = None


# ── Pagination Metadata ───────────────────────────────────────────────────────
class PaginationMeta(BaseModel):
    """
    Metadata included with paginated list responses.

    Helps the frontend know:
    - How many total records exist
    - Which page they're on
    - Whether there's a next/previous page
    """
    total: int = Field(description="Total number of records across all pages.")
    page: int = Field(description="Current page number (1-indexed).")
    limit: int = Field(description="Number of records per page.")
    pages: int = Field(description="Total number of pages.")
    has_next: bool = Field(description="Whether a next page exists.")
    has_prev: bool = Field(description="Whether a previous page exists.")


# ── Generic Paginated Response ────────────────────────────────────────────────
class PaginatedResponse(BaseModel, Generic[T]):
    """
    Wrapper for paginated list endpoints.

    Example output:
        {
            "success": true,
            "message": "Properties retrieved successfully.",
            "data": {
                "items": [ ... ],
                "total": 240,
                "page": 1,
                "limit": 12,
                "pages": 20,
                "has_next": true,
                "has_prev": false
            }
        }
    """
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool