"""
Property Service
================
Contains the BUSINESS LOGIC for property operations.

This is the brain that:
- Verifies ownership (agents can only edit their own listings)
- Enforces business rules (new properties start as pending)
- Coordinates between repository, schemas, and side effects
- Handles primary image lookup for list views

The router doesn't make decisions — it just calls these functions.
"""

from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.property import Property
from app.repositories import property_repository
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyListItem,
)
from app.core.constants import UserRole, ListingStatus


# ── Public Browsing Operations ────────────────────────────────────────────────

def get_public_property(db: Session, property_id: UUID) -> Property:
    """
    Get a single property for public viewing.

    Business rules:
    - Only APPROVED properties are visible to the public
    - Pending/rejected properties return 404 (don't leak their existence)
    - View count is incremented on each view (for analytics)

    Args:
        db:          Active database session
        property_id: Property UUID

    Returns:
        Property object with related images and agent

    Raises:
        HTTPException 404: Property doesn't exist or isn't approved
    """
    prop = property_repository.get_property_by_id(db, property_id)

    # Check existence AND approval status together
    # We return 404 for both cases — don't reveal that pending properties exist
    if prop is None or prop.listing_status != ListingStatus.APPROVED.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    # Increment view count as a side effect of viewing
    property_repository.increment_view_count(db, prop)

    return prop


def list_public_properties_paginated(
    db: Session,
    page: int = 1,
    limit: int = 12,
    city: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    property_type: Optional[str] = None,
    listing_type: Optional[str] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:
    """
    Browse public properties with filters and pagination.

    Returns:
        Dict with:
            items: List[PropertyListItem]  (lightweight)
            total: int                     (total matching count)
            page:  int
            limit: int
            pages: int                     (total pages)
            has_next: bool
            has_prev: bool
    """
    # Calculate database offset from page number
    skip = (page - 1) * limit

    # Fetch matching properties
    properties = property_repository.list_public_properties(
        db=db,
        skip=skip,
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

    # Count total matching properties (for pagination metadata)
    total = property_repository.count_public_properties(
        db=db,
        city=city,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        listing_type=listing_type,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
    )

    # Convert properties to lightweight list items
    items = [_to_list_item(prop) for prop in properties]

    # Calculate pagination metadata
    total_pages = (total + limit - 1) // limit if limit > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


# ── Agent Operations (CRUD on own listings) ───────────────────────────────────

def create_property_for_agent(
    db: Session,
    agent: User,
    property_data: PropertyCreate,
) -> Property:
    """
    Create a new property listing for an agent.

    Business rules:
    - agent_id is set automatically from the JWT (not user input)
    - listing_status defaults to 'pending' (set in the model)
    - availability_status defaults to 'available' (set in the model)

    Args:
        db:            Active database session
        agent:         Authenticated User (must be agent or admin)
        property_data: Validated PropertyCreate schema

    Returns:
        The newly created Property
    """
    # Convert Pydantic schema to dict for unpacking
    # mode="json" converts enums to their string values
    data_dict = property_data.model_dump(mode="json")

    # Repository creates the row with the agent_id baked in
    new_property = property_repository.create_property(
        db=db,
        agent_id=agent.id,
        **data_dict,
    )

    return new_property


def update_agent_property(
    db: Session,
    agent: User,
    property_id: UUID,
    update_data: PropertyUpdate,
) -> Property:
    """
    Update a property — only the OWNER can do this.

    Business rules:
    - Verify the property exists
    - Verify the agent owns this property (or is admin)
    - Apply only provided fields (partial updates)
    - Agents cannot change listing_status (only admin can)

    Args:
        db:          Active database session
        agent:       Authenticated User
        property_id: Property to update
        update_data: Validated PropertyUpdate schema

    Returns:
        The updated Property

    Raises:
        HTTPException 404: Property doesn't exist
        HTTPException 403: User doesn't own this property
    """
    # Fetch the property
    prop = property_repository.get_property_by_id(
        db, property_id, include_relations=False
    )

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    # Ownership check: agent must own it (admin can bypass)
    _verify_ownership(agent, prop)

    # Get only the fields that were actually provided (skip None values)
    # exclude_unset=True means: only include fields explicitly set by the user
    update_fields = update_data.model_dump(
        mode="json",
        exclude_unset=True,
    )

    return property_repository.update_property(db, prop, **update_fields)


def delete_agent_property(
    db: Session,
    agent: User,
    property_id: UUID,
) -> None:
    """
    Delete a property — only the OWNER can do this.

    Business rules:
    - Verify the property exists
    - Verify the agent owns this property (or is admin)
    - Cascade delete handles related images automatically

    Args:
        db:          Active database session
        agent:       Authenticated User
        property_id: Property to delete

    Raises:
        HTTPException 404: Property doesn't exist
        HTTPException 403: User doesn't own this property
    """
    prop = property_repository.get_property_by_id(
        db, property_id, include_relations=False
    )

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    _verify_ownership(agent, prop)

    property_repository.delete_property(db, prop)


def list_agent_properties_paginated(
    db: Session,
    agent: User,
    page: int = 1,
    limit: int = 12,
) -> dict:
    """
    List all properties owned by the current agent.

    Unlike public listing, this returns properties of ALL statuses
    so the agent can see their pending and rejected listings.
    """
    skip = (page - 1) * limit

    properties = property_repository.list_agent_properties(
        db=db,
        agent_id=agent.id,
        skip=skip,
        limit=limit,
    )

    total = property_repository.count_agent_properties(db, agent.id)
    items = [_to_list_item(prop) for prop in properties]
    total_pages = (total + limit - 1) // limit if limit > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


# ── Private Helper Functions ──────────────────────────────────────────────────

def _verify_ownership(user: User, prop: Property) -> None:
    """
    Verify that a user owns a property OR is an admin.

    Used as a permission check before update/delete operations.

    Args:
        user: The user attempting the operation
        prop: The property they're trying to modify

    Raises:
        HTTPException 403: User is not the owner and not an admin
    """
    is_owner = prop.agent_id == user.id
    is_admin = user.role == UserRole.ADMIN.value

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this property.",
        )


def _to_list_item(prop: Property) -> PropertyListItem:
    """
    Convert a Property object to a lightweight PropertyListItem.

    Extracts only the fields needed for list views and finds
    the primary image URL (if any).

    Args:
        prop: A Property object (with images loaded)

    Returns:
        PropertyListItem with just the essential display fields
    """
    # Find the primary image among loaded images
    primary_image_url = None
    if prop.images:
        # Look for image marked as primary
        primary = next((img for img in prop.images if img.is_primary), None)

        # Fallback: use first image if no primary is marked
        if primary is None:
            primary = prop.images[0]

        primary_image_url = primary.image_url

    return PropertyListItem(
        id=prop.id,
        title=prop.title,
        price=prop.price,
        property_type=prop.property_type,
        listing_type=prop.listing_type,
        bedrooms=prop.bedrooms,
        bathrooms=prop.bathrooms,
        area_sqft=prop.area_sqft,
        city=prop.city,
        state=prop.state,
        availability_status=prop.availability_status,
        is_featured=prop.is_featured,
        primary_image_url=primary_image_url,
        created_at=prop.created_at,
    )