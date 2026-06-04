"""
Authentication Dependencies
============================
FastAPI dependencies for extracting and validating the current user.

How dependencies work:
- Route declares: current_user: User = Depends(get_current_user)
- FastAPI runs get_current_user() BEFORE the route handler
- If valid token → route runs with the User object available
- If invalid token → 401 returned automatically, route never runs

This pattern protects endpoints without cluttering route handlers
with auth boilerplate.
"""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories import user_repository


# ── OAuth2 Token Extractor ────────────────────────────────────────────────────
#
# OAuth2PasswordBearer is a FastAPI utility that:
# 1. Looks for the "Authorization: Bearer <token>" header in every request
# 2. Extracts the token string (without the "Bearer " prefix)
# 3. Returns it for our dependency to use
#
# tokenUrl="/api/v1/auth/login" tells Swagger UI where to log in.
# This enables the "Authorize" button in Swagger to test protected routes.

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Main Authentication Dependency ────────────────────────────────────────────

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Extract and validate the current user from the JWT token.

    Used to protect endpoints — only authenticated users can access
    routes that depend on this function.

    Args:
        token: JWT token automatically extracted from Authorization header
        db:    Database session from get_db dependency

    Returns:
        The authenticated User object

    Raises:
        HTTPException 401: If token is missing, invalid, expired, or user
                           no longer exists / is deactivated

    Usage in a route:
        @router.get("/me")
        def read_me(current_user: User = Depends(get_current_user)):
            return current_user
    """
    # ── Standard credentials exception ───────────────────────
    # Used for all auth failures. Single, consistent error message.
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # ── Step 1: Decode the JWT token ─────────────────────────
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")

        if user_id_str is None:
            raise credentials_exception

    except JWTError:
        # JWT errors include:
        # - Invalid signature (tampered token)
        # - Expired token
        # - Malformed token
        raise credentials_exception

    # ── Step 2: Convert string UUID to UUID object ───────────
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # ── Step 3: Look up the user in the database ─────────────
    user = user_repository.get_user_by_id(db, user_id)

    if user is None:
        # Token was valid, but the user doesn't exist anymore.
        # (e.g., account was deleted after token was issued)
        raise credentials_exception

    # ── Step 4: Check the account is still active ────────────
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    return user


# ── Type Alias For Cleaner Route Signatures ───────────────────────────────────
#
# Instead of writing this in every route:
#     current_user: User = Depends(get_current_user)
#
# We can write:
#     current_user: CurrentUser
#
# Cleaner, easier to read, and the type is still enforced.

CurrentUser = Annotated[User, Depends(get_current_user)]