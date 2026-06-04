"""
AgentProfile Model
===================
Extended profile information for users with the 'agent' role.

Design rationale:
- Not every user is an agent, so we don't put these fields on the User table
- This keeps the users table lean and the agent_profiles table focused
- A one-to-one relationship: each agent has exactly ONE profile

Fields stored here:
- Agency name (the company they represent)
- Bio (their professional description)
- Profile image (their avatar)
- License number (if they're a licensed real estate agent)
- Years of experience
- Verification status (verified by admin = trust badge on listings)
"""

import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class AgentProfile(Base, TimestampMixin):
    """
    Database model for agent profiles.

    One-to-one relationship with User:
        User (role='agent') ──── AgentProfile
                            1:1

    Table: agent_profiles
    """

    # ── Table Name ────────────────────────────────────────────
    __tablename__ = "agent_profiles"

    # ── Primary Key ───────────────────────────────────────────
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        doc="Unique identifier (UUID) for this agent profile.",
    )

    # ── Foreign Key To User ───────────────────────────────────
    # This is what makes this row "belong to" a specific user.
    #
    # ForeignKey("users.id") = "this column references users.id"
    # unique=True            = "one user can have only ONE agent profile" (1:1)
    # ondelete="CASCADE"     = "if the user is deleted, delete this profile too"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,            # Enforces one profile per user
        nullable=False,
        index=True,             # Speed up lookups by user_id
        doc="Foreign key linking to the users table.",
    )

    # ── Agency Information ────────────────────────────────────
    agency_name = Column(
        String(255),
        nullable=True,          # Independent agents may not have an agency
        doc="Name of the agency this agent represents (optional).",
    )

    bio = Column(
        Text,                   # Text = unlimited-length string
        nullable=True,
        doc="Agent's professional biography.",
    )

    profile_image_url = Column(
        String(500),
        nullable=True,
        doc="URL to the agent's profile picture.",
    )

    # ── Credentials ───────────────────────────────────────────
    license_number = Column(
        String(100),
        nullable=True,
        doc="Real estate license number (if applicable).",
    )

    years_of_experience = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Years of professional experience as a real estate agent.",
    )

    # ── Verification ──────────────────────────────────────────
    # Admins can verify agents (e.g., after confirming their license).
    # Verified agents get a trust badge on their listings.
    is_verified_agent = Column(
        Boolean,
        nullable=False,
        default=False,
        doc="Whether the admin has verified this agent's credentials.",
    )

    # ── Relationship To User ──────────────────────────────────
    # This lets us write: agent_profile.user → returns the User object
    # Magic! No manual joins needed.
    #
    # back_populates="agent_profile" creates a two-way link:
    #     user.agent_profile → returns the AgentProfile (if exists)
    user = relationship(
        "User",
        back_populates="agent_profile",
        uselist=False,          # One-to-one (not a list)
    )

    # ── Useful String Representation ──────────────────────────
    def __repr__(self) -> str:
        return (
            f"<AgentProfile id={self.id} "
            f"user_id={self.user_id} "
            f"agency={self.agency_name}>"
        )