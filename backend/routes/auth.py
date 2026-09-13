"""
routes/auth.py
──────────────
Authentication endpoints: login, logout (optional), user info.
"""

from flask import Blueprint, request, jsonify
import logging
from bson import ObjectId
from config import ActiveConfig
from services.auth_service import login_user, seed_admin_user
from utils.helpers import success_response, error_response, serialize_doc
from utils.validators import validate_login

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── Initialize admin seed (called by app.py on first run) ─────────────────────
def ensure_admin_seeded(db):
    """Seed default admin if no users exist."""
    try:
        seed_admin_user(db)
    except Exception as e:
        logger.error(f"Admin seed error: {e}")


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login endpoint.
    Expects JSON: { "email": "...", "password": "..." }
    Returns: { "token": "...", "user": {...} }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify(error_response("Request body must be JSON.")[0]), 400

        # Validate input
        errors = validate_login(data)
        if errors:
            return jsonify(error_response("Validation failed.", 422, errors)[0]), 422

        # Import DB lazily to avoid circular imports
        from app import get_db
        db = get_db()

        # Attempt login
        result = login_user(db, data["email"], data["password"])

        # Serialize user
        user_data = serialize_doc(result["user"])

        logger.info(f"Login successful: {data['email']}")
        return jsonify(success_response(
            {"token": result["token"], "user": user_data},
            "Login successful."
        )[0]), 200

    except ValueError as ve:
        logger.warning(f"Login failed: {str(ve)}")
        return jsonify(error_response(str(ve), 401)[0]), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify(error_response("Internal server error.", 500)[0]), 500


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    """Get current user info from JWT token."""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify(error_response("Missing or invalid authorization token.", 401)[0]), 401

        token = auth_header.split(" ")[1]

        from app import get_db
        from services.auth_service import decode_token
        from models.user import user_to_dict

        # Decode token
        try:
            payload = decode_token(token)
        except Exception as e:
            logger.warning(f"Invalid token: {e}")
            return jsonify(error_response("Invalid token.", 401)[0]), 401

        user_id = payload.get("sub")
        if not user_id:
            return jsonify(error_response("Invalid token payload.", 401)[0]), 401

        # Fetch user
        db = get_db()
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify(error_response("User not found.", 404)[0]), 404

        user_data = user_to_dict(user)
        return jsonify(success_response(user_data, "User fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Error fetching current user: {e}")
        return jsonify(error_response("Internal server error.", 500)[0]), 500


@auth_bp.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify(success_response({"status": "healthy"}, "Auth service is running.")[0]), 200