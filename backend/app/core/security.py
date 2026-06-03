"""
Security Utilities
==================
Handles all cryptographic operations:
- Password hashing and verification
- JWT token creation and decoding

These functions are the security foundation of the entire application.
They must be correct, well-tested, and never bypassed.

Key principles:
- Passwords are NEVER stored in plain text
- JWT tokens are signed with a secret key
- Token expiry is always enforced
- Invalid tokens raise consistent exceptions
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# ── Password Hashing Setup ────────────────────────────────────────────────────
#
# CryptContext manages the hashing algorithm configuration.
# bcrypt is the industry-standard algorithm for password storage.
#
# Why bcrypt?
# - Deliberately SLOW (cost factor) → makes brute-force attacks expensive
# - Automatically generates and stores SALT per hash
# - Widely audited and trusted
# - Used by every major company (GitHub, Apple, etc.)
#
# What is "salt"?
# - A random value added to each password before hashing
# - Means two users with the SAME password get DIFFERENT hashes
# - Defeats rainbow table attacks
#
# deprecated="auto" means:
# - If we ever change algorithms in the future
# - Old hashes using the previous algorithm will still verify correctly
# - We can gradually migrate users to the new algorithm

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Args:
        plain_password: The user's raw password string

    Returns:
        A bcrypt hash string safe to store in the database
        Format: $2b$12$[salt][hash]
        Length: ~60 characters

    Example:
        hashed = hash_password("MyPassword123!")
        # Returns: "$2b$12$XmAFxL.JmHGqf4pYrwK7Qen8x.4hQvLwz3jbT5KMs3xK6Vp4f8Lc6"

    Security note:
        Each call produces a DIFFERENT hash for the same input,
        because a new salt is generated each time.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a stored bcrypt hash.

    Args:
        plain_password:  The password the user submitted in their login form
        hashed_password: The hash stored in the database

    Returns:
        True if the password matches, False otherwise

    Security note:
        This comparison is timing-safe. passlib prevents timing attacks
        that could allow an attacker to determine password validity
        based on how long the comparison takes.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token Management ──────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    role: str,
    email: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT access token.

    The token payload (claims) contains:
    - sub:   The user's UUID (subject identifier)
    - role:  The user's role for permission checks
    - email: The user's email (convenience claim)
    - exp:   Expiry timestamp

    Args:
        subject:       User UUID as string
        role:          User role ("user", "agent", "admin")
        email:         User email address
        expires_delta: Optional custom expiry duration

    Returns:
        A signed JWT string to return to the client

    Security note:
        The token is signed with SECRET_KEY using HS256 algorithm.
        It cannot be TAMPERED with without invalidating the signature.
        However, it CAN be DECODED without the key (it is not encrypted).

        NEVER put sensitive data (like passwords) in JWT claims.
    """
    # Determine expiry time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Build the payload (the data inside the token)
    payload: dict[str, Any] = {
        "sub": str(subject),    # Subject: user's UUID
        "role": role,           # Role for permission checks
        "email": email,         # Email for convenience
        "exp": expire,          # Expiry timestamp
    }

    # Sign and encode the token
    encoded_token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return encoded_token


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.

    This function:
    1. Verifies the token signature
    2. Checks the token has not expired
    3. Returns the decoded payload

    Args:
        token: The JWT string from the Authorization header

    Returns:
        The decoded payload dictionary

    Raises:
        JWTError: If the token is invalid, expired, or tampered with

    Usage:
        try:
            payload = decode_access_token(token)
            user_id = payload["sub"]
            role = payload["role"]
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )