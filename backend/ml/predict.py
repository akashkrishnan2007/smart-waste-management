"""
ml/predict.py
──────────────
Loads the trained Random Forest model and separate encoders (from Google Colab).
Model is cached at module level — loaded once when Flask starts.

Model expects 9 features (original CSV column names):
  City, WasteType, Population Density, Municipal Efficiency Score,
  Recycling Rate, Cost of Waste Management, Awareness Campaigns Count,
  Landfill Capacity, Year
"""

import os
import sys
import logging
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import ActiveConfig

logger = logging.getLogger(__name__)

# ── Module-level cache (loaded once at startup) ───────────────────────────────
_model     = None
_le_city   = None
_le_waste  = None

# Exact feature column names the Colab model was trained with
FEATURE_COLS = [
    "City",
    "WasteType",
    "Population Density (People/km\u00b2)",
    "Municipal Efficiency Score (1-10)",
    "Recycling Rate (%)",
    "Cost of Waste Management (\u20b9/Ton)",
    "Awareness Campaigns Count",
    "Landfill Capacity (Tons)",
    "Year",
]


def load_model() -> None:
    """Load and cache the model and encoders from disk. Called once at startup."""
    global _model, _le_city, _le_waste
    if _model is not None:
        return

    base_dir   = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "waste_model.pkl")
    city_path  = os.path.join(base_dir, "city_encoder.pkl")
    waste_path = os.path.join(base_dir, "waste_encoder.pkl")

    for path in (model_path, city_path, waste_path):
        if not os.path.exists(path):
            raise FileNotFoundError(f"ML artifact not found: {path}")

    _model    = joblib.load(model_path)
    _le_city  = joblib.load(city_path)
    _le_waste = joblib.load(waste_path)
    logger.info("ML model and encoders loaded successfully.")


def _encode(encoder, value: str, label: str) -> int:
    """Encode a categorical value; raise ValueError if unseen."""
    classes = list(encoder.classes_)
    if value not in classes:
        raise ValueError(
            f"Unknown {label}: '{value}'. Valid options: {classes}"
        )
    return int(encoder.transform([value])[0])


def predict_waste(
    city: str,
    waste_type: str,
    population_density: float,
    municipal_efficiency: float,
    recycling_rate: float,
    cost: float,
    awareness: int,
    landfill_capacity: int,
    year: int,
) -> dict:
    """
    Generate a waste prediction using the Colab-trained model.

    Returns dict with predictedWaste, confidence, featureImportance.
    Raises ValueError for unknown city/waste_type or if model not loaded.
    """
    if _model is None:
        raise RuntimeError("ML model not loaded. Call load_model() at startup.")

    city_enc  = _encode(_le_city,  city,       "city")
    waste_enc = _encode(_le_waste, waste_type, "waste_type")

    X = pd.DataFrame([[
        city_enc,
        waste_enc,
        float(population_density),
        float(municipal_efficiency),
        float(recycling_rate),
        float(cost),
        int(awareness),
        int(landfill_capacity),
        int(year),
    ]], columns=FEATURE_COLS)

    predicted_value = max(round(float(_model.predict(X)[0]), 2), 0.0)

    # Confidence from tree variance (coefficient of variation)
    tree_preds = np.array([t.predict(X)[0] for t in _model.estimators_])
    mean_pred  = np.mean(tree_preds)
    cv         = (np.std(tree_preds) / mean_pred * 100) if mean_pred > 0 else 100
    confidence = round(max(60.0, min(99.0, 100.0 - cv * 0.5)), 1)

    importances = dict(zip(
        FEATURE_COLS,
        [round(float(v), 4) for v in _model.feature_importances_]
    ))

    return {
        "predictedWaste":    predicted_value,
        "confidence":        confidence,
        "modelVersion":      "1.0",
        "featureImportance": importances,
    }


def get_model_info() -> dict:
    """Return metadata about the currently loaded model."""
    if _model is None:
        return {"error": "Model not loaded."}
    return {
        "version":          "1.0",
        "features":         FEATURE_COLS,
        "cityClasses":      list(_le_city.classes_),
        "wasteTypeClasses": list(_le_waste.classes_),
        "nEstimators":      len(_model.estimators_),
    }
