"""
User Repository
================
Handles ALL database operations related to users.

Repository pattern:
- This is the ONLY layer that talks to the database for User operations
- Services and routes never write SQL directly
- All queries live here, making them reusable and testable

Functions in this file:
- get_user_by_id        → find one user by UUID
- get_user_by_email     → find one user by email (used for login)
- create_user           → insert a new user record
- update_user           → modify an existing user
- list_users            → paginated list of users (for admin)
- count_users           → total count (for pagination metadata)
"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.user import User


# ── Read Operations (GET queries) ─────────────────────────────────────────────

def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """
    Retrieve a single user by their UUID.

    Args:
        db:      Active database session
        user_id: User's UUID

    Returns:
        User object if found, None if not found

    Example:
        user = get_user_by_id(db, some_uuid)
        if user:
            print(user.email)
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieve a single user by their email address.

    This is the MOST IMPORTANT query in the auth system because:
    - Login uses this to find the account
    - Registration uses this to check for duplicates
    - It MUST be fast (which is why email has an index)

    Args:
        db:    Active database session
        email: User's email address

    Returns:
        User object if found, None if not found
    """
    return db.query(User).filter(User.email == email).first()


def list_users(
    db: Session,
    skip: int = 0,
    limit: int = 12,
) -> List[User]:
    """
    Retrieve a paginated list of users.

    Args:
        db:    Active database session
        skip:  Number of records to skip (for pagination offset)
        limit: Maximum number of records to return

    Returns:
        List of User objects

    Example:
        # Get page 2 with 12 per page
        users = list_users(db, skip=12, limit=12)
    """
    return (
        db.query(User)
        .order_by(User.created_at.desc())   # Newest first
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_users(db: Session) -> int:
    """
    Count the total number of users in the database.

    Used for pagination metadata (e.g., "240 total users").

    Args:
        db: Active database session

    Returns:
        Integer count of all users
    """
    return db.query(User).count()


# ── Write Operations (INSERT/UPDATE queries) ──────────────────────────────────

def create_user(
    db: Session,
    full_name: str,
    email: str,
    password_hash: str,
    role: str,
    phone: Optional[str] = None,
) -> User:
    """
    Insert a new user record into the database.

    Important:
    - The CALLER must hash the password before calling this
    - This function does NOT do business logic (no duplicate check)
    - Those concerns belong in the service layer

    Args:
        db:            Active database session
        full_name:     User's full name
        email:         User's email (must be unique)
        password_hash: Pre-hashed password (use security.hash_password())
        role:          User role ("user", "agent", or "admin")
        phone:         Optional phone number

    Returns:
        The newly created User object (with id and timestamps populated)

    Raises:
        IntegrityError: If email already exists (unique constraint violation)
    """
    user = User(
        full_name=full_name,
        email=email,
        password_hash=password_hash,
        role=role,
        phone=phone,
        is_active=True,
        is_verified=False,
    )

    db.add(user)          # Stage the insert
    db.commit()           # Actually save to database
    db.refresh(user)      # Reload to get auto-populated fields (id, timestamps)

    return user


def update_user(
    db: Session,
    user: User,
    **updates,
) -> User:
    """
    Update fields on an existing user.

    Args:
        db:      Active database session
        user:    Existing User object (already loaded from DB)
        updates: Keyword arguments of fields to update
                 Example: update_user(db, user, full_name="New Name", phone="123")

    Returns:
        The updated User object

    Example:
        user = get_user_by_id(db, user_id)
        updated = update_user(db, user, full_name="Jane Smith", phone="+234...")
    """
    for field, value in updates.items():
        # Only update fields that actually exist on the User model
        # and only if the value is not None (to support partial updates)
        if hasattr(user, field) and value is not None:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user