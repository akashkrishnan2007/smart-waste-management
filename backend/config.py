"""
config.py
─────────
Centralised configuration for the Smart Waste Management backend.
All values are read from the .env file via python-dotenv.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""

    # ── Flask ──────────────────────────────────────────────
    SECRET_KEY        = os.getenv("SECRET_KEY", "fallback-secret-key")
    FLASK_ENV         = os.getenv("FLASK_ENV", "development")
    DEBUG             = os.getenv("FLASK_DEBUG", "True").lower() == "true"

    # ── MongoDB ────────────────────────────────────────────
    MONGO_URI         = os.getenv(
        "MONGO_URI",
        "mongodb://localhost:27017/smart_waste_db"
    )
    DB_NAME           = "smart_waste_db"

    # ── JWT ────────────────────────────────────────────────
    JWT_SECRET_KEY    = os.getenv("JWT_SECRET_KEY", "fallback-jwt-key")
    JWT_EXPIRY_HOURS  = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    # ── CORS ───────────────────────────────────────────────
    FRONTEND_URL      = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # ── Paths ──────────────────────────────────────────────
    BASE_DIR          = os.path.dirname(os.path.abspath(__file__))
    DATASET_PATH      = os.path.join(
        BASE_DIR,
        os.getenv("DATASET_PATH", "dataset/Waste_Management_and_Recycling_India.csv")
    )
    MODEL_PATH        = os.path.join(
        BASE_DIR,
        os.getenv("MODEL_PATH", "ml/waste_model.pkl")
    )
    REPORTS_DIR       = os.path.join(BASE_DIR, "generated_reports")


class DevelopmentConfig(Config):
    """Development-specific configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production-specific configuration."""
    DEBUG = False


# ── Active config ──────────────────────────────────────────
config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
}

ActiveConfig = config_map.get(os.getenv("FLASK_ENV", "development"), DevelopmentConfig)
