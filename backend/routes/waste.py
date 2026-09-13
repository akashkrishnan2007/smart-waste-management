"""
routes/waste.py
───────────────
Waste record CRUD endpoints.
"""

from flask import Blueprint, request, jsonify
import logging
from config import ActiveConfig
from services.data_service import (
    get_all_waste_records,
    get_waste_record_by_id,
    create_waste_record,
    update_waste_record,
    delete_waste_record,
    bulk_upload_records,
    get_dropdown_options,
)
from utils.helpers import success_response, error_response, serialize_doc
from utils.validators import validate_waste_record

logger = logging.getLogger(__name__)

waste_bp = Blueprint("waste", __name__, url_prefix="/api/waste")


@waste_bp.route("", methods=["GET"])
def get_waste_records():
    """
    Get all waste records with optional filtering.
    Query params: city, wasteType, year, disposalMethod, page, perPage
    """
    try:
        from app import get_db
        db = get_db()

        # Get query parameters
        filters = {
            "city": request.args.get("city", ""),
            "wasteType": request.args.get("wasteType", ""),
            "year": request.args.get("year", ""),
            "disposalMethod": request.args.get("disposalMethod", ""),
        }

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("perPage", 50, type=int)

        result = get_all_waste_records(db, filters=filters, page=page, per_page=per_page)
        return jsonify(success_response(result, "Waste records fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Get waste records error: {e}")
        return jsonify(error_response("Failed to fetch waste records.", 500)[0]), 500


@waste_bp.route("/<record_id>", methods=["GET"])
def get_waste_record(record_id):
    """Get a single waste record by ID."""
    try:
        from app import get_db
        db = get_db()

        record = get_waste_record_by_id(db, record_id)
        if not record:
            return jsonify(error_response("Record not found.", 404)[0]), 404

        return jsonify(success_response(record, "Record fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Get record error: {e}")
        return jsonify(error_response("Failed to fetch record.", 500)[0]), 500


@waste_bp.route("", methods=["POST"])
def create_waste():
    """Create a new waste record."""
    try:
        from app import get_db
        db = get_db()

        data = request.get_json()
        if not data:
            return jsonify(error_response("Request body must be JSON.")[0]), 400

        # Validate
        errors = validate_waste_record(data)
        if errors:
            return jsonify(error_response("Validation failed.", 422, errors)[0]), 422

        record = create_waste_record(db, data)
        return jsonify(success_response(record, "Waste record created.", 201)[0]), 201

    except Exception as e:
        logger.error(f"Create waste error: {e}")
        return jsonify(error_response("Failed to create waste record.", 500)[0]), 500


@waste_bp.route("/<record_id>", methods=["PUT"])
def update_waste(record_id):
    """Update an existing waste record."""
    try:
        from app import get_db
        db = get_db()

        data = request.get_json()
        if not data:
            return jsonify(error_response("Request body must be JSON.")[0]), 400

        record = update_waste_record(db, record_id, data)
        if not record:
            return jsonify(error_response("Record not found.", 404)[0]), 404

        return jsonify(success_response(record, "Waste record updated.", 200)[0]), 200

    except Exception as e:
        logger.error(f"Update waste error: {e}")
        return jsonify(error_response("Failed to update waste record.", 500)[0]), 500


@waste_bp.route("/<record_id>", methods=["DELETE"])
def delete_waste(record_id):
    """Delete a waste record."""
    try:
        from app import get_db
        db = get_db()

        success = delete_waste_record(db, record_id)
        if not success:
            return jsonify(error_response("Record not found.", 404)[0]), 404

        return jsonify(success_response(None, "Waste record deleted.", 200)[0]), 200

    except Exception as e:
        logger.error(f"Delete waste error: {e}")
        return jsonify(error_response("Failed to delete waste record.", 500)[0]), 500


@waste_bp.route("/upload", methods=["POST"])
def upload_waste_records():
    """Bulk upload waste records from JSON payload."""
    try:
        from app import get_db
        db = get_db()

        data = request.get_json()
        if not data or "records" not in data:
            return jsonify(error_response("Expected 'records' array in request body.", 422)[0]), 422

        records = data["records"]
        if not isinstance(records, list) or len(records) == 0:
            return jsonify(error_response("Records must be a non-empty array.", 422)[0]), 422

        result = bulk_upload_records(db, records)
        return jsonify(success_response(result, f"Upload complete: {result['inserted']} inserted, {result['updated']} updated.")[0]), 200

    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify(error_response("Failed to upload records.", 500)[0]), 500


@waste_bp.route("/options", methods=["GET"])
def get_options():
    """Get dropdown options: cities, waste types, years."""
    try:
        from app import get_db
        db = get_db()

        options = get_dropdown_options(db)
        return jsonify(success_response(options, "Options fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Options error: {e}")
        return jsonify(error_response("Failed to fetch options.", 500)[0]), 500


@waste_bp.route("/trend", methods=["GET"])
def get_trend():
    """Get waste trend data."""
    try:
        from app import get_db
        db = get_db()

        period = request.args.get("period", "monthly")
        year = request.args.get("year", 2023, type=int)
        trend = get_waste_trend(db, period=period, year=year)
        return jsonify(success_response(trend, "Trend data fetched.")[0]), 200

    except Exception as e:
        logger.error(f"Trend error: {e}")
        return jsonify(error_response("Failed to fetch trend data.", 500)[0]), 500


@waste_bp.route("/city-comparison", methods=["GET"])
def get_city_comp():
    """Get city comparison data."""
    try:
        from app import get_db
        db = get_db()

        year = request.args.get("year", None, type=int)
        cities = get_city_comparison(db, year=year)
        return jsonify(success_response(cities, "City comparison fetched.")[0]), 200

    except Exception as e:
        logger.error(f"City comp error: {e}")
        return jsonify(error_response("Failed to fetch city comparison.", 500)[0]), 500