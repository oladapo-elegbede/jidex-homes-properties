"""
Property Schemas
=================
Pydantic schemas for Property-related API operations.

Schema patterns:
- *Base       → shared fields used by other schemas
- *Create     → fields needed to CREATE a new property (POST)
- *Update     → fields that can be UPDATED (PUT) — all optional
- *Response   → fields RETURNED to API caller (full detail)
- *ListItem   → minimal fields for list views (faster, less data)

Image schemas:
- PropertyImageResponse → returned to client

Why separate "ListItem" from "Response"?
- List views show many properties (need lightweight data)
- Detail views show one property (need full data)
- Smaller payloads = faster page loads
"""

from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.core.constants import (
    PropertyType,
    ListingType,
    AvailabilityStatus,
)


# ═══════════════════════════════════════════════════════════════════════════
# PROPERTY IMAGE SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

class PropertyImageResponse(BaseModel):
    """
    Schema for returning property image data.

    Used when returning property details that include images.
    """
    id: UUID
    image_url: str
    is_primary: bool
    sort_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ═══════════════════════════════════════════════════════════════════════════
# PROPERTY SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

# ── Shared Property Fields ───────────────────────────────────────────────────
class PropertyBase(BaseModel):
    """
    Fields common to multiple property schemas.

    Used as a base class to avoid repeating the same field definitions
    in PropertyCreate, PropertyUpdate, and PropertyResponse.
    """
    title: str = Field(
        min_length=10,
        max_length=255,
        description="Property listing title (min 10 chars to ensure descriptive titles).",
    )
    description: str = Field(
        min_length=50,
        description="Detailed property description (min 50 chars).",
    )
    price: Decimal = Field(
        gt=0,                        # gt = greater than (price must be > 0)
        description="Property price (in NGN). Must be positive.",
    )
    property_type: PropertyType = Field(
        description="Type of property (apartment, house, villa, etc.).",
    )
    listing_type: ListingType = Field(
        default=ListingType.SALE,
        description="Whether the listing is for sale or rent.",
    )
    bedrooms: int = Field(
        ge=0,                        # ge = greater than or equal to 0
        le=50,                       # le = less than or equal to 50 (sanity check)
        description="Number of bedrooms (0-50).",
    )
    bathrooms: int = Field(
        ge=0,
        le=50,
        description="Number of bathrooms (0-50).",
    )
    area_sqft: Optional[Decimal] = Field(
        default=None,
        gt=0,
        description="Property area in square feet (optional).",
    )
    address: str = Field(
        min_length=5,
        max_length=500,
        description="Full street address.",
    )
    city: str = Field(
        min_length=2,
        max_length=100,
        description="City where the property is located.",
    )
    state: str = Field(
        min_length=2,
        max_length=100,
        description="State/region.",
    )
    country: str = Field(
        default="Nigeria",
        min_length=2,
        max_length=100,
        description="Country (defaults to Nigeria).",
    )
    latitude: Optional[Decimal] = Field(
        default=None,
        ge=-90,                      # Latitude range
        le=90,
        description="Latitude coordinate (-90 to 90).",
    )
    longitude: Optional[Decimal] = Field(
        default=None,
        ge=-180,                     # Longitude range
        le=180,
        description="Longitude coordinate (-180 to 180).",
    )
    amenities: Optional[List[str]] = Field(
        default=None,
        description="List of amenities (e.g., ['Pool', 'Parking', 'Security']).",
    )


# ── Property Creation ────────────────────────────────────────────────────────
class PropertyCreate(PropertyBase):
    """
    Schema for creating a new property listing.

    Used by: POST /api/v1/agent/properties

    All fields from PropertyBase are required.
    The agent_id is set automatically from the JWT token (not from input).
    The listing_status defaults to 'pending' (set in the service layer).
    """
    pass    # All fields inherited from PropertyBase


# ── Property Update ──────────────────────────────────────────────────────────
class PropertyUpdate(BaseModel):
    """
    Schema for updating an existing property.

    Used by: PUT /api/v1/agent/properties/{id}

    All fields are OPTIONAL so the agent can update just one thing
    (e.g., only the price) without sending the entire listing.
    """
    title: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=255,
    )
    description: Optional[str] = Field(
        default=None,
        min_length=50,
    )
    price: Optional[Decimal] = Field(default=None, gt=0)
    property_type: Optional[PropertyType] = None
    listing_type: Optional[ListingType] = None
    bedrooms: Optional[int] = Field(default=None, ge=0, le=50)
    bathrooms: Optional[int] = Field(default=None, ge=0, le=50)
    area_sqft: Optional[Decimal] = Field(default=None, gt=0)
    address: Optional[str] = Field(default=None, min_length=5, max_length=500)
    city: Optional[str] = Field(default=None, min_length=2, max_length=100)
    state: Optional[str] = Field(default=None, min_length=2, max_length=100)
    country: Optional[str] = Field(default=None, min_length=2, max_length=100)
    latitude: Optional[Decimal] = Field(default=None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(default=None, ge=-180, le=180)
    amenities: Optional[List[str]] = None

    # Availability can be updated by the agent (marking as sold, etc.)
    # Listing status can NOT be updated by agent (only admin can approve/reject)
    availability_status: Optional[AvailabilityStatus] = None


# ── Lightweight Agent Info (for embedded display) ────────────────────────────
class PropertyAgentInfo(BaseModel):
    """
    Minimal agent info embedded in property responses.

    We DON'T return the full User object (would leak too much info).
    Just enough to display: name, email for contact, profile image.
    """
    id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ── Full Property Response (Detail View) ─────────────────────────────────────
class PropertyResponse(BaseModel):
    """
    Full property data returned for detail views.

    Used by: GET /api/v1/properties/{id}

    Contains all property fields + images + agent info.
    """
    id: UUID
    agent_id: UUID

    # Core fields
    title: str
    description: str
    price: Decimal
    property_type: str
    listing_type: str

    # Physical attributes
    bedrooms: int
    bathrooms: int
    area_sqft: Optional[Decimal] = None

    # Location
    address: str
    city: str
    state: str
    country: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

    # Status fields
    availability_status: str
    listing_status: str
    rejection_reason: Optional[str] = None

    # Engagement
    is_featured: bool
    view_count: int

    # Lists
    amenities: Optional[List[str]] = None
    images: List[PropertyImageResponse] = []

    # Agent info (loaded via relationship)
    agent: Optional[PropertyAgentInfo] = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Lightweight Property Response (List View) ────────────────────────────────
class PropertyListItem(BaseModel):
    """
    Lightweight property data for list views.

    Used by: GET /api/v1/properties (list all)

    Returns less data per property to keep responses small.
    Includes only the primary image, not all images.
    """
    id: UUID
    title: str
    price: Decimal
    property_type: str
    listing_type: str
    bedrooms: int
    bathrooms: int
    area_sqft: Optional[Decimal] = None
    city: str
    state: str
    availability_status: str
    is_featured: bool

    # Just the primary image URL (not the full list)
    primary_image_url: Optional[str] = Field(
        default=None,
        description="URL of the primary image for thumbnail display.",
    )

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)