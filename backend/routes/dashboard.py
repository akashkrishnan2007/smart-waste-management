"""
routes/dashboard.py
────────────────────
Dashboard endpoints for overview statistics, chart data, smart alerts.
"""

from flask import Blueprint, request, jsonify
import logging
from services.analytics_service import get_dashboard_stats
from services.data_service import get_waste_trend, get_city_comparison
from services.alert_service import get_smart_alerts
from utils.helpers import success_response, error_response

logger = logging.getLogger(__name__)

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("", methods=["GET"])
def get_dashboard():
    """Get dashboard overview statistics."""
    try:
        from app import get_db
        db = get_db()
        stats = get_dashboard_stats(db)
        return jsonify(success_response(stats, "Dashboard data fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        return jsonify(error_response("Failed to fetch dashboard data.", 500)[0]), 500


@dashboard_bp.route("/trend", methods=["GET"])
def get_trend_data():
    """Get waste generation trend data for line charts."""
    try:
        from app import get_db
        db = get_db()
        year = request.args.get("year", 2023, type=int)
        trend = get_waste_trend(db, year=year)
        return jsonify(success_response(trend, "Trend data fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Trend error: {e}")
        return jsonify(error_response("Failed to fetch trend data.", 500)[0]), 500


@dashboard_bp.route("/city-comparison", methods=["GET"])
def get_city_comparison_data():
    """Get city comparison data for bar charts."""
    try:
        from app import get_db
        db = get_db()
        year = request.args.get("year", None, type=int)
        cities = get_city_comparison(db, year=year)
        return jsonify(success_response(cities, "City comparison fetched.")[0]), 200
    except Exception as e:
        logger.error(f"City comparison error: {e}")
        return jsonify(error_response("Failed to fetch city comparison.", 500)[0]), 500


@dashboard_bp.route("/summary", methods=["GET"])
def get_summary():
    """Get quick summary numbers for stat cards."""
    try:
        from app import get_db
        db = get_db()
        stats = get_dashboard_stats(db)
        summary = {
            "totalWasteGenerated":    stats.get("totalWasteGenerated", 0),
            "avgRecyclingRate":       stats.get("avgRecyclingRate", 0),
            "totalCities":            stats.get("totalCities", 0),
            "avgManagementCost":      stats.get("avgManagementCost", 0),
            "municipalEfficiencyScore": stats.get("municipalEfficiencyScore", 0),
        }
        return jsonify(success_response(summary, "Summary fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Summary error: {e}")
        return jsonify(error_response("Failed to fetch summary.", 500)[0]), 500


@dashboard_bp.route("/alerts", methods=["GET"])
def get_alerts():
    """
    GET /api/dashboard/alerts
    Returns smart alerts generated from real waste dataset values.
    Alerts are data-driven — no static/dummy content.
    """
    try:
        from app import get_db
        db = get_db()
        result = get_smart_alerts(db)
        return jsonify(success_response(result, "Alerts fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Alerts error: {e}")
        return jsonify(error_response("Failed to fetch alerts.", 500)[0]), 500


@dashboard_bp.route("/high-risk-cities", methods=["GET"])
def get_high_risk_cities():
    """
    GET /api/dashboard/high-risk-cities
    Returns count of cities currently requiring attention based on real data.
    """
    try:
        from app import get_db
        db = get_db()
        result = get_smart_alerts(db)
        return jsonify(success_response(
            {"high_risk_cities": result.get("high_risk_cities", 0)},
            "High risk cities count fetched."
        )[0]), 200
    except Exception as e:
        logger.error(f"High risk cities error: {e}")
        return jsonify(error_response("Failed to fetch high risk cities.", 500)[0]), 500
