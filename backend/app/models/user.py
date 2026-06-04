"""
User Model
===========
Represents a user account on the Jidex Homes platform.

This is the central identity table — every account (regular user, agent,
admin) lives in this single table. The `role` column distinguishes them.

Design decisions:
- UUID primary key (security: prevents ID enumeration attacks)
- Email is unique (one account per email)
- Password is stored as a hash, NEVER plain text
- is_active and is_verified are separate concepts:
    * is_active = admin can deactivate an account
    * is_verified = optional email verification (post-MVP)
- created_at and updated_at via TimestampMixin
- agent_profile relationship: agents get a linked profile (one-to-one)
"""

import uuid
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin
from app.core.constants import UserRole


class User(Base, TimestampMixin):
    """
    Database model for user accounts.

    Inherits:
        Base            → SQLAlchemy declarative base
        TimestampMixin  → adds created_at and updated_at

    Table: users
    """

    # ── Table Name ────────────────────────────────────────────
    __tablename__ = "users"

    # ── Primary Key ───────────────────────────────────────────
    # UUID instead of integer for several reasons:
    # 1. SECURITY: prevents URL enumeration (e.g., /users/1, /users/2...)
    # 2. SCALABILITY: works across distributed systems without collisions
    # 3. PRIVACY: cannot guess how many users exist
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        doc="Unique identifier (UUID) for this user.",
    )

    # ── Core Identity Fields ──────────────────────────────────
    full_name = Column(
        String(255),
        nullable=False,
        doc="User's full name (first + last).",
    )

    email = Column(
        String(255),
        unique=True,            # No two users can share an email
        nullable=False,
        index=True,             # Indexed because we query by email on login
        doc="User's email address (used for login).",
    )

    phone = Column(
        String(20),
        nullable=True,          # Optional during registration
        doc="User's phone number (optional).",
    )

    # ── Security Fields ───────────────────────────────────────
    # Stores the BCRYPT HASH, not the actual password.
    # Length 255 leaves room for any hash format upgrades in the future.
    password_hash = Column(
        String(255),
        nullable=False,
        doc="Bcrypt hash of the user's password. Never plain text.",
    )

    # ── Role-Based Access ─────────────────────────────────────
    # Defaults to "user" — agents and admins are explicitly assigned.
    role = Column(
        String(20),
        nullable=False,
        default=UserRole.USER.value,
        index=True,             # Indexed because we filter by role often
        doc="User role: 'user', 'agent', or 'admin'.",
    )

    # ── Account Status Flags ──────────────────────────────────
    # is_active: Can this account log in?
    # Setting False = soft delete / suspension by admin.
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        doc="Whether this account can log in. Admin can deactivate.",
    )

    # is_verified: Has the user verified their email?
    # Used for post-MVP email verification flow.
    is_verified = Column(
        Boolean,
        nullable=False,
        default=False,
        doc="Whether the user has verified their email address.",
    )

    # ── Optional Profile Image ────────────────────────────────
    profile_image = Column(
        String(500),            # URL/path to image
        nullable=True,
        doc="URL or path to the user's profile picture.",
    )

    # ── Relationship To AgentProfile ──────────────────────────
    # If this user is an agent, this links to their agent profile.
    # If they're not an agent, this will be None.
    #
    # cascade="all, delete-orphan" means:
    # - If we delete the user, automatically delete their agent_profile
    # - If we detach the profile from the user, delete it
    agent_profile = relationship(
        "AgentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # ── Useful String Representation ──────────────────────────
    def __repr__(self) -> str:
        """
        Developer-friendly string for debugging and logs.

        Example:
            <User id=abc-123 email=jane@example.com role=agent>
        """
        return (
            f"<User id={self.id} "
            f"email={self.email} "
            f"role={self.role}>"
        )