"""
Authentication Endpoints
========================
HTTP routes for user authentication operations.

Endpoints:
- POST /auth/register   → Create a new user account
- POST /auth/login      → Authenticate and receive JWT token
- GET  /auth/me         → Get current authenticated user's profile

Layer pattern:
- This file (router)    → handles HTTP concerns only
- auth_service.py       → handles business logic
- user_repository.py    → handles database queries

Routes are intentionally THIN. They just:
1. Receive validated input (via Pydantic)
2. Call a service function
3. Return the result (via Pydantic)
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse
from app.services import auth_service
from app.dependencies.auth import CurrentUser


# ── Router Setup ──────────────────────────────────────────────────────────────
#
# prefix="/auth" means every route in this file starts with /auth
# tags=["Authentication"] groups routes in Swagger UI for better organization

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── POST /auth/register ───────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Creates a new user account with the provided details. "
        "Returns a JWT access token so the user is logged in immediately."
    ),
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user.

    Flow:
    1. Validate input (Pydantic handles this automatically)
    2. Call auth_service.register_user() to create the account
    3. Generate a JWT token for the new user
    4. Return token + user data

    Why return a token immediately?
    Better UX — user doesn't need to log in after registering.
    They can start using the app right away.
    """
    # Create the user (business logic in service layer)
    new_user = auth_service.register_user(db, user_data)

    # Generate a token so they're logged in immediately
    token = auth_service.generate_token_for_user(new_user)

    # Return the token + user info using our TokenResponse schema
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate and receive JWT token",
    description=(
        "Verifies user credentials and returns a JWT access token. "
        "Use this token in the Authorization header for protected endpoints."
    ),
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate a user and return a JWT token.

    Flow:
    1. Validate credentials format (Pydantic)
    2. Verify email + password match (service layer)
    3. Generate JWT token
    4. Return token + user data
    """
    # Verify credentials (raises 401 if invalid)
    user = auth_service.authenticate_user(
        db,
        email=credentials.email,
        password=credentials.password,
    )

    # Generate JWT
    token = auth_service.generate_token_for_user(user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


# ── GET /auth/me ──────────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user",
    description=(
        "Returns the profile of the currently authenticated user. "
        "Requires a valid JWT token in the Authorization header."
    ),
)
def read_current_user(current_user: CurrentUser) -> UserResponse:
    """
    Return the currently authenticated user's profile.

    This endpoint is PROTECTED — it requires a valid JWT token.
    The CurrentUser dependency handles all the auth validation.

    Flow:
    1. CurrentUser dependency extracts user from JWT
    2. We just return the user
    3. UserResponse schema strips out sensitive fields (password_hash)
    """
    return UserResponse.model_validate(current_user)