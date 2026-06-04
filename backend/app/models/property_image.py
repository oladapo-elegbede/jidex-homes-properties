"""
PropertyImage Model
====================
Represents a single image attached to a property listing.

Design decisions:
- Separate table (not array) so each image has its own metadata
- is_primary flag identifies the thumbnail/cover image
- sort_order allows custom image ordering (drag-and-drop in UI later)
- ondelete CASCADE: if the property is deleted, all images are deleted too
- ondelete is also handled at the SQLAlchemy level via cascade="all, delete-orphan"
  on the Property model (defense in depth)

Relationship:
    Property ──── PropertyImage[]
              1:N (one property has many images)
"""

import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class PropertyImage(Base):
    """
    Database model for property images.

    Note: This model does NOT use TimestampMixin because we only
    need created_at (no updated_at — images don't get modified,
    they get deleted and re-added).

    Table: property_images
    """

    # ── Table Name ────────────────────────────────────────────
    __tablename__ = "property_images"

    # ── Primary Key ───────────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        doc="Unique identifier (UUID) for this image record.",
    )

    # ── Foreign Key To Property ───────────────────────────────
    # ondelete CASCADE: when the property is deleted, this image is deleted too.
    property_id = Column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,            # We query "all images for property X" often
        doc="Foreign key to the property this image belongs to.",
    )

    # ── Image URL ─────────────────────────────────────────────
    # In development: paths like "/uploads/property_123/photo1.jpg"
    # In production:  full URLs like "https://cdn.cloudinary.com/.../photo1.jpg"
    image_url = Column(
        String(500),
        nullable=False,
        doc="URL or path to the image file.",
    )

    # ── Primary Image Flag ────────────────────────────────────
    # Marks ONE image as the "cover" / thumbnail.
    # Service-layer logic enforces: only one image per property has is_primary=True.
    is_primary = Column(
        Boolean,
        nullable=False,
        default=False,
        doc="Whether this is the primary (thumbnail/cover) image.",
    )

    # ── Display Order ─────────────────────────────────────────
    # Lower numbers display first.
    # Allows agents to reorder images via drag-and-drop in the UI.
    sort_order = Column(
        Integer,
        nullable=False,
        default=0,
        doc="Display order (lower = shown first).",
    )

    # ── Timestamp ─────────────────────────────────────────────
    # Only created_at (no updated_at — images aren't edited)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        doc="When this image was uploaded.",
    )

    # ── Relationship Back To Property ─────────────────────────
    property = relationship(
        "Property",
        back_populates="images",
    )

    # ── String Representation ─────────────────────────────────
    def __repr__(self) -> str:
        return (
            f"<PropertyImage id={self.id} "
            f"property_id={self.property_id} "
            f"is_primary={self.is_primary}>"
        )