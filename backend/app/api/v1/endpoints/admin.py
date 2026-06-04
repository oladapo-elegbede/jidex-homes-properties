"""
Admin Endpoints
================
HTTP routes for platform administration.

All endpoints in this file require admin authentication (enforced
by the AdminUser dependency).

Endpoints:
- GET  /admin/dashboard                       → Platform statistics
- GET  /admin/users                            → List all users
- PUT  /admin/users/{id}                       → Activate/deactivate user
- GET  /admin/properties                       → List all properties (any status)
- PUT  /admin/properties/{id}/approval         → Approve/reject a listing
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import AdminUser
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse
from app.schemas.admin import (
    AdminDashboardStats,
    PropertyApprovalRequest,
    UserActivationRequest,
)
from app.services import admin_service


# ── Router Setup ──────────────────────────────────────────────────────────────
router = APIRouter(prefix="/admin", tags=["Admin"])


# ── GET /admin/dashboard ──────────────────────────────────────────────────────
@router.get(
    "/dashboard",
    response_model=AdminDashboardStats,
    status_code=status.HTTP_200_OK,
    summary="Get platform statistics",
    description=(
        "Returns aggregate statistics about the platform: total users, "
        "agents, properties, and counts by status. "
        "Used to populate the admin dashboard overview."
    ),
)
def get_dashboard(
    admin: AdminUser,
    db: Session = Depends(get_db),
) -> AdminDashboardStats:
    """
    Get platform-wide statistics for the admin dashboard.
    """
    stats = admin_service.get_dashboard_stats(db)
    return AdminDashboardStats(**stats)


# ── GET /admin/users ──────────────────────────────────────────────────────────
@router.get(
    "/users",
    status_code=status.HTTP_200_OK,
    summary="List all users",
    description=(
        "Returns a paginated list of all users on the platform. "
        "Admins see all accounts (active and deactivated)."
    ),
)
def list_users(
    admin: AdminUser,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
) -> dict:
    """
    List all platform users (paginated).
    """
    return admin_service.list_all_users_paginated(db=db, page=page, limit=limit)


# ── PUT /admin/users/{id} ─────────────────────────────────────────────────────
@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Activate or deactivate a user",
    description=(
        "Soft delete pattern: deactivated users cannot log in but their "
        "data is preserved. Can be reactivated later."
    ),
)
def update_user_activation(
    user_id: UUID,
    activation_data: UserActivationRequest,
    admin: AdminUser,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Activate (is_active=True) or deactivate (is_active=False) a user account.
    """
    updated_user = admin_service.update_user_activation(
        db=db,
        user_id=user_id,
        activation_data=activation_data,
    )
    return UserResponse.model_validate(updated_user)


# ── GET /admin/properties ─────────────────────────────────────────────────────
@router.get(
    "/properties",
    status_code=status.HTTP_200_OK,
    summary="List all properties (any status)",
    description=(
        "Returns all property listings on the platform regardless of status. "
        "Optionally filter by listing_status='pending' to get the review queue."
    ),
)
def list_properties(
    admin: AdminUser,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=100),
    listing_status: Optional[str] = Query(
        default=None,
        description="Filter by status: 'pending', 'approved', or 'rejected'.",
    ),
) -> dict:
    """
    List all properties (any status) for admin review.

    Common use case: ?listing_status=pending to see the review queue.
    """
    return admin_service.list_all_properties_paginated(
        db=db,
        page=page,
        limit=limit,
        listing_status=listing_status,
    )


# ── PUT /admin/properties/{id}/approval ───────────────────────────────────────
@router.put(
    "/properties/{property_id}/approval",
    response_model=PropertyResponse,
    status_code=status.HTTP_200_OK,
    summary="Approve or reject a property listing",
    description=(
        "Reviews a property listing. Set listing_status='approved' to make "
        "it visible to the public. Set listing_status='rejected' with a "
        "rejection_reason (required) to hide it from public view."
    ),
)
def review_property(
    property_id: UUID,
    approval_data: PropertyApprovalRequest,
    admin: AdminUser,
    db: Session = Depends(get_db),
) -> PropertyResponse:
    """
    Approve or reject a property listing.

    Business rule: If rejecting, a rejection_reason is required.
    """
    updated_property = admin_service.review_property(
        db=db,
        property_id=property_id,
        approval_data=approval_data,
    )
    return PropertyResponse.model_validate(updated_property)