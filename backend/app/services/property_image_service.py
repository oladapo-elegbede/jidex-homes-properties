"""
Property Image Service
=======================
Business logic for property image uploads and management.

This service handles:
- File upload validation (type, size, dimensions)
- Saving files to disk
- Creating database records
- Deleting files AND database records
- Setting primary image
- Ownership verification (only the property owner can manage images)

The service orchestrates between:
- File system (saving/deleting actual image files)
- Repository (database operations)
- Validation (file type, size limits)
"""

import os
import uuid
from typing import List
from uuid import UUID
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.property_image import PropertyImage
from app.repositories import property_repository, property_image_repository
from app.core.constants import UserRole


# ── Constants ─────────────────────────────────────────────────────────────────

# Where to save uploaded files on disk
UPLOAD_DIR = "uploads/properties"

# Allowed file types (MIME types)
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

# Allowed file extensions (extra safety check)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Maximum file size (5 MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

# Maximum images per property
MAX_IMAGES_PER_PROPERTY = 10


# ── Private Helpers ───────────────────────────────────────────────────────────

def _verify_property_ownership(
    user: User,
    property_obj,
) -> None:
    """
    Verify the user owns the property OR is an admin.

    Raises:
        HTTPException 403: User doesn't own the property
    """
    is_owner = property_obj.agent_id == user.id
    is_admin = user.role == UserRole.ADMIN.value

    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage images for this property.",
        )


def _validate_image_file(file: UploadFile, file_size: int) -> None:
    """
    Validate an uploaded file is an acceptable image.

    Checks:
    - MIME type is allowed
    - File extension is allowed
    - File size is within limit

    Raises:
        HTTPException 400: File is invalid
    """
    # Check MIME type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid file type '{file.content_type}'. "
                f"Allowed: JPEG, PNG, WebP."
            ),
        )

    # Check file extension (extra safety — never trust MIME type alone)
    extension = os.path.splitext(file.filename or "")[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid file extension '{extension}'. "
                f"Allowed: .jpg, .jpeg, .png, .webp"
            ),
        )

    # Check file size
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({size_mb:.1f}MB). Maximum size: {max_mb:.0f}MB.",
        )


