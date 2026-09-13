"""
routes/landfill.py
───────────────────
Landfill tracking endpoints with pressure analysis and coordinate validation.
"""

from flask import Blueprint, jsonify
import logging
from utils.helpers import success_response, error_response, round_2

logger = logging.getLogger(__name__)

landfill_bp = Blueprint("landfill", __name__, url_prefix="/api/landfills")

# ── Verified city-level coordinates (WGS84) ───────────────────────────────────
# Source: well-known geographic centroids for Indian cities.
# Used as fallback when dataset coordinates are geographically incorrect.
CITY_COORDS = {
    "Mumbai":             (19.0760,  72.8777),
    "Delhi":              (28.6139,  77.2090),
    "Bengaluru":          (12.9716,  77.5946),
    "Chennai":            (13.0827,  80.2707),
    "Kolkata":            (22.5726,  88.3639),
    "Hyderabad":          (17.3850,  78.4867),
    "Pune":               (18.5204,  73.8567),
    "Ahmedabad":          (23.0225,  72.5714),
    "Jaipur":             (26.9124,  75.7873),
    "Lucknow":            (26.8467,  80.9462),
    "Surat":              (21.1702,  72.8311),
    "Kanpur":             (26.4499,  80.3319),
    "Nagpur":             (21.1458,  79.0882),
    "Patna":              (25.5941,  85.1376),
    "Bhopal":             (23.2599,  77.4126),
    "Thiruvananthapuram": ( 8.5241,  76.9366),
    "Indore":             (22.7196,  75.8577),
    "Vadodara":           (22.3072,  73.1812),
    "Guwahati":           (26.1445,  91.7362),
    "Coimbatore":         (11.0168,  76.9558),
    "Ranchi":             (23.3441,  85.3096),
    "Amritsar":           (31.6340,  74.8723),
    "Jodhpur":            (26.2389,  73.0243),
    "Varanasi":           (25.3176,  82.9739),
    "Ludhiana":           (30.9010,  75.8573),
    "Agra":               (27.1767,  78.0081),
    "Meerut":             (28.9845,  77.7064),
    "Nashik":             (19.9975,  73.7898),
    "Rajkot":             (22.3039,  70.8022),
    "Madurai":            ( 9.9252,  78.1198),
    "Jabalpur":           (23.1815,  79.9864),
    "Allahabad":          (25.4358,  81.8463),
    "Visakhapatnam":      (17.6868,  83.2185),
    "Gwalior":            (26.2183,  78.1828),
}

# India bounding box (generous)
INDIA_LAT_MIN, INDIA_LAT_MAX =  6.0,  37.5
INDIA_LON_MIN, INDIA_LON_MAX = 68.0,  97.5
# Tolerance in degrees for city-level coordinate check
CITY_TOLERANCE = 3.0


def _validate_coordinate(lat, lng, city):
    """
    Returns (lat, lng, verified, location_type).
    - verified=True only if coordinate is numerically valid AND
      geographically close to the known city centroid.
    - Falls back to verified city centroid otherwise.
    """
    city_coord = CITY_COORDS.get(city)

    # 1. Numeric range check
    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        lat, lng = None, None

    numerically_valid = (
        lat is not None and lng is not None
        and -90 <= lat <= 90
        and -180 <= lng <= 180
        and INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX
        and INDIA_LON_MIN <= lng <= INDIA_LON_MAX
    )

    # 2. Geographic proximity check against known city centroid
    geographically_plausible = False
    if numerically_valid and city_coord:
        clat, clng = city_coord
        geographically_plausible = (
            abs(lat - clat) <= CITY_TOLERANCE
            and abs(lng - clng) <= CITY_TOLERANCE
        )

    if numerically_valid and geographically_plausible:
        return lat, lng, True, "exact"

    # Fallback to verified city centroid
    if city_coord:
        return city_coord[0], city_coord[1], False, "city-level"

    # Last resort: 0,0 (should never happen for known cities)
    return 0.0, 0.0, False, "city-level"


def _minmax_norm(value, vmin, vmax):
    """Min-max normalize value to 0–100. Returns 50 when min == max (no spread)."""
    if vmax <= vmin:
        return 50.0
    return max(0.0, min(100.0, (value - vmin) / (vmax - vmin) * 100.0))


def _assign_level(score):
    """
    Fixed thresholds on the 0–100 normalized scale.
    Because scores are min-max normalized across the real dataset,
    these thresholds produce a meaningful spread.
    0–24   LOW
    25–49  MODERATE
    50–74  HIGH
    75–100 CRITICAL
    """
    if score >= 75:
        return "CRITICAL"
    elif score >= 50:
        return "HIGH"
    elif score >= 25:
        return "MODERATE"
    else:
        return "LOW"


