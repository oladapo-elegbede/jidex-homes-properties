"""
Property Repository
====================
Handles ALL database operations related to properties.

This file contains 9 query functions covering:
- Reading (get by id, list public, list by agent, count)
- Writing (create, update, delete)
- Utility (increment view count)

Key features:
- Dynamic query building (filters added based on user input)
- Eager loading (loads images + agent in ONE query, not many)
- Pagination support (skip/limit)
- Multiple sort options

This is the ONLY file that talks to the DB for Property operations.
Services and routes never write SQL directly.
"""

from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc

from app.models.property import Property
from app.models.property_image import PropertyImage
from app.core.constants import ListingStatus, SortOrder, PropertySortBy


# ── Read Operations ───────────────────────────────────────────────────────────

def get_property_by_id(
    db: Session,
    property_id: UUID,
    include_relations: bool = True,
) -> Optional[Property]:
    """
    Retrieve a single property by its UUID.

    Args:
        db:                Active database session
        property_id:       Property's UUID
        include_relations: If True, eagerly loads agent + images (1 query total)

    Returns:
        Property object if found, None if not found

    Why eager loading?
        Without it:  property.images triggers extra query (N+1 problem!)
        With it:    everything loaded in ONE query (much faster)
    """
    query = db.query(Property)

    if include_relations:
        # joinedload tells SQLAlchemy to JOIN these tables and load everything
        # in a single query instead of lazy-loading later
        query = query.options(
            joinedload(Property.agent),         # Load the agent (User) in same query
            joinedload(Property.images),        # Load all images in same query
        )

    return query.filter(Property.id == property_id).first()


def list_public_properties(
    db: Session,
    skip: int = 0,
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
) -> List[Property]:
    """
    List APPROVED, AVAILABLE properties with optional filters.

    Used by public browsing endpoints. Only shows properties:
    - listing_status = "approved" (admin-approved)
    - We do NOT filter by availability here — frontend can show sold listings too

    All filter parameters are OPTIONAL. The query dynamically adds
    filters only for parameters that were actually provided.

    Args:
        db:            Active database session
        skip:          Pagination offset
        limit:         Page size
        city:          Filter by city name (exact match)
        min_price:     Minimum price filter
        max_price:     Maximum price filter
        property_type: Filter by type (apartment, house, etc.)
        listing_type:  Filter by 'sale' or 'rent'
        bedrooms:      Minimum bedrooms (>=)
        bathrooms:     Minimum bathrooms (>=)
        sort_by:       Field to sort by (created_at, price, bedrooms, area_sqft)
        sort_order:    'asc' or 'desc'

    Returns:
        List of Property objects matching the filters
    """
    # Start with base query — only show approved listings to public
    query = db.query(Property).filter(
        Property.listing_status == ListingStatus.APPROVED.value
    )

    # Eagerly load images so frontend can display thumbnails
    query = query.options(joinedload(Property.images))

    # ── Dynamic Filters ──────────────────────────────────────
    # Each filter is only applied if the user provided that parameter

    if city:
        # ilike = case-insensitive LIKE (so "Lagos" matches "lagos", "LAGOS")
        query = query.filter(Property.city.ilike(f"%{city}%"))

    if min_price is not None:
        query = query.filter(Property.price >= min_price)

    if max_price is not None:
        query = query.filter(Property.price <= max_price)

    if property_type:
        query = query.filter(Property.property_type == property_type)

    if listing_type:
        query = query.filter(Property.listing_type == listing_type)

    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)

    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)

    # ── Sorting ──────────────────────────────────────────────
    # Get the column to sort by (default: created_at)
    sort_column = getattr(Property, sort_by, Property.created_at)

    # Apply ascending or descending order
    if sort_order == SortOrder.ASC.value:
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # ── Pagination ───────────────────────────────────────────
    return query.offset(skip).limit(limit).all()


def count_public_properties(
    db: Session,
    city: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    property_type: Optional[str] = None,
    listing_type: Optional[str] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
) -> int:
    """
    Count APPROVED properties matching the same filters.

    Used for pagination metadata (total pages, has_next, etc.).
    Takes the same filters as list_public_properties for consistency.

    Returns:
        Total count of matching properties
    """
    query = db.query(func.count(Property.id)).filter(
        Property.listing_status == ListingStatus.APPROVED.value
    )

    # Apply the same filters as the list function
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if listing_type:
        query = query.filter(Property.listing_type == listing_type)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)

    # .scalar() returns the single count value (not a row)
    return query.scalar() or 0


def list_agent_properties(
    db: Session,
    agent_id: UUID,
    skip: int = 0,
    limit: int = 12,
) -> List[Property]:
    """
    List ALL properties owned by a specific agent.

    Unlike list_public_properties, this returns properties of ALL statuses
    (pending, approved, rejected) — agents need to see everything they own.

    Args:
        db:       Active database session
        agent_id: The agent's UUID
        skip:     Pagination offset
        limit:    Page size

    Returns:
        List of Property objects owned by this agent
    """
    return (
        db.query(Property)
        .options(joinedload(Property.images))
        .filter(Property.agent_id == agent_id)
        .order_by(desc(Property.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_agent_properties(db: Session, agent_id: UUID) -> int:
    """
    Count total properties owned by an agent.

    Used for the agent dashboard pagination and stats.
    """
    return (
        db.query(func.count(Property.id))
        .filter(Property.agent_id == agent_id)
        .scalar()
        or 0
    )


# ── Write Operations ──────────────────────────────────────────────────────────

def create_property(
    db: Session,
    agent_id: UUID,
    **property_data,
) -> Property:
    """
    Insert a new property into the database.

    Args:
        db:            Active database session
        agent_id:      The agent who owns this listing (from JWT)
        property_data: All property fields (title, price, etc.) as kwargs

    Returns:
        The newly created Property object

    Note:
        - listing_status defaults to 'pending' (from the model default)
        - availability_status defaults to 'available' (from the model default)
        - The service layer should not override these defaults
    """
    new_property = Property(
        agent_id=agent_id,
        **property_data,
    )

    db.add(new_property)
    db.commit()
    db.refresh(new_property)

    return new_property


def update_property(
    db: Session,
    property_obj: Property,
    **updates,
) -> Property:
    """
    Update fields on an existing property.

    Args:
        db:           Active database session
        property_obj: Existing Property object (already loaded from DB)
        updates:      Keyword arguments of fields to update

    Returns:
        The updated Property object

    Note:
        - Caller is responsible for ownership verification
        - We update only fields that are provided (skip None values)
        - This supports partial updates
    """
    for field, value in updates.items():
        # Only update fields that exist on the model and are not None
        if hasattr(property_obj, field) and value is not None:
            setattr(property_obj, field, value)

    db.commit()
    db.refresh(property_obj)
    return property_obj


def delete_property(db: Session, property_obj: Property) -> None:
    """
    Delete a property from the database.

    Args:
        db:           Active database session
        property_obj: The Property object to delete

    Note:
        Cascade delete removes all related images automatically
        (configured in the PropertyImage model with ondelete='CASCADE')
    """
    db.delete(property_obj)
    db.commit()


# ── Utility Operations ────────────────────────────────────────────────────────

def increment_view_count(db: Session, property_obj: Property) -> Property:
    """
    Increment the view_count on a property.

    Called when a user views the property detail page.
    Used for analytics and "popular listings" features.

    Args:
        db:           Active database session
        property_obj: The Property being viewed

    Returns:
        Updated Property with new view_count
    """
    property_obj.view_count = (property_obj.view_count or 0) + 1
    db.commit()
    db.refresh(property_obj)
    return property_obj