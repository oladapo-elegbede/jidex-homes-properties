"""
Admin Schemas
==============
Pydantic schemas for admin operations.

These schemas define the shapes of:
- Admin dashboard statistics
- Property approval/rejection requests
- User management updates

Admins have full visibility into platform data.
"""

from typing import Optional
from pydantic import BaseModel, Field

from app.core.constants import ListingStatus


# ── Dashboard Statistics ──────────────────────────────────────────────────────
class AdminDashboardStats(BaseModel):
    """
    Statistics shown on the admin dashboard.

    Used by: GET /api/v1/admin/dashboard

    Provides a quick health snapshot of the platform.
    """
    total_users: int = Field(description="Total user accounts on the platform.")
    total_agents: int = Field(description="Total accounts with the 'agent' role.")
    total_admins: int = Field(description="Total accounts with the 'admin' role.")
    active_users: int = Field(description="Users with is_active=True.")

    total_properties: int = Field(description="Total property listings (all statuses).")
    pending_properties: int = Field(description="Listings awaiting admin review.")
    approved_properties: int = Field(description="Listings approved and visible to public.")
    rejected_properties: int = Field(description="Listings rejected by admin.")

    total_inquiries: int = Field(default=0, description="Total inquiries sent.")


# ── Property Approval / Rejection ─────────────────────────────────────────────
class PropertyApprovalRequest(BaseModel):
    """
    Request body for approving or rejecting a property listing.

    Used by: PUT /api/v1/admin/properties/{id}/approval

    Business rule: If status is 'rejected', a rejection_reason is required.
    """
    listing_status: ListingStatus = Field(
        description="New listing status: 'approved' or 'rejected'.",
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=500,
        description="Reason for rejection (required if rejecting).",
    )


# ── User Management ───────────────────────────────────────────────────────────
class UserActivationRequest(BaseModel):
    """
    Request body for activating or deactivating a user account.

    Used by: PUT /api/v1/admin/users/{id}

    Deactivated users cannot log in (auth_service blocks them).
    Their data is preserved (soft delete pattern).
    """
    is_active: bool = Field(
        description="Set to False to deactivate, True to reactivate.",
    )