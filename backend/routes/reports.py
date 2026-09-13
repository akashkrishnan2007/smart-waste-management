"""
routes/reports.py
──────────────────
Report generation and download endpoints.
"""

from flask import Blueprint, request, jsonify, send_file
import logging
from config import ActiveConfig
from services.report_service import (
    generate_pdf_report,
    generate_excel_report,
    get_reports_list,
    download_report,
)
from utils.helpers import success_response, error_response
from utils.validators import validate_report_input

logger = logging.getLogger(__name__)

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("", methods=["GET"])
def list_reports():
    """Get list of generated reports."""
    try:
        from app import get_db
        db = get_db()

        reports = get_reports_list(db)
        return jsonify(success_response(reports, "Reports list fetched.")[0]), 200

    except Exception as e:
        logger.error(f"List reports error: {e}")
        return jsonify(error_response("Failed to fetch reports list.", 500)[0]), 500


@reports_bp.route("", methods=["POST"])
def generate_report():
    """
    Generate a new report (PDF or Excel).
    Expects JSON: { "name": "...", "type": "PDF|Excel", "filters": {...} }
    """
    try:
        from app import get_db
        db = get_db()

        data = request.get_json()
        if not data:
            return jsonify(error_response("Request body must be JSON.", 422)[0]), 422

        # Validate
        errors = validate_report_input(data)
        if errors:
            return jsonify(error_response("Validation failed.", 422, errors)[0]), 422

        name = data.get("name", "Waste Report")
        report_type = data.get("type", "PDF")
        filters = data.get("filters", {})

        if report_type.upper() == "PDF":
            result = generate_pdf_report(db, name, report_type, filters)
        elif report_type.upper() in ["EXCEL", "XLSX"]:
            result = generate_excel_report(db, name, report_type, filters)
        else:
            return jsonify(error_response("Invalid report type. Use 'PDF' or 'Excel'.", 422)[0]), 422

        return jsonify(success_response(result, "Report generated successfully.")[0]), 200

    except Exception as e:
        logger.error(f"Generate report error: {e}")
        return jsonify(error_response("Failed to generate report.", 500)[0]), 500


@reports_bp.route("/<report_id>/download", methods=["GET"])
def download(report_id):
    """Download a generated report file."""
    try:
        from app import get_db
        db = get_db()

        filepath, filename = download_report(db, report_id)
        if not filepath or not filename:
            return jsonify(error_response("Report not found.", 404)[0]), 404

        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename,
            mimetype="application/pdf" if filename.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        logger.error(f"Download error: {e}")
        return jsonify(error_response("Failed to download report.", 500)[0]), 500