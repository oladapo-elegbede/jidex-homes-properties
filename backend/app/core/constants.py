"""
Application Constants & Enumerations
=====================================
Defines all fixed values used across the application.

Why constants instead of inline strings?
- Prevents typos in status comparisons
- Makes refactoring safe (change in one place)
- Enables IDE autocomplete
- Self-documents valid options

Example of the problem we prevent:

    BAD — typo creates silent bug:
        if property.status == "appoved":   # typo!
            do_something()
        # This code never runs, but Python doesn't complain

    GOOD — IDE catches the error:
        if property.listing_status == ListingStatus.APPROVED:
            do_something()
        # If you typo ListingStatus.APRROVED, the IDE highlights it red
"""

from enum import Enum


# ── User Roles ───────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    """
    Platform user roles.

    Why (str, Enum)?
    - Inheriting from str means the value IS a string ("user", "agent", "admin")
    - It serializes correctly in JSON responses
    - It stores correctly in the database as a string
    - But still gives us all the safety of an Enum

    Usage:
        if user.role == UserRole.ADMIN:
            grant_admin_access()
    """
    USER = "user"
    AGENT = "agent"
    ADMIN = "admin"


# ── Listing Status ───────────────────────────────────────────────────────────
class ListingStatus(str, Enum):
    """
    Admin moderation status for a property listing.

    Flow:
        1. Agent creates listing  → PENDING (awaiting admin review)
        2. Admin reviews          → APPROVED (visible to public)
                                  → REJECTED (hidden, with reason)
    """
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# ── Availability Status ──────────────────────────────────────────────────────
class AvailabilityStatus(str, Enum):
    """
    Market availability status of a property.

    IMPORTANT: This is DIFFERENT from ListingStatus.
    A property can be APPROVED (admin OK'd it) but SOLD (no longer available).

    These are TWO separate concepts:
    - ListingStatus      → moderation state
    - AvailabilityStatus → market state
    """
    AVAILABLE = "available"
    SOLD = "sold"
    RENTED = "rented"


# ── Property Types ───────────────────────────────────────────────────────────
class PropertyType(str, Enum):
    """Types of properties available on the platform."""
    APARTMENT = "apartment"
    HOUSE = "house"
    VILLA = "villa"
    DUPLEX = "duplex"
    STUDIO = "studio"
    OFFICE = "office"
    LAND = "land"
    COMMERCIAL = "commercial"


# ── Listing Types ────────────────────────────────────────────────────────────
class ListingType(str, Enum):
    """Whether the property is for sale or rent."""
    SALE = "sale"
    RENT = "rent"


# ── Inquiry Status ───────────────────────────────────────────────────────────
class InquiryStatus(str, Enum):
    """
    Tracks the agent's handling of inquiries.

    Flow:
        1. User sends inquiry     → UNREAD
        2. Agent opens inquiry    → READ
        3. Agent responds         → RESPONDED
    """
    UNREAD = "unread"
    READ = "read"
    RESPONDED = "responded"


# ── File Upload Constants ────────────────────────────────────────────────────

# Allowed MIME types for property image uploads
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

# Allowed file extensions (used as backup check)
ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


# ── Pagination Defaults ──────────────────────────────────────────────────────

# Default page number for list endpoints
DEFAULT_PAGE = 1

# Default number of items per page
DEFAULT_PAGE_SIZE = 12

# Maximum items per page (prevents abuse — no one needs 10,000 items at once)
MAX_PAGE_SIZE = 100


# ── Sort Options ─────────────────────────────────────────────────────────────

class SortOrder(str, Enum):
    """Sort direction for list queries."""
    ASC = "asc"   # Smallest first
    DESC = "desc" # Largest first


class PropertySortBy(str, Enum):
    """Fields that properties can be sorted by."""
    CREATED_AT = "created_at"
    PRICE = "price"
    BEDROOMS = "bedrooms"
    AREA = "area_sqft"