def _get_landfill_data(db):
    """
    Two-pass aggregation:
      Pass 1 – collect raw per-landfill metrics from MongoDB.
      Pass 2 – min-max normalize each component across the real dataset
               range so pressure scores spread across 0–100.

    Pressure score (0–100, analytical indicator of relative pressure):
      40% waste generation pressure  (normalized avg waste/day)
      30% recycling risk             (normalized inverse recycling rate)
      30% landfill dependency        (normalized % of Landfill disposal records)

    Classification (relative within this dataset):
      0–24   LOW
      25–49  MODERATE
      50–74  HIGH
      75–100 CRITICAL
    """
    collection = db["waste_records"]

    # ── Pass 1: aggregate raw metrics per landfill ────────────────────────────
    pipeline = [
        {
            "$group": {
                "_id":              "$landfillName",
                "city":             {"$first": "$city"},
                "location":         {"$first": "$location"},
                "capacity":         {"$first": "$landfillCapacity"},
                "disposalMethod":   {"$first": "$disposalMethod"},
                "avgWastePerDay":   {"$avg": "$wasteGenerated"},
                "avgRecyclingRate": {"$avg": "$recyclingRate"},
                # Count records where disposal method is Landfill
                "landfillCount":    {"$sum": {"$cond": [{"$eq": ["$disposalMethod", "Landfill"]}, 1, 0]}},
                "totalCount":       {"$sum": 1},
                "latestYear":       {"$max": "$year"},
                "earliestYear":     {"$min": "$year"},
            }
        },
        {"$sort": {"avgWastePerDay": -1}}
    ]

    trend_pipeline = [
        {
            "$group": {
                "_id":      {"landfill": "$landfillName", "year": "$year"},
                "avgWaste": {"$avg": "$wasteGenerated"}
            }
        }
    ]

    results    = list(collection.aggregate(pipeline))
    trend_docs = list(collection.aggregate(trend_pipeline))

    # Build trend lookup: landfill -> {year: avgWaste}
    trend_map = {}
    for t in trend_docs:
        lf = t["_id"]["landfill"]
        yr = t["_id"]["year"]
        if lf not in trend_map:
            trend_map[lf] = {}
        trend_map[lf][yr] = t["avgWaste"]

    # ── Collect raw component values for all valid landfills ─────────────────
    raw_rows = []
    for doc in results:
        name = doc["_id"]
        if not name:
            continue
        total_count    = doc.get("totalCount", 1) or 1
        landfill_count = doc.get("landfillCount", 0) or 0
        raw_rows.append({
            "name":            name,
            "city":            doc.get("city", "Unknown"),
            "location":        doc.get("location", {}),
            "capacity":        doc.get("capacity", 0) or 0,
            "disposalMethod":  doc.get("disposalMethod", "Landfill"),
            "avgWaste":        float(doc.get("avgWastePerDay", 0) or 0),
            "avgRecycling":    float(doc.get("avgRecyclingRate", 0) or 0),
            # recycling RISK = inverse of recycling rate
            "recyclingRisk":   100.0 - float(doc.get("avgRecyclingRate", 0) or 0),
            "landfillDep":     (landfill_count / total_count) * 100.0,
            "latestYear":      doc.get("latestYear", 2023),
            "earliestYear":    doc.get("earliestYear", 2019),
        })

    if not raw_rows:
        return []

    # ── Pass 2: compute dataset-wide min/max for normalization ────────────────
    all_waste   = [r["avgWaste"]      for r in raw_rows]
    all_risk    = [r["recyclingRisk"] for r in raw_rows]
    all_dep     = [r["landfillDep"]   for r in raw_rows]

    waste_min,  waste_max  = min(all_waste),  max(all_waste)
    risk_min,   risk_max   = min(all_risk),   max(all_risk)
    dep_min,    dep_max    = min(all_dep),    max(all_dep)

    logger.info(
        f"Landfill component ranges — "
        f"avgWaste: [{waste_min:.1f}, {waste_max:.1f}]  "
        f"recyclingRisk: [{risk_min:.1f}, {risk_max:.1f}]  "
        f"landfillDep: [{dep_min:.1f}, {dep_max:.1f}]"
    )

    # ── Build final landfill list with normalized scores ──────────────────────
    landfills = []
    for r in raw_rows:
        name          = r["name"]
        city          = r["city"]
        avg_waste     = round_2(r["avgWaste"])
        avg_recycling = round_2(r["avgRecycling"])
        landfill_dep  = round_2(r["landfillDep"])
        latest_year   = r["latestYear"]
        earliest_year = r["earliestYear"]

        # Normalized components (0–100 each)
        w_norm = _minmax_norm(r["avgWaste"],      waste_min, waste_max)
        r_norm = _minmax_norm(r["recyclingRisk"], risk_min,  risk_max)
        d_norm = _minmax_norm(r["landfillDep"],   dep_min,   dep_max)

        raw_score    = 0.40 * w_norm + 0.30 * r_norm + 0.30 * d_norm
        pressure_score = round_2(min(100.0, max(0.0, raw_score)))
        pressure_level = _assign_level(pressure_score)

        # Waste trend
        city_trends  = trend_map.get(name, {})
        latest_avg   = city_trends.get(latest_year,   avg_waste)
        earliest_avg = city_trends.get(earliest_year, avg_waste)
        if earliest_avg > 0:
            change_pct = (latest_avg - earliest_avg) / earliest_avg * 100
            waste_trend = "Increasing" if change_pct > 5 else ("Decreasing" if change_pct < -5 else "Stable")
        else:
            waste_trend = "Stable"

        # Coordinate validation
        raw_loc = r["location"]
        raw_lat = raw_loc.get("lat", 0) if isinstance(raw_loc, dict) else 0
        raw_lng = raw_loc.get("lng", 0) if isinstance(raw_loc, dict) else 0
        lat, lng, coords_verified, location_type = _validate_coordinate(raw_lat, raw_lng, city)

        landfills.append({
            "name":                           name,
            "city":                           city,
            "latitude":                       lat,
            "longitude":                      lng,
            "coordinates_verified":           coords_verified,
            "location_type":                  location_type,
            "capacity_tons":                  r["capacity"],
            "average_waste_per_day":          avg_waste,
            "average_recycling_rate":         avg_recycling,
            "landfill_dependency_percentage": landfill_dep,
            "pressure_score":                 pressure_score,
            "pressure_level":                 pressure_level,
            "latest_year":                    latest_year,
            "waste_trend":                    waste_trend,
            "disposal_method":                r["disposalMethod"],
        })

    # Log distribution for verification
    scores = [l["pressure_score"] for l in landfills]
    dist   = {lvl: sum(1 for l in landfills if l["pressure_level"] == lvl)
              for lvl in ["LOW", "MODERATE", "HIGH", "CRITICAL"]}
    logger.info(
        f"Pressure score distribution — "
        f"min={min(scores):.1f} max={max(scores):.1f} "
        f"mean={sum(scores)/len(scores):.1f} | {dist}"
    )

    return landfills


