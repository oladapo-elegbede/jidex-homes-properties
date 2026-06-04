"""
Authentication Schemas
=======================
Pydantic schemas for authentication-related API operations:
- Login (request + response)
- Register (request + response)
- Token (the JWT structure returned to clients)

These schemas are the "contract" between our API and the frontend.
The frontend knows EXACTLY what to send and what to expect back.
"""

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


# ── Login Request ─────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    """
    Schema for user login.

    Used by: POST /api/v1/auth/login

    The user sends their email and password.
    The server verifies them and returns a JWT token.
    """
    email: EmailStr = Field(
        description="Registered email address.",
    )
    password: str = Field(
        min_length=1,           # Just require non-empty for login
        max_length=128,         # Don't reject long-but-valid passwords
        description="Account password.",
    )


# ── JWT Token Response ────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    """
    Schema for the JWT token returned after successful login.

    The frontend stores this token and attaches it to future requests
    via the Authorization header:
        Authorization: Bearer eyJhbGc...

    Format follows the OAuth 2.0 Bearer token standard.

    Example response:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "token_type": "bearer",
            "user": { ... user object ... }
        }
    """
    access_token: str = Field(
        description="JWT access token (signed and verifiable).",
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer' for JWT).",
    )
    user: UserResponse = Field(
        description="The authenticated user's profile information.",
    )


# ── JWT Token Payload (Internal Use) ──────────────────────────────────────────
class TokenPayload(BaseModel):
    """
    Schema for the data INSIDE a JWT token.

    This is used internally when we decode a token to verify a request.
    It represents what's stored in the token's claims:
        - sub:   user ID (UUID as string)
        - role:  user role for permission checks
        - email: user email for convenience
        - exp:   expiry timestamp

    Not returned to clients directly — used only inside dependencies.
    """
    sub: str = Field(description="Subject (user ID as UUID string).")
    role: str = Field(description="User role for permission checks.")
    email: str = Field(description="User email.")
    exp: int = Field(description="Expiry timestamp (Unix epoch seconds).")