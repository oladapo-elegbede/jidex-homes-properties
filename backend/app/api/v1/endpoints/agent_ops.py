"""
Agent Operations Endpoints
===========================
HTTP routes for agents to manage their own property listings.

All endpoints in this file:
- REQUIRE authentication (JWT token)
- REQUIRE the user to be an agent or admin
- ENFORCE ownership (agents can only modify their own listings)

Endpoints:
- GET    /agent/properties              → List my listings
- POST   /agent/properties              → Create a new listing
- PUT    /agent/properties/{id}         → Update my listing
- DELETE /agent/properties/{id}         → Delete my listing
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import CurrentUser
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
)
from app.services import property_service
from app.core.constants import UserRole


# ── Router Setup ──────────────────────────────────────────────────────────────
router = APIRouter(prefix="/agent", tags=["Agent Operations"])


# ── Permission Helper ─────────────────────────────────────────────────────────
def _require_agent_role(current_user: CurrentUser) -> None:
    """
    Verify the user has agent or admin role.

    Used by every endpoint in this file. Regular users (role='user')
    cannot access agent operations.

    Raises:
        HTTPException 403: User is not an agent or admin
    """
    if current_user.role not in (UserRole.AGENT.value, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent or admin access required.",
        )


# ── GET /agent/properties ─────────────────────────────────────────────────────
@router.get(
    "/properties",
    status_code=status.HTTP_200_OK,
    summary="List my property listings",
    description=(
        "Returns all properties owned by the authenticated agent, "
        "including pending and rejected listings."
    ),
)
def list_my_properties(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
) -> dict:
    """
    List all listings owned by the current agent.

    Unlike the public endpoint, this returns properties of ALL statuses
    (pending, approved, rejected) so the agent can see everything.
    """
    _require_agent_role(current_user)

    return property_service.list_agent_properties_paginated(
        db=db,
        agent=current_user,
        page=page,
        limit=limit,
    )


# ── POST /agent/properties ────────────────────────────────────────────────────
@router.post(
    "/properties",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new property listing",
    description=(
        "Creates a new property owned by the authenticated agent. "
        "New listings start with status='pending' and become visible "
        "to the public only after admin approval."
    ),
)
def create_property(
    property_data: PropertyCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Create a new property listing.

    Flow:
    1. Verify user is agent/admin
    2. Pydantic validates the property data
    3. Service creates the property (agent_id from JWT, status='pending')
    4. Return the created property
    """
    _require_agent_role(current_user)

    new_property = property_service.create_property_for_agent(
        db=db,
        agent=current_user,
        property_data=property_data,
    )

    return PropertyResponse.model_validate(new_property)


# ── PUT /agent/properties/{id} ────────────────────────────────────────────────
@router.put(
    "/properties/{property_id}",
    response_model=PropertyResponse,
    status_code=status.HTTP_200_OK,
    summary="Update one of my property listings",
    description=(
        "Update fields on an existing property. "
        "Only the property's owner (or an admin) can update it. "
        "All fields are optional — only provided fields are updated."
    ),
)
def update_property(
    property_id: UUID,
    update_data: PropertyUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Update a property listing.

    Flow:
    1. Verify user is agent/admin
    2. Service verifies ownership (raises 403 if not owner)
    3. Service applies only the provided fields
    4. Return the updated property
    """
    _require_agent_role(current_user)

    updated = property_service.update_agent_property(
        db=db,
        agent=current_user,
        property_id=property_id,
        update_data=update_data,
    )

    return PropertyResponse.model_validate(updated)


# ── DELETE /agent/properties/{id} ─────────────────────────────────────────────
@router.delete(
    "/properties/{property_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete one of my property listings",
    description=(
        "Permanently delete a property. "
        "Only the owner (or an admin) can delete it. "
        "All associated images are also deleted (cascade)."
    ),
)
def delete_property(
    property_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> None:
    """
    Delete a property listing.

    Returns 204 No Content (no response body for deletes).
    """
    _require_agent_role(current_user)

    property_service.delete_agent_property(
        db=db,
        agent=current_user,
        property_id=property_id,
    )