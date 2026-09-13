"""
models/user.py
──────────────
User model schema for MongoDB.
Handles password hashing and user document structure.
"""

import bcrypt
from datetime import datetime


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt   = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_user_document(name: str, email: str, password: str,
                          role: str = "admin", phone: str = "",
                          department: str = "Waste Management Division",
                          city: str = "Mumbai") -> dict:
    """Build a new user document for MongoDB insertion."""
    return {
        "name":       name,
        "email":      email.lower().strip(),
        "password":   hash_password(password),
        "role":       role,
        "phone":      phone,
        "department": department,
        "city":       city,
        "bio":        "Data Science engineer specializing in urban waste management.",
        "isActive":   True,
        "createdAt":  datetime.utcnow(),
        "updatedAt":  datetime.utcnow(),
    }


def user_to_dict(user_doc: dict) -> dict:
    """Convert user MongoDB doc to safe public dict (no password)."""
    return {
        "id":         str(user_doc.get("_id", "")),
        "name":       user_doc.get("name", ""),
        "email":      user_doc.get("email", ""),
        "role":       user_doc.get("role", "admin"),
        "phone":      user_doc.get("phone", ""),
        "department": user_doc.get("department", ""),
        "city":       user_doc.get("city", ""),
        "bio":        user_doc.get("bio", ""),
        "isActive":   user_doc.get("isActive", True),
        "createdAt":  str(user_doc.get("createdAt", "")),
    }