def _generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename to prevent collisions.

    Format: {uuid}{extension}
    Example: "a3f8b2c9-d4e5-f6a7-b8c9-d0e1f2a3b4c5.jpg"

    This prevents:
    - Filename collisions (two users uploading "photo.jpg")
    - Path traversal attacks (filename like "../../etc/passwd")
    - Information leakage (original filename hidden)
    """
    extension = os.path.splitext(original_filename or "")[1].lower()
    return f"{uuid.uuid4()}{extension}"


def _build_image_url(property_id: UUID, filename: str) -> str:
    """
    Build the URL path for an uploaded image.

    Returns: "/uploads/properties/{property_id}/{filename}"

    This is a RELATIVE URL. The frontend prepends the backend base URL.
    """
    return f"/uploads/properties/{property_id}/{filename}"


def _delete_file_from_disk(image_url: str) -> None:
    """
    Delete an image file from disk.

    Args:
        image_url: The relative URL path (e.g., "/uploads/properties/abc/file.jpg")

    Silently ignores errors (file already deleted, permissions, etc.)
    The database deletion is the source of truth.
    """
    try:
        # Convert URL path to filesystem path
        # URL: "/uploads/properties/abc/file.jpg"
        # Path: "uploads/properties/abc/file.jpg"
        file_path = image_url.lstrip("/")

        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        # Log this in production. For now, silent failure is acceptable
        # because the DB record is the source of truth.
        pass


# ── Public Service Functions ──────────────────────────────────────────────────

def upload_property_image(
    db: Session,
    user: User,
    property_id: UUID,
    file: UploadFile,
    file_bytes: bytes,
) -> PropertyImage:
    """
    Upload and save an image for a property.

    Flow:
    1. Verify property exists
    2. Verify user owns the property (or is admin)
    3. Check image count limit (max 10 per property)
    4. Validate file (type, extension, size)
    5. Generate unique filename
    6. Save file to disk
    7. Create database record
    8. If this is the first image, mark it as primary automatically

    Args:
        db:          Active database session
        user:        Authenticated user
        property_id: Property UUID
        file:        FastAPI UploadFile object
        file_bytes:  The actual file content as bytes

    Returns:
        The newly created PropertyImage object

    Raises:
        HTTPException 404: Property not found
        HTTPException 403: User doesn't own property
        HTTPException 400: File validation failed
        HTTPException 400: Property already has max images
    """
    # ── Step 1: Verify property exists ───────────────────────
    prop = property_repository.get_property_by_id(
        db, property_id, include_relations=False
    )

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    # ── Step 2: Verify ownership ─────────────────────────────
    _verify_property_ownership(user, prop)

    # ── Step 3: Check image count limit ──────────────────────
    current_count = property_image_repository.count_property_images(db, property_id)
    if current_count >= MAX_IMAGES_PER_PROPERTY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Maximum {MAX_IMAGES_PER_PROPERTY} images per property reached. "
                "Delete some before uploading more."
            ),
        )

    # ── Step 4: Validate file ────────────────────────────────
    _validate_image_file(file, len(file_bytes))

    # ── Step 5: Generate unique filename ─────────────────────
    filename = _generate_unique_filename(file.filename)

    # ── Step 6: Save file to disk ────────────────────────────
    # Create property-specific subfolder
    property_folder = os.path.join(UPLOAD_DIR, str(property_id))
    os.makedirs(property_folder, exist_ok=True)

    file_path = os.path.join(property_folder, filename)

    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image: {str(e)}",
        )

    # ── Step 7: Create database record ───────────────────────
    image_url = _build_image_url(property_id, filename)

    # If this is the first image, mark it as primary
    is_first_image = current_count == 0

    try:
        new_image = property_image_repository.create_image(
            db=db,
            property_id=property_id,
            image_url=image_url,
            is_primary=is_first_image,
            sort_order=current_count,
        )
        return new_image
    except Exception as e:
        # If DB insert fails, clean up the file we just saved
        _delete_file_from_disk(image_url)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image record: {str(e)}",
        )


def delete_property_image(
    db: Session,
    user: User,
    property_id: UUID,
    image_id: UUID,
) -> None:
    """
    Delete a property image (both file and DB record).

    Flow:
    1. Verify property exists
    2. Verify user owns the property
    3. Verify image exists and belongs to this property
    4. Delete file from disk
    5. Delete database record
    6. If deleted image was primary, promote another image to primary

    Raises:
        HTTPException 404: Property or image not found
        HTTPException 403: User doesn't own property
    """
    # ── Verify property and ownership ────────────────────────
    prop = property_repository.get_property_by_id(
        db, property_id, include_relations=False
    )

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    _verify_property_ownership(user, prop)

    # ── Verify image exists and belongs to this property ─────
    image = property_image_repository.get_image_by_id(db, image_id)

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found.",
        )

    if image.property_id != property_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image does not belong to this property.",
        )

    was_primary = image.is_primary
    image_url = image.image_url

    # ── Delete file from disk ────────────────────────────────
    _delete_file_from_disk(image_url)

    # ── Delete database record ───────────────────────────────
    property_image_repository.delete_image(db, image)

    # ── If deleted image was primary, promote another ────────
    if was_primary:
        remaining_images = property_image_repository.list_property_images(
            db, property_id
        )
        if remaining_images:
            # Mark the first remaining image as primary
            property_image_repository.set_primary_image(
                db, property_id, remaining_images[0].id
            )


def set_image_as_primary(
    db: Session,
    user: User,
    property_id: UUID,
    image_id: UUID,
) -> PropertyImage:
    """
    Mark an image as the primary/cover image for a property.

    Automatically unsets is_primary on all other images for this property.

    Raises:
        HTTPException 404: Property or image not found
        HTTPException 403: User doesn't own property
    """
    prop = property_repository.get_property_by_id(
        db, property_id, include_relations=False
    )

    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found.",
        )

    _verify_property_ownership(user, prop)

    updated_image = property_image_repository.set_primary_image(
        db, property_id, image_id
    )

    if updated_image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found.",
        )

    return updated_image