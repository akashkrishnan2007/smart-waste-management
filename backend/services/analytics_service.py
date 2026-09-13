"""
services/analytics_service.py
───────────────────────────────
Handles analytics aggregations and dashboard statistics.
"""

import logging
from datetime import datetime
from utils.helpers import serialize_doc, round_2

logger = logging.getLogger(__name__)


def get_dashboard_stats(db) -> dict:
    """
    Compute high-level dashboard statistics.
    Returns comprehensive metrics for the main dashboard.
    """
    try:
        collection = db["waste_records"]
        total_records = collection.count_documents({})

        if total_records == 0:
            logger.info("No waste records found. Returning empty stats.")
            return get_empty_stats()

        # ── Aggregation pipeline ───────────────────────────────────────────────
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": None,
                        "totalWasteGenerated": {"$sum": "$wasteGenerated"},
                        "avgRecyclingRate": {"$avg": "$recyclingRate"},
                        "totalCities": {"$addToSet": "$city"},
                        "avgManagementCost": {"$avg": "$managementCost"},
                        "avgMunicipalEfficiency": {"$avg": "$municipalEfficiency"},
                        "totalRecords": {"$sum": 1},
                    }
                }
            ]

            results = list(collection.aggregate(pipeline))
        except Exception as e:
            logger.error(f"Dashboard aggregation failed: {e}", exc_info=True)
            return get_empty_stats()

        if not results:
            return get_empty_stats()

        agg = results[0]
        cities = agg.get("totalCities", [])

        stats = {
            "totalWasteGenerated": round_2(agg.get("totalWasteGenerated", 0)),
            "avgRecyclingRate": round_2(agg.get("avgRecyclingRate", 0)),
            "totalCities": len(cities),
            "citiesList": sorted(cities),
            "avgManagementCost": round_2(agg.get("avgManagementCost", 0)),
            "municipalEfficiencyScore": round_2(agg.get("avgMunicipalEfficiency", 0)),
            "totalRecords": agg.get("totalRecords", 0),
            "lastUpdated": datetime.utcnow().isoformat(),
        }

        # ── Chart data ────────────────────────────────────────────────────────
        try:
            stats["chartData"] = get_chart_data(collection)
        except Exception as e:
            logger.warning(f"Chart data computation failed: {e}", exc_info=True)
            stats["chartData"] = {}

        logger.info("Dashboard stats computed successfully.")
        return stats

    except Exception as e:
        logger.error(f"Error computing dashboard stats: {e}", exc_info=True)
        return get_empty_stats()


def get_empty_stats():
    """Return empty/default statistics."""
    return {
        "totalWasteGenerated": 0,
        "avgRecyclingRate": 0,
        "totalCities": 0,
        "citiesList": [],
        "avgManagementCost": 0,
        "municipalEfficiencyScore": 0,
        "totalRecords": 0,
        "lastUpdated": datetime.utcnow().isoformat(),
        "chartData": {
            "wasteByType": [],
            "wasteByYear": [],
            "wasteByCity": [],
            "disposalMethod": [],
            "recyclingTrend": [],
        }
    }


