import os
import uuid
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.cloudinary_config import *  # Initializes Cloudinary
import cloudinary.uploader

from app.models.user import User, UserRole
from app.repositories import property_repository, property_image_repository
from app.models.property_image import PropertyImage

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_IMAGES_PER_PROPERTY = 10


def _verify_property_ownership(user: User, property_obj) -> None:
    is_owner = property_obj.agent_id == user.id
    is_admin = user.role == UserRole.ADMIN.value
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage images for this property.",
        )


def _validate_image_file(file: UploadFile, file_size: int) -> None:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPEG, PNG, WebP.",
        )
    extension = os.path.splitext(file.filename or "")[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{extension}'. Allowed: .jpg, .jpeg, .png, .webp",
        )
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({size_mb:.1f}MB). Maximum: {max_mb:.0f}MB.",
        )


def upload_property_image(
    db: Session,
    user: User,
    property_id: UUID,
    file: UploadFile,
    file_bytes: bytes,
) -> PropertyImage:
    """Upload image to Cloudinary instead of local disk"""
    
    # Verify property exists
    prop = property_repository.get_property_by_id(db, property_id, include_relations=False)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

    # Verify ownership
    _verify_property_ownership(user, prop)

    # Check image count
    current_count = property_image_repository.count_property_images(db, property_id)
    if current_count >= MAX_IMAGES_PER_PROPERTY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_IMAGES_PER_PROPERTY} images per property reached.",
        )

    # Validate file
    _validate_image_file(file, len(file_bytes))

    # ── UPLOAD TO CLOUDINARY (replaces local disk save) ──
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=f"jidex/properties/{property_id}",
            public_id=str(uuid.uuid4()),
            resource_type="image",
            transformation=[
                {"width": 1200, "height": 800, "crop": "limit"},
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )
        image_url = result["secure_url"]  # This is the permanent CDN URL
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image to Cloudinary: {str(e)}",
        )

    # Create database record
    is_first_image = current_count == 0
    try:
        new_image = property_image_repository.create_image(
            db=db,
            property_id=property_id,
            image_url=image_url,  # Now stores Cloudinary URL
            is_primary=is_first_image,
            sort_order=current_count,
        )
        return new_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image record: {str(e)}",
        )


def delete_property_image(db: Session, user: User, property_id: UUID, image_id: UUID) -> None:
    """Delete image from DB (Cloudinary keeps a copy - optional to delete)"""
    prop = property_repository.get_property_by_id(db, property_id, include_relations=False)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    
    _verify_property_ownership(user, prop)

    image = property_image_repository.get_image_by_id(db, image_id)
    if image is None or image.property_id != property_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    was_primary = image.is_primary
    
    # Delete from database (we skip Cloudinary delete to keep it simple)
    property_image_repository.delete_image(db, image)

    # Promote another image if needed
    if was_primary:
        remaining = property_image_repository.list_property_images(db, property_id)
        if remaining:
            property_image_repository.set_primary_image(db, property_id, remaining[0].id)


def set_image_as_primary(db: Session, user: User, property_id: UUID, image_id: UUID) -> PropertyImage:
    prop = property_repository.get_property_by_id(db, property_id, include_relations=False)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    
    _verify_property_ownership(user, prop)
    updated = property_image_repository.set_primary_image(db, property_id, image_id)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")
    return updated