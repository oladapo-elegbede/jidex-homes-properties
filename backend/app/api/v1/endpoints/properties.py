"""
Public Property Endpoints
==========================
HTTP routes for browsing properties (no authentication required).

Endpoints:
- GET /properties              → List all approved properties (with filters)
- GET /properties/{id}         → View a single property's full details

These are PUBLIC endpoints — anyone can browse listings.
The agent and admin operations live in agent_ops.py and admin.py.
"""

from typing import Optional
from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.property import PropertyResponse
from app.services import property_service


# ── Router Setup ──────────────────────────────────────────────────────────────
router = APIRouter(prefix="/properties", tags=["Properties"])


# ── GET /properties ───────────────────────────────────────────────────────────
@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="Browse properties with filters",
    description=(
        "List all approved properties on the marketplace. "
        "Supports filtering by location, price range, type, bedrooms, etc. "
        "Returns paginated results suitable for grid/list display."
    ),
)
def list_properties(
    db: Session = Depends(get_db),
    # ── Pagination params ────────────────────────────────────
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)."),
    limit: int = Query(default=12, ge=1, le=100, description="Items per page (max 100)."),

    # ── Filter params ────────────────────────────────────────
    city: Optional[str] = Query(default=None, description="Filter by city (case-insensitive)."),
    min_price: Optional[Decimal] = Query(default=None, ge=0, description="Minimum price filter."),
    max_price: Optional[Decimal] = Query(default=None, ge=0, description="Maximum price filter."),
    property_type: Optional[str] = Query(default=None, description="Filter by property type."),
    listing_type: Optional[str] = Query(default=None, description="Filter by 'sale' or 'rent'."),
    bedrooms: Optional[int] = Query(default=None, ge=0, description="Minimum bedrooms."),
    bathrooms: Optional[int] = Query(default=None, ge=0, description="Minimum bathrooms."),

    # ── Sort params ──────────────────────────────────────────
    sort_by: str = Query(
        default="created_at",
        description="Sort field: created_at, price, bedrooms, area_sqft.",
    ),
    sort_order: str = Query(
        default="desc",
        description="Sort direction: 'asc' or 'desc'.",
    ),
) -> dict:
    """
    Browse approved property listings.

    Returns paginated results with metadata:
    {
      "items": [ ...list of properties... ],
      "total": 240,
      "page": 1,
      "limit": 12,
      "pages": 20,
      "has_next": true,
      "has_prev": false
    }
    """
    return property_service.list_public_properties_paginated(
        db=db,
        page=page,
        limit=limit,
        city=city,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        listing_type=listing_type,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        sort_by=sort_by,
        sort_order=sort_order,
    )


# ── GET /properties/{id} ──────────────────────────────────────────────────────
@router.get(
    "/{property_id}",
    response_model=PropertyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get property details",
    description=(
        "Returns full details for a single property including images and agent info. "
        "Increments the view count as a side effect. "
        "Returns 404 if property doesn't exist or hasn't been approved."
    ),
)
def get_property(
    property_id: UUID,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Get full details of a single property.

    Only approved properties are accessible publicly.
    Pending/rejected properties return 404.
    """
    prop = property_service.get_public_property(db, property_id)
    return PropertyResponse.model_validate(prop)