def get_chart_data(collection) -> dict:
    """Compute chart data for dashboard."""
    try:
        # Waste by Type
        waste_by_type = []
        pipeline_type = [
            {
                "$group": {
                    "_id": "$wasteType",
                    "total": {"$sum": "$wasteGenerated"},
                    "avgRate": {"$avg": "$recyclingRate"}
                }
            },
            {"$sort": {"total": -1}}
        ]
        for doc in collection.aggregate(pipeline_type):
            waste_by_type.append({
                "name": doc["_id"],
                "value": round_2(doc.get("total", 0)),
                "recyclingRate": round_2(doc.get("avgRate", 0))
            })

        # Waste by Year
        waste_by_year = []
        pipeline_year = [
            {
                "$group": {
                    "_id": "$year",
                    "total": {"$sum": "$wasteGenerated"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        for doc in collection.aggregate(pipeline_year):
            waste_by_year.append({
                "year": doc["_id"],
                "total": round_2(doc.get("total", 0))
            })

        # Top Cities
        waste_by_city = []
        pipeline_city = [
            {
                "$group": {
                    "_id": "$city",
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "recyclingRate": {"$avg": "$recyclingRate"}
                }
            },
            {"$sort": {"totalWaste": -1}},
            {"$limit": 10}
        ]
        for doc in collection.aggregate(pipeline_city):
            waste_by_city.append({
                "city": doc["_id"],
                "totalWaste": round_2(doc.get("totalWaste", 0)),
                "recyclingRate": round_2(doc.get("recyclingRate", 0))
            })

        # Disposal Method Distribution
        disposal_method = []
        pipeline_disposal = [
            {
                "$group": {
                    "_id": "$disposalMethod",
                    "total": {"$sum": "$wasteGenerated"},
                    "count": {"$sum": 1}
                }
            }
        ]
        for doc in collection.aggregate(pipeline_disposal):
            disposal_method.append({
                "method": doc["_id"],
                "total": round_2(doc.get("total", 0)),
                "count": doc.get("count", 0)
            })

        # Recycling Trend by Year
        recycling_trend = []
        pipeline_rec = [
            {
                "$group": {
                    "_id": "$year",
                    "avgRecycling": {"$avg": "$recyclingRate"},
                    "totalWaste": {"$sum": "$wasteGenerated"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        for doc in collection.aggregate(pipeline_rec):
            recycling_trend.append({
                "year": doc["_id"],
                "avgRecycling": round_2(doc.get("avgRecycling", 0)),
                "totalWaste": round_2(doc.get("totalWaste", 0))
            })

        return {
            "wasteByType": waste_by_type,
            "wasteByYear": waste_by_year,
            "wasteByCity": waste_by_city,
            "disposalMethod": disposal_method,
            "recyclingTrend": recycling_trend,
        }

    except Exception as e:
        logger.error(f"Error computing chart data: {e}", exc_info=True)
        return {}


def get_analytics_data(db, filters=None) -> dict:
    """
    Detailed analytics with optional filters.
    Used by the /analytics endpoint.
    """
    try:
        collection = db["waste_records"]
        match_stage = {}

        if filters:
            if filters.get("city"):
                match_stage["city"] = filters["city"]
            if filters.get("year"):
                match_stage["year"] = int(filters["year"])
            if filters.get("wasteType"):
                match_stage["wasteType"] = filters["wasteType"]

        # ── Base pipeline ──────────────────────────────────────────────────────
        pipeline_base = [{"$match": match_stage}] if match_stage else []

        # Waste by City
        waste_by_city = []
        pipeline_city = pipeline_base + [
            {
                "$group": {
                    "_id": "$city",
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "avgRecycling": {"$avg": "$recyclingRate"},
                    "avgEfficiency": {"$avg": "$municipalEfficiency"},
                    "recordCount": {"$sum": 1}
                }
            },
            {"$sort": {"totalWaste": -1}}
        ]
        for doc in collection.aggregate(pipeline_city):
            waste_by_city.append({
                "city": doc["_id"],
                "totalWaste": round_2(doc.get("totalWaste", 0)),
                "avgRecycling": round_2(doc.get("avgRecycling", 0)),
                "avgEfficiency": round_2(doc.get("avgEfficiency", 0)),
                "recordCount": doc.get("recordCount", 0),
            })

        # Waste by Year
        waste_by_year = []
        pipeline_year = pipeline_base + [
            {
                "$group": {
                    "_id": "$year",
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "avgRecycling": {"$avg": "$recyclingRate"},
                    "totalCost": {"$sum": "$managementCost"},
                }
            },
            {"$sort": {"_id": 1}}
        ]
        for doc in collection.aggregate(pipeline_year):
            waste_by_year.append({
                "year": doc["_id"],
                "totalWaste": round_2(doc.get("totalWaste", 0)),
                "avgRecycling": round_2(doc.get("avgRecycling", 0)),
                "totalCost": round_2(doc.get("totalCost", 0)),
            })

        # Waste by Type
        waste_by_type = []
        pipeline_type = pipeline_base + [
            {
                "$group": {
                    "_id": "$wasteType",
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "avgRecycling": {"$avg": "$recyclingRate"},
                }
            },
            {"$sort": {"totalWaste": -1}}
        ]
        for doc in collection.aggregate(pipeline_type):
            waste_by_type.append({
                "type": doc["_id"],
                "totalWaste": round_2(doc.get("totalWaste", 0)),
                "avgRecycling": round_2(doc.get("avgRecycling", 0)),
            })

        # Disposal Method
        disposal_method = []
        pipeline_disposal = pipeline_base + [
            {
                "$group": {
                    "_id": "$disposalMethod",
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "count": {"$sum": 1}
                }
            }
        ]
        for doc in collection.aggregate(pipeline_disposal):
            disposal_method.append({
                "method": doc["_id"],
                "totalWaste": round_2(doc.get("totalWaste", 0)),
                "count": doc.get("count", 0)
            })

        # Population Density Analysis
        pop_density = []
        pipeline_pop = pipeline_base + [
            {
                "$group": {
                    "_id": "$city",
                    "avgPopDensity": {"$avg": "$populationDensity"},
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "avgEfficiency": {"$avg": "$municipalEfficiency"}
                }
            },
            {"$sort": {"avgPopDensity": -1}},
            {"$limit": 15}
        ]
        for doc in collection.aggregate(pipeline_pop):
            pop_density.append({
                "city": doc["_id"],
                "avgPopDensity": round_2(doc.get("avgPopDensity", 0)),
                "totalWaste": round_2(doc.get("totalWaste", 0)),
                "avgEfficiency": round_2(doc.get("avgEfficiency", 0)),
            })

        return {
            "wasteByCity": waste_by_city,
            "wasteByYear": waste_by_year,
            "wasteByType": waste_by_type,
            "disposalMethod": disposal_method,
            "populationDensityAnalysis": pop_density,
        }

    except Exception as e:
        logger.error(f"Error computing analytics: {e}", exc_info=True)
        return {}


def get_landfill_analytics(db) -> list:
    """Get landfill utilization analytics."""
    from services.data_service import get_landfill_data
    return get_landfill_data(db)