@landfill_bp.route("", methods=["GET"])
def get_landfills():
    """GET /api/landfills — all landfills with pressure analysis."""
    try:
        from app import get_db
        db = get_db()
        landfills = _get_landfill_data(db)
        summary = {
            "total":    len(landfills),
            "critical": sum(1 for l in landfills if l["pressure_level"] == "CRITICAL"),
            "high":     sum(1 for l in landfills if l["pressure_level"] == "HIGH"),
            "moderate": sum(1 for l in landfills if l["pressure_level"] == "MODERATE"),
            "low":      sum(1 for l in landfills if l["pressure_level"] == "LOW"),
        }
        return jsonify(success_response(
            {"landfills": landfills, "summary": summary},
            "Landfills fetched."
        )[0]), 200
    except Exception as e:
        logger.error(f"Landfill error: {e}", exc_info=True)
        return jsonify(error_response("Failed to fetch landfills.", 500)[0]), 500


@landfill_bp.route("/pressure", methods=["GET"])
def get_landfill_pressure():
    """GET /api/landfills/pressure — pressure summary (kept for compatibility)."""
    try:
        from app import get_db
        db = get_db()
        landfills = _get_landfill_data(db)
        summary = {
            "total":    len(landfills),
            "critical": sum(1 for l in landfills if l["pressure_level"] == "CRITICAL"),
            "high":     sum(1 for l in landfills if l["pressure_level"] == "HIGH"),
            "moderate": sum(1 for l in landfills if l["pressure_level"] == "MODERATE"),
            "low":      sum(1 for l in landfills if l["pressure_level"] == "LOW"),
        }
        return jsonify(success_response(
            {"landfills": landfills, "summary": summary},
            "Landfill pressure analysis fetched."
        )[0]), 200
    except Exception as e:
        logger.error(f"Landfill pressure error: {e}", exc_info=True)
        return jsonify(error_response("Failed to fetch landfill pressure.", 500)[0]), 500


@landfill_bp.route("/status", methods=["GET"])
def get_landfill_status():
    """GET /api/landfills/status — count by pressure level."""
    try:
        from app import get_db
        db = get_db()
        landfills = _get_landfill_data(db)
        return jsonify(success_response({
            "total":    len(landfills),
            "critical": sum(1 for l in landfills if l["pressure_level"] == "CRITICAL"),
            "high":     sum(1 for l in landfills if l["pressure_level"] == "HIGH"),
            "moderate": sum(1 for l in landfills if l["pressure_level"] == "MODERATE"),
            "low":      sum(1 for l in landfills if l["pressure_level"] == "LOW"),
        }, "Landfill status fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Landfill status error: {e}", exc_info=True)
        return jsonify(error_response("Failed to fetch landfill status.", 500)[0]), 500


@landfill_bp.route("/<landfill_name>", methods=["GET"])
def get_landfill_detail(landfill_name):
    """GET /api/landfills/<name> — single landfill detail."""
    try:
        from app import get_db
        db = get_db()
        landfills = _get_landfill_data(db)
        landfill = next((l for l in landfills if l["name"] == landfill_name), None)
        if not landfill:
            return jsonify(error_response("Landfill not found.", 404)[0]), 404
        return jsonify(success_response(landfill, "Landfill details fetched.")[0]), 200
    except Exception as e:
        logger.error(f"Landfill detail error: {e}", exc_info=True)
        return jsonify(error_response("Failed to fetch landfill details.", 500)[0]), 500
