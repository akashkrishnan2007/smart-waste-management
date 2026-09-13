"""
routes/analytics.py
────────────────────
Analytics endpoints for detailed data breakdowns.
"""

from flask import Blueprint, request, jsonify
import logging
from config import ActiveConfig
from services.analytics_service import get_analytics_data, get_dashboard_stats
from services.data_service import get_landfill_data
from utils.helpers import success_response, error_response

logger = logging.getLogger(__name__)

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.route("", methods=["GET"])
def get_analytics():
    """
    Get detailed analytics data.
    Query params: city, year, wasteType (optional filters)
    """
    try:
        from app import get_db
        db = get_db()

        filters = {}
        if request.args.get("city"):
            filters["city"] = request.args.get("city")
        if request.args.get("year"):
            filters["year"] = request.args.get("year", type=int)
        if request.args.get("wasteType"):
            filters["wasteType"] = request.args.get("wasteType")

        data = get_analytics_data(db, filters=filters)
        return jsonify(success_response(data, "Analytics data fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return jsonify(error_response("Failed to fetch analytics.", 500)[0]), 500


@analytics_bp.route("/cities", methods=["GET"])
def get_cities():
    """Get list of all cities."""
    try:
        from app import get_db
        db = get_db()

        stats = get_dashboard_stats(db)
        cities = stats.get("citiesList", [])
        return jsonify(success_response(cities, "Cities fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Cities error: {e}")
        return jsonify(error_response("Failed to fetch cities.", 500)[0]), 500


@analytics_bp.route("/waste-types", methods=["GET"])
def get_waste_types():
    """Get list of all waste types."""
    try:
        from app import get_db
        from services.data_service import get_dropdown_options
        db = get_db()

        options = get_dropdown_options(db)
        return jsonify(success_response(options.get("wasteTypes", []), "Waste types fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Waste types error: {e}")
        return jsonify(error_response("Failed to fetch waste types.", 500)[0]), 500


@analytics_bp.route("/years", methods=["GET"])
def get_years():
    """Get list of all available years."""
    try:
        from app import get_db
        from services.data_service import get_dropdown_options
        db = get_db()

        options = get_dropdown_options(db)
        return jsonify(success_response(options.get("years", []), "Years fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Years error: {e}")
        return jsonify(error_response("Failed to fetch years.", 500)[0]), 500


@analytics_bp.route("/landfills", methods=["GET"])
def get_landfills():
    """Get landfill analytics data."""
    try:
        from app import get_db
        db = get_db()

        landfills = get_landfill_data(db)
        return jsonify(success_response(landfills, "Landfill data fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Landfill analytics error: {e}")
        return jsonify(error_response("Failed to fetch landfill analytics.", 500)[0]), 500


@analytics_bp.route("/disposal-methods", methods=["GET"])
def get_disposal_methods():
    """Get disposal method breakdown."""
    try:
        from app import get_db
        db = get_db()

        stats = get_dashboard_stats(db)
        disposal_data = stats.get("chartData", {}).get("disposalMethod", [])

        result = []
        for item in disposal_data:
            result.append({
                "method": item.get("method"),
                "total": item.get("total"),
                "count": item.get("count"),
            })

        return jsonify(success_response(result, "Disposal methods fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Disposal methods error: {e}")
        return jsonify(error_response("Failed to fetch disposal methods.", 500)[0]), 500