"""
routes/prediction.py
─────────────────────
ML prediction endpoints.
Includes risk analysis, recommendations, and what-if scenario simulation.
"""

from flask import Blueprint, request, jsonify
import logging
from services.prediction_service import make_prediction, get_prediction_history, get_model_info_wrapper
from utils.helpers import success_response, error_response
from utils.validators import validate_prediction_input

logger = logging.getLogger(__name__)

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api/prediction")


def _extract_user_id():
    """Extract user ID from Bearer token if present."""
    user_id = ""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            from services.auth_service import decode_token
            payload = decode_token(auth_header.split(" ")[1])
            user_id = payload.get("sub", "")
        except Exception:
            pass
    return user_id


def _run_prediction():
    """Shared handler for POST /api/prediction and POST /api/predict."""
    try:
        from app import get_db
        db = get_db()

        data = request.get_json()
        if not data:
            return jsonify(error_response("Request body must be JSON.", 422)[0]), 422

        errors = validate_prediction_input(data)
        if errors:
            return jsonify(error_response("Validation failed.", 422, errors)[0]), 422

        user_id = _extract_user_id()
        result = make_prediction(db, data, user_id=user_id)

        # Enrich with risk analysis and recommendations
        try:
            from services.risk_service import calculate_risk
            from services.recommendation_service import generate_recommendations

            risk = calculate_risk(
                predicted_waste=result["predictedWaste"],
                recycling_rate=float(data["recyclingRate"]),
                municipal_efficiency=float(data["municipalEfficiency"]),
                landfill_capacity=float(data["landfillCapacity"]),
                waste_type=data["wasteType"],
            )

            recommendations = generate_recommendations(
                predicted_waste=result["predictedWaste"],
                risk_level=risk["risk_level"],
                recycling_rate=float(data["recyclingRate"]),
                municipal_efficiency=float(data["municipalEfficiency"]),
                awareness_campaigns=int(data["awareness"]),
                waste_type=data["wasteType"],
                landfill_pressure=risk["component_scores"].get("landfill_pressure", 0),
            )

            result["riskAnalysis"]    = risk
            result["recommendations"] = recommendations
        except Exception as e:
            logger.warning(f"Risk/recommendation enrichment failed: {e}")

        logger.info(
            f"Prediction API: {data.get('city')} / {data.get('wasteType')} "
            f"= {result.get('predictedWaste')} T"
        )
        return jsonify(success_response(result, "Prediction generated.")[0]), 200

    except ValueError as ve:
        logger.warning(f"Prediction error: {ve}")
        return jsonify(error_response(str(ve), 400)[0]), 400
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify(error_response("Prediction failed.", 500)[0]), 500


@prediction_bp.route("", methods=["POST"])
def predict():
    """POST /api/prediction — generate a waste prediction with risk and recommendations."""
    return _run_prediction()


@prediction_bp.route("/simulate", methods=["POST"])
def simulate():
    """
    POST /api/prediction/simulate
    What-If Scenario Simulation.

    Runs the same ML model twice:
      1. With original input values
      2. With scenario-modified values

    Compares both predictions and returns the estimated difference.
    Results are model-based estimates, not guaranteed outcomes.
    """
    try:
        from app import get_db
        from ml.predict import predict_waste
        from utils.validators import validate_prediction_input, validate_scenario_input
        data = request.get_json()
        if not data:
            return jsonify(error_response("Request body must be JSON.", 422)[0]), 422

        scenario = data.get("scenario")
        if not scenario or not isinstance(scenario, dict):
            return jsonify(error_response("'scenario' object is required.", 422)[0]), 422

        # Validate base inputs
        errors = validate_prediction_input(data)
        if errors:
            return jsonify(error_response("Validation failed.", 422, errors)[0]), 422

        # Validate scenario fields
        scenario_errors = validate_scenario_input(scenario)
        if scenario_errors:
            return jsonify(error_response("Scenario validation failed.", 422, scenario_errors)[0]), 422

        # ── Build base prediction ─────────────────────────────────────────────
        base_result = predict_waste(
            city=data["city"],
            waste_type=data["wasteType"],
            population_density=float(data["populationDensity"]),
            municipal_efficiency=float(data["municipalEfficiency"]),
            recycling_rate=float(data["recyclingRate"]),
            cost=float(data["cost"]),
            awareness=int(data["awareness"]),
            landfill_capacity=int(data["landfillCapacity"]),
            year=int(data["year"]),
        )
        current_prediction = base_result["predictedWaste"]

        # ── Build scenario prediction (override only scenario fields) ─────────
        scenario_result = predict_waste(
            city=data["city"],
            waste_type=data["wasteType"],
            population_density=float(data["populationDensity"]),
            municipal_efficiency=float(scenario.get("municipal_efficiency", data["municipalEfficiency"])),
            recycling_rate=float(scenario.get("recycling_rate", data["recyclingRate"])),
            cost=float(scenario.get("cost", data["cost"])),
            awareness=int(scenario.get("awareness", data["awareness"])),
            landfill_capacity=int(data["landfillCapacity"]),
            year=int(scenario.get("year", data["year"])),
        )
        scenario_prediction = scenario_result["predictedWaste"]

        difference = round(current_prediction - scenario_prediction, 2)
        pct_change = round((difference / current_prediction * 100), 2) if current_prediction > 0 else 0.0
        impact_direction = "decrease" if difference > 0 else "increase" if difference < 0 else "no change"

        abs_pct = abs(pct_change)
        message = (
            f"The simulated scenario estimates a {abs_pct:.2f}% {impact_direction} "
            f"in predicted waste generation ({abs(difference):,.2f} T/Day)."
        )

        return jsonify(success_response({
            "current_prediction":  current_prediction,
            "scenario_prediction": scenario_prediction,
            "estimated_difference": difference,
            "percentage_change":   pct_change,
            "impact_direction":    impact_direction,
            "message":             message,
            "disclaimer": (
                "Scenario results are model-based estimates and should be interpreted "
                "as decision-support insights, not guaranteed outcomes."
            ),
        }, "Scenario simulation complete.")[0]), 200

    except ValueError as ve:
        logger.warning(f"Simulation error: {ve}")
        return jsonify(error_response(str(ve), 400)[0]), 400
    except Exception as e:
        logger.error(f"Simulation error: {e}", exc_info=True)
        return jsonify(error_response("Simulation failed.", 500)[0]), 500


@prediction_bp.route("/history", methods=["GET"])
def get_history():
    """GET /api/prediction/history — fetch prediction history."""
    try:
        from app import get_db
        db = get_db()
        user_id = _extract_user_id()
        history = get_prediction_history(db, user_id=user_id, limit=50)
        return jsonify(success_response(history, "Prediction history fetched.")[0]), 200
    except Exception as e:
        logger.error(f"History error: {e}")
        return jsonify(error_response("Failed to fetch history.", 500)[0]), 500


@prediction_bp.route("/model-info", methods=["GET"])
def model_info():
    """GET /api/prediction/model-info — ML model metadata."""
    try:
        info = get_model_info_wrapper()
        return jsonify(success_response(info, "Model info fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Model info error: {e}")
        return jsonify(error_response("Failed to fetch model info.", 500)[0]), 500
