"""
services/risk_service.py
─────────────────────────
Explainable rule-based Waste Pressure Risk Analysis.
Uses real prediction output and user input values.
No ML model — fully transparent analytical scoring.
"""

import logging

logger = logging.getLogger(__name__)

# Waste-type risk weights (0–100 base contribution)
WASTE_TYPE_RISK = {
    "Hazardous":    100,
    "E-Waste":       80,
    "Plastic":       60,
    "Construction":  45,
    "Organic":       30,
}

# Thresholds for waste volume pressure (Tons/Day)
WASTE_VOLUME_HIGH  = 5000
WASTE_VOLUME_MED   = 2000


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _waste_volume_pressure(predicted_waste: float) -> float:
    """Normalise predicted waste to 0–100 pressure score."""
    score = (predicted_waste / WASTE_VOLUME_HIGH) * 100
    return _clamp(score)


def _recycling_risk(recycling_rate: float) -> float:
    """Higher recycling rate → lower risk."""
    return _clamp(100.0 - recycling_rate)


def _efficiency_risk(municipal_efficiency: float) -> float:
    """Lower efficiency → higher risk. Scale: 1–10."""
    return _clamp(((10.0 - municipal_efficiency) / 9.0) * 100)


def _landfill_pressure(predicted_waste: float, landfill_capacity: float) -> float:
    """Ratio of predicted daily waste to total landfill capacity."""
    if landfill_capacity <= 0:
        return 100.0
    # Scale: if daily waste is ≥ 0.5% of total capacity, that's high pressure
    ratio = (predicted_waste / landfill_capacity) * 10000
    return _clamp(ratio)


def _waste_type_risk(waste_type: str) -> float:
    return float(WASTE_TYPE_RISK.get(waste_type, 40))


def _build_risk_factors(
    predicted_waste: float,
    recycling_rate: float,
    municipal_efficiency: float,
    landfill_capacity: float,
    waste_type: str,
    lf_pressure: float,
) -> list:
    """Dynamically generate risk factor descriptions from actual values."""
    factors = []

    if predicted_waste >= WASTE_VOLUME_HIGH:
        factors.append(f"Very high predicted waste volume ({predicted_waste:,.1f} T/Day)")
    elif predicted_waste >= WASTE_VOLUME_MED:
        factors.append(f"Elevated predicted waste volume ({predicted_waste:,.1f} T/Day)")

    if recycling_rate < 30:
        factors.append(f"Critically low recycling rate ({recycling_rate:.1f}%)")
    elif recycling_rate < 50:
        factors.append(f"Below-average recycling performance ({recycling_rate:.1f}%)")

    if municipal_efficiency <= 4:
        factors.append(f"Very low municipal efficiency score ({municipal_efficiency}/10)")
    elif municipal_efficiency <= 6:
        factors.append(f"Below-average municipal efficiency ({municipal_efficiency}/10)")

    if lf_pressure >= 70:
        factors.append(f"High landfill utilisation pressure ({lf_pressure:.1f}/100)")
    elif lf_pressure >= 40:
        factors.append(f"Moderate landfill pressure ({lf_pressure:.1f}/100)")

    if waste_type in ("Hazardous", "E-Waste"):
        factors.append(f"{waste_type} waste requires specialised handling")

    if not factors:
        factors.append("Waste management parameters are within acceptable range")

    return factors


def calculate_risk(
    predicted_waste: float,
    recycling_rate: float,
    municipal_efficiency: float,
    landfill_capacity: float,
    waste_type: str,
) -> dict:
    """
    Calculate Waste Pressure Risk Score (0–100) and classify risk level.

    Weights:
        Waste Volume Pressure  30%
        Recycling Risk         25%
        Municipal Efficiency   20%
        Landfill Pressure      20%
        Waste Type Risk         5%

    Returns:
        {risk_score, risk_level, risk_factors, component_scores}
    """
    try:
        vp  = _waste_volume_pressure(predicted_waste)
        rr  = _recycling_risk(recycling_rate)
        er  = _efficiency_risk(municipal_efficiency)
        lp  = _landfill_pressure(predicted_waste, landfill_capacity)
        wtr = _waste_type_risk(waste_type)

        risk_score = round(
            vp  * 0.30 +
            rr  * 0.25 +
            er  * 0.20 +
            lp  * 0.20 +
            wtr * 0.05,
            1
        )
        risk_score = _clamp(risk_score)

        if risk_score >= 70:
            risk_level = "CRITICAL"
        elif risk_score >= 50:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        risk_factors = _build_risk_factors(
            predicted_waste, recycling_rate, municipal_efficiency,
            landfill_capacity, waste_type, lp
        )

        return {
            "risk_score":  risk_score,
            "risk_level":  risk_level,
            "risk_factors": risk_factors,
            "component_scores": {
                "waste_volume_pressure":  round(vp,  1),
                "recycling_risk":         round(rr,  1),
                "efficiency_risk":        round(er,  1),
                "landfill_pressure":      round(lp,  1),
                "waste_type_risk":        round(wtr, 1),
            },
        }

    except Exception as e:
        logger.error(f"Risk calculation error: {e}", exc_info=True)
        return {
            "risk_score":  0,
            "risk_level":  "UNKNOWN",
            "risk_factors": ["Risk calculation unavailable."],
            "component_scores": {},
        }
