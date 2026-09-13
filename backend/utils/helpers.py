"""
utils/helpers.py
────────────────
Shared helper utilities used across the backend.
"""

import math
import logging
from datetime import datetime
from bson import ObjectId


logger = logging.getLogger(__name__)


def success_response(data=None, message="Success", status=200):
    """Return a standardised JSON success response."""
    return {
        "success": True,
        "message": message,
        "data":    data,
        "timestamp": datetime.utcnow().isoformat()
    }, status


def error_response(message="An error occurred", status=400, details=None):
    """Return a standardised JSON error response."""
    payload = {
        "success": False,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    if details:
        payload["details"] = details
    return payload, status


def serialize_doc(doc):
    """
    Recursively convert a MongoDB document to a JSON-serialisable dict.
    Converts ObjectId → str.
    """
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc


def round_2(value):
    """Round a float to 2 decimal places safely."""
    try:
        return round(float(value), 2)
    except (TypeError, ValueError):
        return 0.0


def safe_int(value, default=0):
    """Convert value to int safely."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def safe_float(value, default=0.0):
    """Convert value to float safely."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def paginate(items, page, per_page):
    """
    Paginate a list of items.
    Returns: (paginated_items, total_count, total_pages)
    """
    total       = len(items)
    total_pages = math.ceil(total / per_page) if per_page > 0 else 1
    start       = (page - 1) * per_page
    end         = start + per_page
    return items[start:end], total, total_pages


def get_trend(current, previous):
    """Calculate percentage trend between two values."""
    if previous == 0:
        return 0.0
    return round_2(((current - previous) / previous) * 100)
