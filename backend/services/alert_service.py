"""
services/alert_service.py
──────────────────────────
Generates smart alerts from real waste dataset records in MongoDB.
No static/dummy alerts — all alerts are derived from actual data values.
"""

import logging
from utils.helpers import round_2

logger = logging.getLogger(__name__)

# Alert thresholds
RECYCLING_CRITICAL  = 25.0
RECYCLING_LOW       = 40.0
EFFICIENCY_CRITICAL = 3
EFFICIENCY_LOW      = 5
LANDFILL_CRITICAL   = 90.0
LANDFILL_HIGH       = 70.0
MAX_ALERTS          = 8


def get_smart_alerts(db) -> dict:
    """
    Analyse real waste records and generate data-driven alerts.

    Returns:
        {alerts: [...], high_risk_cities: int}
    """
    try:
        collection = db["waste_records"]

        # Aggregate per-city averages
        pipeline = [
            {
                "$group": {
                    "_id": "$city",
                    "avgRecycling":    {"$avg": "$recyclingRate"},
                    "avgEfficiency":   {"$avg": "$municipalEfficiency"},
                    "avgLandfillCap":  {"$avg": "$landfillCapacity"},
                    "totalWaste":      {"$sum": "$wasteGenerated"},
                    "recordCount":     {"$sum": 1},
                    "wasteTypes":      {"$addToSet": "$wasteType"},
                }
            },
            {"$sort": {"totalWaste": -1}},
        ]

        city_stats = list(collection.aggregate(pipeline))
        alerts = []
        high_risk_cities = set()

        for city in city_stats:
            city_name      = city["_id"]
            avg_recycling  = round_2(city.get("avgRecycling", 0))
            avg_efficiency = round_2(city.get("avgEfficiency", 0))
            total_waste    = round_2(city.get("totalWaste", 0))
            waste_types    = city.get("wasteTypes", [])

            city_is_high_risk = False

            # ── Critical recycling rate ────────────────────────────────────
            if avg_recycling < RECYCLING_CRITICAL:
                alerts.append({
                    "city":     city_name,
                    "severity": "CRITICAL",
                    "title":    "Critically Low Recycling Rate",
                    "message":  (
                        f"Average recycling rate in {city_name} is {avg_recycling:.1f}%, "
                        "far below the recommended 40% threshold. Immediate intervention required."
                    ),
                })
                city_is_high_risk = True

            elif avg_recycling < RECYCLING_LOW:
                alerts.append({
                    "city":     city_name,
                    "severity": "HIGH",
                    "title":    "Low Recycling Performance",
                    "message":  (
                        f"Recycling rate in {city_name} is {avg_recycling:.1f}%, "
                        "below the 40% recommended threshold."
                    ),
                })
                city_is_high_risk = True

            # ── Low municipal efficiency ───────────────────────────────────
            if avg_efficiency <= EFFICIENCY_CRITICAL:
                alerts.append({
                    "city":     city_name,
                    "severity": "CRITICAL",
                    "title":    "Critical Municipal Efficiency",
                    "message":  (
                        f"Municipal efficiency score in {city_name} is {avg_efficiency:.1f}/10. "
                        "Operational overhaul is recommended."
                    ),
                })
                city_is_high_risk = True

            elif avg_efficiency <= EFFICIENCY_LOW:
                alerts.append({
                    "city":     city_name,
                    "severity": "HIGH",
                    "title":    "Low Municipal Efficiency",
                    "message":  (
                        f"Municipal efficiency score in {city_name} is {avg_efficiency:.1f}/10, "
                        "indicating operational improvement is needed."
                    ),
                })
                city_is_high_risk = True

            # ── Hazardous waste present ────────────────────────────────────
            if "Hazardous" in waste_types:
                alerts.append({
                    "city":     city_name,
                    "severity": "HIGH",
                    "title":    "Hazardous Waste Requires Attention",
                    "message":  (
                        f"{city_name} has recorded hazardous waste. "
                        "Ensure certified TSDF handling and CPCB compliance."
                    ),
                })
                city_is_high_risk = True

            if city_is_high_risk:
                high_risk_cities.add(city_name)

            if len(alerts) >= MAX_ALERTS:
                break

        # Sort: CRITICAL first, then HIGH, MEDIUM, LOW
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        alerts.sort(key=lambda a: severity_order.get(a["severity"], 4))
        alerts = alerts[:MAX_ALERTS]

        return {
            "alerts":           alerts,
            "high_risk_cities": len(high_risk_cities),
        }

    except Exception as e:
        logger.error(f"Alert generation error: {e}", exc_info=True)
        return {"alerts": [], "high_risk_cities": 0}
