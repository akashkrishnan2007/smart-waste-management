"""
models/prediction.py
─────────────────────
Prediction history document schema for MongoDB.
"""

from datetime import datetime


def create_prediction_document(input_data: dict, result: dict, user_id: str = "") -> dict:
    """Build a prediction history document storing all 9 input fields."""
    return {
        "userId":              user_id,
        "city":                input_data.get("city", ""),
        "wasteType":           input_data.get("wasteType", ""),
        "populationDensity":   float(input_data.get("populationDensity", 0)),
        "municipalEfficiency": float(input_data.get("municipalEfficiency", 0)),
        "recyclingRate":       float(input_data.get("recyclingRate", 0)),
        "cost":                float(input_data.get("cost", 0)),
        "awareness":           int(input_data.get("awareness", 0)),
        "landfillCapacity":    int(input_data.get("landfillCapacity", 0)),
        "year":                int(input_data.get("year", 2024)),
        "predictedWaste":      round(float(result.get("predictedWaste", 0)), 2),
        "confidence":          round(float(result.get("confidence", 0)), 2),
        "modelVersion":        result.get("modelVersion", "1.0"),
        "createdAt":           datetime.utcnow(),
    }
