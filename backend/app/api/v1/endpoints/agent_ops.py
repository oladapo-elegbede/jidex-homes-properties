"""
Agent Operations Endpoints
===========================
HTTP routes for agents to manage their own property listings and images.

All endpoints in this file:
- REQUIRE authentication (JWT token)
- REQUIRE the user to be an agent or admin
- ENFORCE ownership (agents can only modify their own listings)

Endpoints:
- GET    /agent/properties                              → List my listings
- GET    /agent/properties/{id}                         → Get one of my listings
- POST   /agent/properties                              → Create a new listing
- PUT    /agent/properties/{id}                         → Update my listing
- DELETE /agent/properties/{id}                         → Delete my listing
- POST   /agent/properties/{id}/images                  → Upload an image
- DELETE /agent/properties/{id}/images/{image_id}       → Delete an image
- PUT    /agent/properties/{id}/images/{image_id}/primary → Set image as primary
"""

from uuid import UUID
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    File,
    status,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import CurrentUser
from app.repositories import property_repository
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertyImageResponse,
)
from app.services import property_service, property_image_service
from app.core.constants import UserRole


# ── Router Setup ──────────────────────────────────────────────────────────────
router = APIRouter(prefix="/agent", tags=["Agent Operations"])


# ── Permission Helper ─────────────────────────────────────────────────────────
def _require_agent_role(current_user: CurrentUser) -> None:
    """
    Verify the user has agent or admin role.
    """
    if current_user.role not in (UserRole.AGENT.value, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent or admin access required.",
        )


# ═══════════════════════════════════════════════════════════════════════════
# PROPERTY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

# ── GET /agent/properties ─────────────────────────────────────────────────────
@router.get(
    "/properties",
    status_code=status.HTTP_200_OK,
    summary="List my property listings",
)
def list_my_properties(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
) -> dict:
    """
    List all listings owned by the current agent (any status).
    """
    _require_agent_role(current_user)

    return property_service.list_agent_properties_paginated(
        db=db,
        agent=current_user,
        page=page,
        limit=limit,
    )


# ── GET /agent/properties/{id} ────────────────────────────────────────────────
@router.get(
    "/properties/{property_id}",
    response_model=PropertyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get one of my property listings",
)
def get_my_property(
    property_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Get a single property owned by the current agent.
    Works for properties of any status.
    """
    _require_agent_role(current_user)

    prop = property_repository.get_property_by_id(db, property_id)

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    # Ownership check (admins can access any property)
    is_owner = prop.agent_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN.value

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this property.",
        )

    return PropertyResponse.model_validate(prop)


# ── POST /agent/properties ────────────────────────────────────────────────────
@router.post(
    "/properties",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new property listing",
)
def create_property(
    property_data: PropertyCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Create a new property listing.
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
)
def update_property(
    property_id: UUID,
    update_data: PropertyUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Update a property listing.
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
)
def delete_property(
    property_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> None:
    """
    Delete a property listing.
    """
    _require_agent_role(current_user)

    property_service.delete_agent_property(
        db=db,
        agent=current_user,
        property_id=property_id,
    )


# ═══════════════════════════════════════════════════════════════════════════
# IMAGE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

# ── POST /agent/properties/{id}/images ────────────────────────────────────────
@router.post(
    "/properties/{property_id}/images",
    response_model=PropertyImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an image to a property",
    description=(
        "Upload a property photo. Supported formats: JPEG, PNG, WebP. "
        "Maximum size: 5MB. Maximum 10 images per property. "
        "The first uploaded image becomes the primary (cover) image automatically."
    ),
)
async def upload_property_image(
    property_id: UUID,
    current_user: CurrentUser,
    file: UploadFile = File(..., description="The image file to upload"),
    db: Session = Depends(get_db),
) -> PropertyImageResponse:
    """
    Upload an image for a property.

    The file is:
    1. Validated (type, extension, size)
    2. Saved to disk with a UUID filename
    3. Recorded in the database
    4. Marked as primary if it's the first image

    Returns the created PropertyImage record.
    """
    _require_agent_role(current_user)

    # Read the file content into memory
    # (Required to check size and pass to service)
    file_bytes = await file.read()

    new_image = property_image_service.upload_property_image(
        db=db,
        user=current_user,
        property_id=property_id,
        file=file,
        file_bytes=file_bytes,
    )

    return PropertyImageResponse.model_validate(new_image)


# ── DELETE /agent/properties/{id}/images/{image_id} ───────────────────────────
@router.delete(
    "/properties/{property_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a property image",
    description=(
        "Removes both the file from disk and the database record. "
        "If the deleted image was the primary, another image is "
        "automatically promoted to primary."
    ),
)
def delete_property_image(
    property_id: UUID,
    image_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> None:
    """
    Delete an image from a property.
    """
    _require_agent_role(current_user)

    property_image_service.delete_property_image(
        db=db,
        user=current_user,
        property_id=property_id,
        image_id=image_id,
    )


# ── PUT /agent/properties/{id}/images/{image_id}/primary ──────────────────────
@router.put(
    "/properties/{property_id}/images/{image_id}/primary",
    response_model=PropertyImageResponse,
    status_code=status.HTTP_200_OK,
    summary="Set an image as the primary (cover) image",
    description=(
        "Marks the specified image as the primary image for the property. "
        "All other images for this property are automatically unset."
    ),
)
def set_primary_image(
    property_id: UUID,
    image_id: UUID,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> PropertyImageResponse:
    """
    Set an image as the primary/cover image.
    """
    _require_agent_role(current_user)

    updated_image = property_image_service.set_image_as_primary(
        db=db,
        user=current_user,
        property_id=property_id,
        image_id=image_id,
    )

    return PropertyImageResponse.model_validate(updated_image)