"""
services/prediction_service.py
───────────────────────────────
Handles ML prediction logic and prediction history storage.
"""

import logging
from ml.predict import predict_waste, get_model_info
from models.prediction import create_prediction_document
from utils.helpers import serialize_doc

logger = logging.getLogger(__name__)


def make_prediction(db, input_data: dict, user_id: str = "") -> dict:
    """
    Generate a waste prediction and store in database.

    Args:
        db: MongoDB database instance
        input_data: 9-field input dict matching the Colab model
        user_id: User ID who made the prediction

    Returns:
        Prediction result dict with predictedWaste, confidence, featureImportance

    Raises:
        ValueError: On validation failure or unknown city/waste_type
    """
    try:
        result = predict_waste(
            city=input_data["city"],
            waste_type=input_data["wasteType"],
            population_density=float(input_data["populationDensity"]),
            municipal_efficiency=float(input_data["municipalEfficiency"]),
            recycling_rate=float(input_data["recyclingRate"]),
            cost=float(input_data["cost"]),
            awareness=int(input_data["awareness"]),
            landfill_capacity=int(input_data["landfillCapacity"]),
            year=int(input_data["year"]),
        )

        # Store prediction history (non-blocking — failure does not abort response)
        try:
            doc = create_prediction_document(input_data, result, user_id)
            db["predictions"].insert_one(doc)
        except Exception as e:
            logger.warning(f"Failed to store prediction history: {e}")

        logger.info(
            f"Prediction: {input_data['city']} / {input_data['wasteType']} "
            f"= {result['predictedWaste']} T (confidence {result['confidence']}%)"
        )
        return result

    except (KeyError, TypeError) as e:
        raise ValueError(f"Missing or invalid field: {e}")
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise ValueError(f"Prediction failed: {str(e)}")


def get_prediction_history(db, user_id: str = "", limit: int = 50) -> list:
    """Fetch recent prediction history."""
    try:
        query = {"userId": user_id} if user_id else {}
        cursor = db["predictions"].find(query).sort("createdAt", -1).limit(limit)
        return [serialize_doc(doc) for doc in cursor]
    except Exception as e:
        logger.error(f"Error fetching prediction history: {e}")
        return []


def get_model_info_wrapper() -> dict:
    """Return metadata about the ML model."""
    try:
        return get_model_info()
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return {"error": str(e)}
