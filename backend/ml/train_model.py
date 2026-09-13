"""
ml/train_model.py
──────────────────
Trains a Random Forest Regressor on the waste dataset.
Target  : Waste Generated (Tons/Day)
Features: City, Waste Type, Population Density,
          Municipal Efficiency Score, Year

Run with:
    python ml/train_model.py
"""

import os
import sys
import logging
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.pipeline import Pipeline

# Allow import from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import ActiveConfig
from utils.csv_loader import load_and_clean_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(levelname)s — %(message)s")
logger = logging.getLogger(__name__)


# ── Feature columns used for training ─────────────────────────────────────────
FEATURE_COLS  = ["city", "wasteType", "populationDensity", "municipalEfficiency", "year"]
TARGET_COL    = "wasteGenerated"
MODEL_VERSION = "1.0"


def train_model():
    """Main training pipeline."""

    # ── 1. Load & clean dataset ───────────────────────────────────────────────
    logger.info("Loading dataset...")
    df = load_and_clean_csv(ActiveConfig.DATASET_PATH)
    logger.info(f"Dataset shape: {df.shape}")

    # ── 2. Feature engineering ────────────────────────────────────────────────
    X = df[FEATURE_COLS].copy()
    y = df[TARGET_COL].copy()

    # Label-encode categorical columns
    le_city  = LabelEncoder()
    le_waste = LabelEncoder()

    X["city"]      = le_city.fit_transform(X["city"])
    X["wasteType"] = le_waste.fit_transform(X["wasteType"])

    logger.info(f"Features shape: {X.shape}, Target shape: {y.shape}")

    # ── 3. Train/test split ───────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    logger.info(f"Train: {len(X_train)}, Test: {len(X_test)}")

    # ── 4. Train Random Forest model ──────────────────────────────────────────
    logger.info("Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)

    # ── 5. Evaluate model ─────────────────────────────────────────────────────
    y_pred = rf_model.predict(X_test)
    mse    = mean_squared_error(y_test, y_pred)
    rmse   = np.sqrt(mse)
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)

    logger.info(f"Model Metrics:")
    logger.info(f"  RMSE : {rmse:.2f}")
    logger.info(f"  MAE  : {mae:.2f}")
    logger.info(f"  R²   : {r2:.4f}")

    # Cross-validation score
    cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring="r2")
    logger.info(f"  CV R² (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ── 6. Feature importance ─────────────────────────────────────────────────
    importances = dict(zip(FEATURE_COLS, rf_model.feature_importances_))
    logger.info(f"Feature Importances: {importances}")

    # ── 7. Save model + encoders ──────────────────────────────────────────────
    model_path = ActiveConfig.MODEL_PATH
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    model_bundle = {
        "model":        rf_model,
        "le_city":      le_city,
        "le_waste":     le_waste,
        "feature_cols": FEATURE_COLS,
        "target_col":   TARGET_COL,
        "version":      MODEL_VERSION,
        "metrics": {
            "rmse":      round(rmse, 2),
            "mae":       round(mae, 2),
            "r2":        round(r2, 4),
            "cv_r2_mean":round(float(cv_scores.mean()), 4),
        },
        "city_classes":      list(le_city.classes_),
        "wastetype_classes": list(le_waste.classes_),
    }

    joblib.dump(model_bundle, model_path)
    logger.info(f"Model saved to: {model_path}")

    return model_bundle


if __name__ == "__main__":
    train_model()
    logger.info("Training complete.")
