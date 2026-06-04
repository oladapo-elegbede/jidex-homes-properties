"""
Authentication Service
=======================
Contains the BUSINESS LOGIC for authentication operations.

This is the brain that decides:
- Can this user register? (email must be unique)
- Are these login credentials valid?
- What token should we issue?

It coordinates:
- Repository (database queries)
- Security utilities (hashing, JWT)
- Pydantic schemas (input/output shapes)

The router doesn't make decisions — it just calls these functions.
"""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.repositories import user_repository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.schemas.user import UserCreate


# ── User Registration ─────────────────────────────────────────────────────────

def register_user(db: Session, user_data: UserCreate) -> User:
    """
    Register a new user account.

    Business rules enforced here:
    1. Email must not already be registered
    2. Password is hashed before storage
    3. New users default to is_active=True, is_verified=False

    Args:
        db:        Active database session
        user_data: Validated registration data from Pydantic

    Returns:
        The newly created User object

    Raises:
        HTTPException 409: If the email is already registered
    """
    # ── Step 1: Check for duplicate email ────────────────────
    existing_user = user_repository.get_user_by_email(db, user_data.email)

    if existing_user is not None:
        # 409 Conflict = "Request conflicts with current state of resource"
        # Standard HTTP status for duplicate resources
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # ── Step 2: Hash the password ────────────────────────────
    # NEVER pass plain-text passwords to the repository.
    # Hashing happens HERE in the service layer.
    hashed_pw = hash_password(user_data.password)

    # ── Step 3: Create the user via repository ───────────────
    new_user = user_repository.create_user(
        db=db,
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_pw,
        role=user_data.role.value,    # Convert UserRole enum → string
        phone=user_data.phone,
    )

    return new_user


# ── User Authentication (Login) ───────────────────────────────────────────────

def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User:
    """
    Verify a user's login credentials.

    Business rules enforced here:
    1. Email must exist in the database
    2. Submitted password must match the stored hash
    3. Account must be active (not deactivated by admin)

    Security note:
    We return the SAME error message for both "user not found" and
    "wrong password". This prevents attackers from using the API to
    discover which emails are registered (called "user enumeration").

    Args:
        db:       Active database session
        email:    Submitted email
        password: Submitted plain-text password

    Returns:
        The authenticated User object

    Raises:
        HTTPException 401: If credentials are invalid or account inactive
    """
    # ── Step 1: Find the user by email ───────────────────────
    user = user_repository.get_user_by_email(db, email)

    # ── Step 2: Verify user exists AND password matches ──────
    # We combine both checks into ONE error message intentionally.
    # An attacker probing emails should not be able to tell which
    # ones are registered.
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # ── Step 3: Check account is active ──────────────────────
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Contact support.",
        )

    return user


# ── Token Generation ──────────────────────────────────────────────────────────

def generate_token_for_user(user: User) -> str:
    """
    Generate a JWT access token for a user.

    Called after successful registration OR login.
    The token contains the user's ID, role, and email.

    Args:
        user: Authenticated User object

    Returns:
        Signed JWT token string
    """
    return create_access_token(
        subject=str(user.id),     # UUID must be string for JWT
        role=user.role,
        email=user.email,
    )