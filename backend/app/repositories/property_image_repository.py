"""
Property Image Repository
==========================
Handles all database operations for property images.

This is the ONLY layer that talks to the DB for PropertyImage operations.
Services and routes never write SQL directly.

Functions:
- create_image          → insert a new image record
- list_property_images  → get all images for a property
- get_image_by_id       → fetch one image by UUID
- delete_image          → remove an image record
- set_primary_image     → mark one image as primary (and unset others)
- count_property_images → count images for a property
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.property_image import PropertyImage


# ── Read Operations ───────────────────────────────────────────────────────────

def get_image_by_id(
    db: Session,
    image_id: UUID,
) -> Optional[PropertyImage]:
    """
    Get a single property image by its UUID.

    Args:
        db:       Active database session
        image_id: Image UUID

    Returns:
        PropertyImage object or None if not found
    """
    return db.query(PropertyImage).filter(PropertyImage.id == image_id).first()


def list_property_images(
    db: Session,
    property_id: UUID,
) -> List[PropertyImage]:
    """
    Get all images for a specific property, ordered by sort_order.

    Args:
        db:          Active database session
        property_id: Property UUID

    Returns:
        List of PropertyImage objects (empty list if none)
    """
    return (
        db.query(PropertyImage)
        .filter(PropertyImage.property_id == property_id)
        .order_by(PropertyImage.sort_order, PropertyImage.created_at)
        .all()
    )


def count_property_images(
    db: Session,
    property_id: UUID,
) -> int:
    """
    Count how many images a property has.

    Useful for enforcing max-image limits or showing UI counts.
    """
    return (
        db.query(func.count(PropertyImage.id))
        .filter(PropertyImage.property_id == property_id)
        .scalar() or 0
    )


# ── Write Operations ──────────────────────────────────────────────────────────

def create_image(
    db: Session,
    property_id: UUID,
    image_url: str,
    is_primary: bool = False,
    sort_order: int = 0,
) -> PropertyImage:
    """
    Insert a new property image record into the database.

    Args:
        db:          Active database session
        property_id: The property this image belongs to
        image_url:   URL/path to the stored image file
        is_primary:  Whether this is the primary (cover) image
        sort_order:  Display order (lower = shown first)

    Returns:
        The newly created PropertyImage object
    """
    new_image = PropertyImage(
        property_id=property_id,
        image_url=image_url,
        is_primary=is_primary,
        sort_order=sort_order,
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image


def delete_image(
    db: Session,
    image: PropertyImage,
) -> None:
    """
    Delete a property image record from the database.

    Note: This only deletes the database record.
    The actual file on disk must be deleted separately (in the service layer).
    """
    db.delete(image)
    db.commit()


def set_primary_image(
    db: Session,
    property_id: UUID,
    image_id: UUID,
) -> Optional[PropertyImage]:
    """
    Mark one image as primary, and unset is_primary on all other images
    for the same property.

    Args:
        db:          Active database session
        property_id: Property UUID
        image_id:    The image to mark as primary

    Returns:
        The updated PropertyImage object, or None if not found
    """
    # First, unset is_primary on ALL images for this property
    db.query(PropertyImage).filter(
        PropertyImage.property_id == property_id
    ).update({PropertyImage.is_primary: False})

    # Then, set is_primary=True on the chosen image
    image = db.query(PropertyImage).filter(
        PropertyImage.id == image_id,
        PropertyImage.property_id == property_id,
    ).first()

    if image is None:
        return None

    image.is_primary = True
    db.commit()
    db.refresh(image)
    return image