"""
Admin Service
==============
Contains the BUSINESS LOGIC for admin operations.

This is the brain that:
- Computes dashboard statistics (counts across all entities)
- Approves or rejects property listings (with reason if rejected)
- Activates or deactivates user accounts
- Lists all users/properties for admin views

All functions assume the caller is already verified as admin
(via the require_admin dependency in the endpoint layer).
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User
from app.models.property import Property
from app.repositories import property_repository, user_repository
from app.schemas.admin import PropertyApprovalRequest, UserActivationRequest
from app.core.constants import UserRole, ListingStatus


# ── Dashboard Operations ──────────────────────────────────────────────────────

def get_dashboard_stats(db: Session) -> dict:
    """
    Compute all statistics for the admin dashboard.

    Uses aggregate queries (COUNT) for efficient computation.

    Returns:
        Dict with user counts, property counts by status, etc.
    """
    # ── User Counts ──────────────────────────────────────────
    total_users = db.query(func.count(User.id)).scalar() or 0

    total_agents = (
        db.query(func.count(User.id))
        .filter(User.role == UserRole.AGENT.value)
        .scalar() or 0
    )

    total_admins = (
        db.query(func.count(User.id))
        .filter(User.role == UserRole.ADMIN.value)
        .scalar() or 0
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active == True)
        .scalar() or 0
    )

    # ── Property Counts ──────────────────────────────────────
    total_properties = db.query(func.count(Property.id)).scalar() or 0

    pending_properties = (
        db.query(func.count(Property.id))
        .filter(Property.listing_status == ListingStatus.PENDING.value)
        .scalar() or 0
    )

    approved_properties = (
        db.query(func.count(Property.id))
        .filter(Property.listing_status == ListingStatus.APPROVED.value)
        .scalar() or 0
    )

    rejected_properties = (
        db.query(func.count(Property.id))
        .filter(Property.listing_status == ListingStatus.REJECTED.value)
        .scalar() or 0
    )

    return {
        "total_users": total_users,
        "total_agents": total_agents,
        "total_admins": total_admins,
        "active_users": active_users,
        "total_properties": total_properties,
        "pending_properties": pending_properties,
        "approved_properties": approved_properties,
        "rejected_properties": rejected_properties,
        "total_inquiries": 0,    # Will populate when we build inquiry feature
    }


# ── User Management ───────────────────────────────────────────────────────────

def list_all_users_paginated(
    db: Session,
    page: int = 1,
    limit: int = 12,
) -> dict:
    """
    List all users on the platform.

    Returns paginated results suitable for an admin user-management table.
    """
    skip = (page - 1) * limit

    users = user_repository.list_users(db=db, skip=skip, limit=limit)
    total = user_repository.count_users(db)

    total_pages = (total + limit - 1) // limit if limit > 0 else 0

    return {
        "items": users,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


def update_user_activation(
    db: Session,
    user_id: UUID,
    activation_data: UserActivationRequest,
) -> User:
    """
    Activate or deactivate a user account.

    Soft delete pattern:
    - Setting is_active=False prevents login but preserves all their data
    - Setting is_active=True reactivates the account

    Args:
        db:              Active database session
        user_id:         Target user's UUID
        activation_data: Contains is_active boolean

    Returns:
        The updated User object

    Raises:
        HTTPException 404: User doesn't exist
    """
    user = user_repository.get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.is_active = activation_data.is_active
    db.commit()
    db.refresh(user)
    return user


# ── Property Management ───────────────────────────────────────────────────────

def list_all_properties_paginated(
    db: Session,
    page: int = 1,
    limit: int = 12,
    listing_status: Optional[str] = None,
) -> dict:
    """
    List ALL properties on the platform (any status).

    Admins see pending, approved, AND rejected listings.
    Optionally filter by listing_status for dedicated review queues.

    Args:
        db:             Active database session
        page:           Page number
        limit:          Items per page
        listing_status: Optional filter (e.g., 'pending' for review queue)
    """
    skip = (page - 1) * limit

    query = db.query(Property).order_by(Property.created_at.desc())

    if listing_status:
        query = query.filter(Property.listing_status == listing_status)

    properties = query.offset(skip).limit(limit).all()

    # Count total (with same filter)
    count_query = db.query(func.count(Property.id))
    if listing_status:
        count_query = count_query.filter(Property.listing_status == listing_status)
    total = count_query.scalar() or 0

    total_pages = (total + limit - 1) // limit if limit > 0 else 0

    return {
        "items": properties,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


def review_property(
    db: Session,
    property_id: UUID,
    approval_data: PropertyApprovalRequest,
) -> Property:
    """
    Approve or reject a property listing.

    Business rules:
    - Property must exist
    - If rejecting, a rejection_reason is REQUIRED
    - Approving clears any previous rejection_reason

    Args:
        db:            Active database session
        property_id:   Property to review
        approval_data: New status + optional rejection reason

    Returns:
        The updated Property

    Raises:
        HTTPException 404: Property doesn't exist
        HTTPException 400: Rejecting without a reason
    """
    prop = property_repository.get_property_by_id(
        db, property_id, include_relations=False
    )

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    new_status = approval_data.listing_status.value

    # Business rule: rejections require a reason
    if new_status == ListingStatus.REJECTED.value:
        if not approval_data.rejection_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A rejection reason is required when rejecting a property.",
            )
        prop.rejection_reason = approval_data.rejection_reason
    else:
        # Clear rejection reason if approving (or any other status)
        prop.rejection_reason = None

    prop.listing_status = new_status
    db.commit()
    db.refresh(prop)
    return prop