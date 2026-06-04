"""
User Schemas
=============
Pydantic schemas for User-related API operations.

Schema patterns:
- *Base       → shared fields used by other schemas
- *Create     → fields needed to CREATE a new record (POST)
- *Update     → fields that can be UPDATED (PUT/PATCH) — all optional
- *Response   → fields RETURNED to the API caller

Critical security rule:
- Request schemas can ACCEPT password
- Response schemas NEVER return password or password_hash
- This separation prevents accidental password leaks
"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.core.constants import UserRole


# ── Shared User Fields ────────────────────────────────────────────────────────
class UserBase(BaseModel):
    """
    Fields common to multiple user schemas.

    Used as a base class to avoid repeating the same field definitions
    in UserCreate, UserUpdate, and UserResponse.
    """
    full_name: str = Field(
        min_length=2,
        max_length=255,
        description="User's full name.",
    )
    email: EmailStr = Field(
        description="User's email address (must be a valid email format).",
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="User's phone number (optional).",
    )


# ── User Creation (Registration) ──────────────────────────────────────────────
class UserCreate(UserBase):
    """
    Schema for creating a new user account.

    Used by: POST /api/v1/auth/register

    Required fields:
    - full_name, email, phone (inherited from UserBase)
    - password (with strong validation)
    - role (must be "user" or "agent" — admins are created differently)
    """
    password: str = Field(
        min_length=8,
        max_length=128,
        description="Plain-text password. Will be hashed before storage.",
    )

    # Only allow 'user' or 'agent' during public registration.
    # Admins are created via seed data or by other admins.
    role: UserRole = Field(
        default=UserRole.USER,
        description="Account type: 'user' (property seeker) or 'agent' (lister).",
    )


# ── User Update ───────────────────────────────────────────────────────────────
class UserUpdate(BaseModel):
    """
    Schema for updating an existing user's profile.

    Used by: PUT /api/v1/users/profile

    All fields are OPTIONAL so the user can update just one thing
    (e.g., only their phone number) without sending everything.
    """
    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
    )
    profile_image: Optional[str] = Field(
        default=None,
        max_length=500,
    )


# ── User Response (What The API Returns) ──────────────────────────────────────
class UserResponse(BaseModel):
    """
    Schema for returning user data to the API caller.

    🔒 SECURITY: Notice this schema does NOT include:
    - password
    - password_hash

    This is deliberate — even if our code accidentally tried to
    return a password, Pydantic would strip it out.
    """
    id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # ── Pydantic Configuration ──────────────────────────────
    # from_attributes=True allows Pydantic to read data from
    # SQLAlchemy ORM objects (which have attributes, not dict keys).
    #
    # Without this, we'd need to manually convert User → dict → UserResponse.
    # With this, Pydantic does it automatically: UserResponse.model_validate(user)
    model_config = ConfigDict(from_attributes=True)