"""
services/auth_service.py
─────────────────────────
Handles JWT generation/verification and default admin user seeding.
"""

import jwt
import logging
from datetime import datetime, timedelta
from config import ActiveConfig
from models.user import create_user_document, verify_password, user_to_dict

logger = logging.getLogger(__name__)

# ── Default admin credentials (seeded on first run) ───────────────────────────
DEFAULT_ADMIN = {
    "name":       "Admin User",
    "email":      "admin@smartwaste.in",
    "password":   "admin123",
    "role":       "Administrator",
    "phone":      "+91 98765 43210",
    "department": "Waste Management Division",
    "city":       "Mumbai",
}


def generate_token(user_id: str, email: str, role: str) -> str:
    """Generate a signed JWT access token."""
    payload = {
        "sub":   str(user_id),
        "email": email,
        "role":  role,
        "iat":   datetime.utcnow(),
        "exp":   datetime.utcnow() + timedelta(hours=ActiveConfig.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, ActiveConfig.JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Returns the payload dict or raises jwt.InvalidTokenError.
    """
    return jwt.decode(token, ActiveConfig.JWT_SECRET_KEY, algorithms=["HS256"])


def login_user(db, email: str, password: str) -> dict:
    """
    Attempt to log in a user.
    Returns: {"token": ..., "user": ...} on success
    Raises: ValueError on failure
    """
    user = db["users"].find_one({"email": email.lower().strip()})
    if not user:
        raise ValueError("No account found with this email address.")

    if not verify_password(password, user["password"]):
        raise ValueError("Incorrect password. Please try again.")

    if not user.get("isActive", True):
        raise ValueError("Account is deactivated. Contact admin.")

    token     = generate_token(str(user["_id"]), user["email"], user["role"])
    user_data = user_to_dict(user)

    # Update last login timestamp
    db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLogin": datetime.utcnow()}}
    )

    logger.info(f"User logged in: {email}")
    return {"token": token, "user": user_data}


def seed_admin_user(db) -> None:
    """Seed the default admin user if no users exist."""
    count = db["users"].count_documents({})
    if count == 0:
        doc = create_user_document(**DEFAULT_ADMIN)
        db["users"].insert_one(doc)
        logger.info(f"Default admin seeded: {DEFAULT_ADMIN['email']}")
    else:
        logger.info(f"Users collection already has {count} user(s). Skipping seed.")
