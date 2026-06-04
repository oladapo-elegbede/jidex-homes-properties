"""
Property Model
===============
Represents a real estate listing on the Jidex Homes platform.

This is the central business entity of the marketplace.
Every property listing is a row in this table.

Design decisions:
- UUID primary key (security + scalability)
- agent_id foreign key links to the User who owns the listing
- NUMERIC for price (NEVER use FLOAT for money — precision matters)
- Separate listing_status (admin moderation) vs availability_status (market state)
- TEXT[] array for amenities (PostgreSQL native array type)
- Latitude/longitude included now (cheap to add, painful to retrofit later)
- view_count for analytics and "popular listings" features
- Multiple indexes for fast filtering (city, price, bedrooms, etc.)
"""

import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    Numeric,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.core.constants import (
    PropertyType,
    ListingType,
    AvailabilityStatus,
    ListingStatus,
)


class Property(Base, TimestampMixin):
    """
    Database model for property listings.

    Relationships:
        Property ──── User (agent)         many-to-one
        Property ──── PropertyImage[]      one-to-many

    Table: properties
    """

    # ── Table Name ────────────────────────────────────────────
    __tablename__ = "properties"

    # ── Primary Key ───────────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        doc="Unique identifier (UUID) for this property.",
    )

    # ── Owner (Agent) Foreign Key ─────────────────────────────
    # The agent who created/owns this listing.
    # ondelete CASCADE: if the agent's account is deleted, their listings go too.
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,        # Agents frequently query their own listings
        doc="Foreign key to the agent (User) who owns this listing.",
    )

    # ── Core Information ──────────────────────────────────────
    title = Column(
        String(255),
        nullable=False,
        doc="Property listing title (e.g., 'Luxury 3-Bedroom Apartment in Lekki').",
    )

    description = Column(
        Text,                  # Unlimited length for detailed descriptions
        nullable=False,
        doc="Detailed property description.",
    )

    # ── Pricing ───────────────────────────────────────────────
    # NUMERIC(15, 2) means:
    #   15 total digits maximum
    #   2 digits after the decimal point
    # Max value: 9,999,999,999,999.99 (over 9 trillion!)
    #
    # 🚨 NEVER use FLOAT for money:
    #   - FLOAT has rounding errors (0.1 + 0.2 = 0.30000000000000004)
    #   - These errors compound and corrupt financial calculations
    #   - NUMERIC is exact decimal arithmetic — required for any money

    price = Column(
        Numeric(15, 2),
        nullable=False,
        index=True,            # Indexed for price range filtering
        doc="Property price in NGN. Uses NUMERIC for financial precision.",
    )

    # ── Property Classification ───────────────────────────────
    property_type = Column(
        String(50),
        nullable=False,
        index=True,            # Filter by type is very common
        doc=(
            "Type of property: apartment, house, villa, duplex, studio, "
            "office, land, or commercial."
        ),
    )

    listing_type = Column(
        String(20),
        nullable=False,
        default=ListingType.SALE.value,
        index=True,            # Filter by sale/rent is very common
        doc="Whether the listing is for 'sale' or 'rent'.",
    )

    # ── Physical Attributes ───────────────────────────────────
    bedrooms = Column(
        Integer,
        nullable=False,
        default=0,
        index=True,            # Filter by bedroom count
        doc="Number of bedrooms (0 for land/office/etc.).",
    )

    bathrooms = Column(
        Integer,
        nullable=False,
        default=0,
        doc="Number of bathrooms.",
    )

    # Area in square feet. NUMERIC for accuracy, nullable because some
    # listings (like land) may use different measurements.
    area_sqft = Column(
        Numeric(10, 2),
        nullable=True,
        doc="Property area in square feet.",
    )

    # ── Location ──────────────────────────────────────────────
    address = Column(
        String(500),
        nullable=False,
        doc="Full street address.",
    )

    city = Column(
        String(100),
        nullable=False,
        index=True,            # The MOST common search filter
        doc="City where the property is located.",
    )

    state = Column(
        String(100),
        nullable=False,
        doc="State/region.",
    )

    country = Column(
        String(100),
        nullable=False,
        default="Nigeria",
        doc="Country (defaults to Nigeria).",
    )

    # Geographic coordinates for future Google Maps integration.
    # NUMERIC(10, 7) gives enough precision:
    #   - 7 decimal places = accuracy of ~1.1 cm at the equator
    # Nullable because agents may not provide exact coordinates.
    latitude = Column(
        Numeric(10, 7),
        nullable=True,
        doc="Latitude coordinate (for map display).",
    )

    longitude = Column(
        Numeric(10, 7),
        nullable=True,
        doc="Longitude coordinate (for map display).",
    )

    # ── Market Availability Status ────────────────────────────
    # AvailabilityStatus reflects market state:
    #   AVAILABLE → still on the market
    #   SOLD      → property has been sold
    #   RENTED    → property has been rented
    #
    # NOTE: This is SEPARATE from listing_status (admin moderation).
    # A property can be APPROVED by admin but SOLD on the market.
    availability_status = Column(
        String(20),
        nullable=False,
        default=AvailabilityStatus.AVAILABLE.value,
        doc="Market availability: available, sold, or rented.",
    )

    # ── Admin Moderation Status ───────────────────────────────
    # ListingStatus reflects admin moderation:
    #   PENDING  → admin hasn't reviewed yet (default for new listings)
    #   APPROVED → admin approved, visible to public
    #   REJECTED → admin rejected, hidden from public
    #
    # NOTE: This is SEPARATE from availability_status (market state).
    # New listings start as PENDING — invisible until admin approves.
    listing_status = Column(
        String(20),
        nullable=False,
        default=ListingStatus.PENDING.value,
        index=True,            # Public queries filter by status='approved'
        doc="Admin moderation status: pending, approved, or rejected.",
    )

    rejection_reason = Column(
        Text,
        nullable=True,
        doc="If rejected, the reason given by the admin (shown to the agent).",
    )

    # ── Featured & Engagement ─────────────────────────────────
    is_featured = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,            # Homepage queries: WHERE is_featured = TRUE
        doc="Whether this listing is featured on the homepage.",
    )

    view_count = Column(
        Integer,
        nullable=False,
        default=0,
        doc="Number of times this listing has been viewed.",
    )

    # ── Amenities (PostgreSQL Array) ──────────────────────────
    # ARRAY(Text) is a PostgreSQL-specific feature.
    # Stores a list of strings directly in the column:
    #   ['Swimming Pool', 'Parking', 'Security', 'Generator']
    #
    # Why not a separate amenities table?
    #   - Amenities are simple strings (no extra data per amenity)
    #   - Creating a separate table would be over-engineering
    #   - PostgreSQL arrays are queryable: WHERE 'Pool' = ANY(amenities)
    amenities = Column(
        ARRAY(Text),
        nullable=True,
        default=list,
        doc="List of amenity names (e.g., ['Pool', 'Parking', 'Security']).",
    )

    # ── Relationships ─────────────────────────────────────────
    # Link to the agent (User who owns this listing)
    agent = relationship(
        "User",
        backref="properties",  # Adds user.properties → list of their listings
    )

    # Link to images (one property has many images)
    # cascade="all, delete-orphan" = delete all images when property is deleted
    images = relationship(
        "PropertyImage",
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyImage.sort_order",  # Show in user-defined order
    )

    # ── String Representation ─────────────────────────────────
    def __repr__(self) -> str:
        return (
            f"<Property id={self.id} "
            f"title='{self.title[:30]}...' "
            f"price={self.price} "
            f"status={self.listing_status}>"
        )