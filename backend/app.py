"""
app.py
───────
Flask application factory.
Configures MongoDB, CORS, logging, and registers all blueprints.
"""

import logging
import sys
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# ── Path setup ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from config import ActiveConfig
from routes.auth import ensure_admin_seeded

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(BASE_DIR, "app.log"))
    ]
)
logger = logging.getLogger("app")
logger.info("=" * 60)
logger.info("Smart Waste Management Backend - Starting Up")
logger.info("=" * 60)


# ── Flask factory ─────────────────────────────────────────────────────────────
def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(ActiveConfig)

    # ── CORS configuration ────────────────────────────────────────────────────
    # FRONTEND_URL may be comma-separated for multiple allowed origins
    allowed_origins = [o.strip() for o in ActiveConfig.FRONTEND_URL.split(",") if o.strip()]
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": allowed_origins}})

    # ── MongoDB connection ────────────────────────────────────────────────────
    try:
        mongo_client = MongoClient(
            ActiveConfig.MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=30000,
        )
        # Verify connection
        mongo_client.admin.command("ping")
        app.db = mongo_client[ActiveConfig.DB_NAME]
        logger.info(f"MongoDB Connected: {ActiveConfig.DB_NAME}")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}", exc_info=True)
        raise

    # ── Register blueprints ───────────────────────────────────────────────────
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    from routes.waste import waste_bp
    from routes.analytics import analytics_bp
    from routes.prediction import prediction_bp
    from routes.reports import reports_bp
    from routes.landfill import landfill_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(waste_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(landfill_bp)

    # ── Seed admin and CSV data on first run ──────────────────────────────────
    with app.app_context():
        try:
            ensure_admin_seeded(app.db)
            logger.info("Admin User Seeded")
        except Exception as e:
            logger.error(f"Admin seed error: {e}", exc_info=True)

        try:
            from services.data_service import seed_database_from_csv
            result = seed_database_from_csv(app.db, ActiveConfig.DATASET_PATH)
            if result.get("skipped"):
                logger.info("Dataset already exists. Skipping import.")
            else:
                logger.info(f"Dataset Imported Successfully — inserted: {result['inserted']}, updated: {result['updated']}")
        except Exception as e:
            logger.error(f"Dataset import error: {e}", exc_info=True)

        # ── Load ML model once at startup ─────────────────────────────────────
        try:
            from ml.predict import load_model
            load_model()
            logger.info("ML model loaded successfully at startup.")
        except Exception as e:
            logger.error(f"ML model load error: {e}", exc_info=True)

    # ── Global error handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return {"success": False, "message": "Endpoint not found.", "timestamp": datetime.utcnow().isoformat()}, 404

    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Internal server error: {e}")
        return {"success": False, "message": "Internal server error.", "timestamp": datetime.utcnow().isoformat()}, 500

    @app.errorhandler(405)
    def method_not_allowed(e):
        return {"success": False, "message": "Method not allowed.", "timestamp": datetime.utcnow().isoformat()}, 405

    # ── Health check endpoint ─────────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {
            "success": True,
            "message": "Smart Waste Management API is running.",
            "environment": ActiveConfig.FLASK_ENV,
            "timestamp": datetime.utcnow().isoformat()
        }, 200

    # ── /api/predict alias (frontend compatibility) ───────────────────────────
    @app.route("/api/predict", methods=["POST"])
    def predict_alias():
        from routes.prediction import _run_prediction
        return _run_prediction()

    # ── /api/predict/simulate alias ───────────────────────────────────────────
    @app.route("/api/predict/simulate", methods=["POST"])
    def simulate_alias():
        from routes.prediction import simulate as _simulate
        return _simulate()

    # ── API documentation endpoint ────────────────────────────────────────────
    @app.route("/api/docs", methods=["GET"])
    def api_docs():
        docs = {
            "title": "Smart Waste Management Analytics API",
            "version": "1.0.0",
            "base_url": request.url_root.rstrip("/") + "/api",
            "endpoints": {
                "Authentication": {
                    "POST /api/auth/login": "Login with email & password",
                    "GET /api/auth/me": "Get current user info (requires token)",
                },
                "Dashboard": {
                    "GET /api/dashboard": "Get overview statistics & chart data",
                    "GET /api/dashboard/trend": "Get waste generation trend",
                    "GET /api/dashboard/city-comparison": "Get city comparison data",
                    "GET /api/dashboard/summary": "Get quick summary numbers",
                    "GET /api/dashboard/alerts": "Get smart alerts from real data",
                    "GET /api/dashboard/high-risk-cities": "Get count of high-risk cities",
                },
                "Waste Records": {
                    "GET /api/waste": "Get all waste records (supports filtering & pagination)",
                    "POST /api/waste": "Create new waste record",
                    "PUT /api/waste/<id>": "Update waste record",
                    "DELETE /api/waste/<id>": "Delete waste record",
                    "POST /api/waste/upload": "Bulk upload records",
                    "GET /api/waste/options": "Get dropdown options (cities, types, years)",
                    "GET /api/waste/trend": "Get waste trend data",
                    "GET /api/waste/city-comparison": "Get city comparison data",
                },
                "Analytics": {
                    "GET /api/analytics": "Get detailed analytics",
                    "GET /api/analytics/cities": "Get list of cities",
                    "GET /api/analytics/waste-types": "Get list of waste types",
                    "GET /api/analytics/years": "Get list of years",
                    "GET /api/analytics/landfills": "Get landfill analytics",
                    "GET /api/analytics/disposal-methods": "Get disposal method breakdown",
                },
                "Prediction": {
                    "POST /api/prediction": "Generate ML prediction with risk analysis and recommendations",
                    "POST /api/prediction/simulate": "What-if scenario simulation",
                    "GET /api/prediction/history": "Get prediction history",
                    "GET /api/prediction/model-info": "Get model metadata",
                },
                "Reports": {
                    "GET /api/reports": "Get list of generated reports",
                    "POST /api/reports": "Generate new report (PDF/Excel)",
                    "GET /api/reports/<id>/download": "Download report file",
                },
                "Landfills": {
                    "GET /api/landfills": "Get all landfill data with pressure analysis",
                    "GET /api/landfills/pressure": "Get landfill pressure analysis summary",
                    "GET /api/landfills/<name>": "Get landfill details",
                    "GET /api/landfills/status": "Get landfill status summary",
                },
            },
            "notes": {
                "authentication": "All protected endpoints require Bearer token in Authorization header.",
                "pagination": "Use 'page' and 'perPage' query params for paginated endpoints.",
                "filters": "Most endpoints accept optional filter query parameters.",
            }
        }
        return jsonify(docs), 200

    logger.info("Flask application initialized successfully.")
    return app


# ── DB getter for routes (used in lazy imports) ──────────────────────────────
# Uses Flask's application context — safe under gunicorn multi-worker.
def get_db():
    """Return the db attached to the current Flask app instance."""
    from flask import current_app
    return current_app.db


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("Starting Flask development server...")
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=ActiveConfig.DEBUG)
