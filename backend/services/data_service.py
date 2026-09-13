"""
services/data_service.py
────────────────────────
Handles database operations for waste records.
CRUD operations, filtering, aggregation.
"""

import logging
from datetime import datetime
from config import ActiveConfig
from models.waste import create_waste_document
from utils.helpers import serialize_doc

logger = logging.getLogger(__name__)


def get_all_waste_records(db, filters: dict = None, page: int = 1, per_page: int = 50) -> dict:
    """
    Fetch waste records with optional filtering and pagination.

    Args:
        db: MongoDB database instance
        filters: Optional dict with keys: city, wasteType, year, disposalMethod
        page: Page number (1-based)
        per_page: Records per page

    Returns:
        dict with 'records' and 'pagination' keys

    Raises:
        Exception: If database query fails
    """
    try:
        collection = db["waste_records"]
        query = build_waste_query(filters)

        # Total count for pagination
        total = collection.count_documents(query)

        # Pagination
        skip = (page - 1) * per_page
        cursor = collection.find(query).skip(skip).limit(per_page).sort("year", -1)

        records = [serialize_doc(doc) for doc in cursor]

        total_pages = (total + per_page - 1) // per_page if per_page > 0 else 1

        return {
            "records": records,
            "pagination": {
                "page": page,
                "perPage": per_page,
                "totalRecords": total,
                "totalPages": total_pages,
            }
        }

    except Exception as e:
        logger.error(f"Error fetching waste records: {e}", exc_info=True)
        raise


def build_waste_query(filters: dict) -> dict:
    """Build MongoDB query dict from filter parameters."""
    query = {}
    if not filters:
        return query

    if filters.get("city"):
        query["city"] = {"$regex": filters["city"], "$options": "i"}
    if filters.get("wasteType"):
        query["wasteType"] = filters["wasteType"]
    if filters.get("year"):
        query["year"] = int(filters["year"])
    if filters.get("disposalMethod"):
        query["disposalMethod"] = filters["disposalMethod"]

    return query


def get_waste_record_by_id(db, record_id: str):
    """
    Fetch a single waste record by MongoDB ObjectId.

    Args:
        db: MongoDB database instance
        record_id: MongoDB ObjectId as string

    Returns:
        Serialized document dict or None if not found

    Raises:
        ValueError: If record_id is invalid
        Exception: If database query fails
    """
    try:
        from bson import ObjectId
        collection = db["waste_records"]
        doc = collection.find_one({"_id": ObjectId(record_id)})
        return serialize_doc(doc)
    except Exception as e:
        logger.error(f"Error fetching record {record_id}: {e}", exc_info=True)
        raise


def create_waste_record(db, data: dict):
    """
    Create a new waste record.

    Args:
        db: MongoDB database instance
        data: Record data dict

    Returns:
        Serialized created document

    Raises:
        Exception: If creation fails
    """
    try:
        doc = create_waste_document(data)
        result = db["waste_records"].insert_one(doc)
        doc["_id"] = result.inserted_id
        logger.info(f"Created waste record: {doc.get('city')} - {doc.get('year')}")
        return serialize_doc(doc)
    except Exception as e:
        logger.error(f"Error creating waste record: {e}", exc_info=True)
        raise


def update_waste_record(db, record_id: str, data: dict):
    """
    Update an existing waste record.

    Args:
        db: MongoDB database instance
        record_id: MongoDB ObjectId as string
        data: Updated fields dict

    Returns:
        Updated document or None if not found

    Raises:
        Exception: If update fails
    """
    try:
        from bson import ObjectId
        data["updatedAt"] = datetime.utcnow()
        result = db["waste_records"].update_one(
            {"_id": ObjectId(record_id)},
            {"$set": data}
        )
        if result.modified_count:
            updated = get_waste_record_by_id(db, record_id)
            logger.info(f"Updated waste record: {record_id}")
            return updated
        return None
    except Exception as e:
        logger.error(f"Error updating record {record_id}: {e}", exc_info=True)
        raise


def delete_waste_record(db, record_id: str):
    """
    Delete a waste record.

    Args:
        db: MongoDB database instance
        record_id: MongoDB ObjectId as string

    Returns:
        True if deleted, False otherwise

    Raises:
        Exception: If deletion fails
    """
    try:
        from bson import ObjectId
        result = db["waste_records"].delete_one({"_id": ObjectId(record_id)})
        logger.info(f"Deleted waste record: {record_id} (deleted: {result.deleted_count})")
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting record {record_id}: {e}", exc_info=True)
        raise


def bulk_upload_records(db, records: list):
    """
    Bulk insert waste records (upsert on city+wasteType+year).

    Args:
        db: MongoDB database instance
        records: List of record dicts

    Returns:
        dict with 'inserted', 'updated', 'total' keys

    Raises:
        Exception: If bulk upload fails
    """
    try:
        collection = db["waste_records"]
        inserted = 0
        updated = 0

        for rec in records:
            result = collection.update_one(
                {"city": rec["city"], "wasteType": rec["wasteType"], "year": rec["year"]},
                {"$set": rec},
                upsert=True
            )
            if result.upserted_id:
                inserted += 1
            else:
                updated += 1

        logger.info(f"Bulk upload complete — inserted: {inserted}, updated: {updated}")
        return {"inserted": inserted, "updated": updated, "total": len(records)}

    except Exception as e:
        logger.error(f"Error bulk uploading records: {e}", exc_info=True)
        raise


def get_dropdown_options(db):
    """
    Get unique values for city, wasteType, year dropdowns.

    Args:
        db: MongoDB database instance

    Returns:
        dict with 'cities', 'wasteTypes', 'years' lists

    Raises:
        Exception: If query fails
    """
    try:
        collection = db["waste_records"]

        cities = collection.distinct("city")
        cities.sort()

        waste_types = collection.distinct("wasteType")
        waste_types.sort()

        years = collection.distinct("year")
        years.sort(reverse=True)

        return {
            "cities": cities,
            "wasteTypes": waste_types,
            "years": years
        }

    except Exception as e:
        logger.error(f"Error fetching dropdown options: {e}", exc_info=True)
        return {"cities": [], "wasteTypes": [], "years": []}


def get_landfill_data(db):
    """
    Fetch landfill data with capacity and current usage.

    Args:
        db: MongoDB database instance

    Returns:
        List of landfill dicts with utilization metrics

    Raises:
        Exception: If aggregation fails
    """
    try:
        collection = db["waste_records"]

        # Aggregate by landfill name
        pipeline = [
            {
                "$group": {
                    "_id": "$landfillName",
                    "city": {"$first": "$city"},
                    "location": {"$first": "$location"},
                    "totalCapacity": {"$first": "$landfillCapacity"},
                    "totalWasteStored": {"$sum": "$wasteGenerated"},
                    "disposalMethod": {"$first": "$disposalMethod"},
                    "recordCount": {"$sum": 1}
                }
            },
            {"$sort": {"totalWasteStored": -1}}
        ]

        results = collection.aggregate(pipeline)
        landfills = []

        for doc in results:
            if not doc["_id"]:
                continue

            capacity = doc.get("totalCapacity", 0) or 0
            stored = doc.get("totalWasteStored", 0) or 0
            utilization = round((stored / capacity * 100), 1) if capacity > 0 else 0

            landfills.append({
                "name": doc["_id"],
                "city": doc.get("city", "Unknown"),
                "location": doc.get("location", {"lat": 0.0, "lng": 0.0}),
                "capacity": capacity,
                "wasteStored": round(stored, 2),
                "utilization": utilization,
                "status": "Critical" if utilization > 90 else "Warning" if utilization > 70 else "Normal",
                "disposalMethod": doc.get("disposalMethod", "Landfill"),
            })

        return landfills

    except Exception as e:
        logger.error(f"Error fetching landfill data: {e}", exc_info=True)
        return []


def get_waste_trend(db, period: str = "monthly", year: int = 2023):
    """
    Get waste generation trend over time.

    Args:
        db: MongoDB database instance
        period: Time period (currently only 'monthly' is supported)
        year: Year to fetch data for

    Returns:
        List of trend data dicts

    Raises:
        Exception: If aggregation fails
    """
    try:
        collection = db["waste_records"]

        # For simplicity, aggregate by year (extend to monthly if needed)
        pipeline = [
            {"$match": {"year": year}},
            {
                "$group": {
                    "_id": "$wasteType",
                    "total": {"$sum": "$wasteGenerated"},
                    "recycled": {"$sum": {
                        "$multiply": ["$wasteGenerated", {"$divide": ["$recyclingRate", 100]}]
                    }}
                }
            },
            {"$sort": {"total": -1}}
        ]

        results = collection.aggregate(pipeline)
        trend_data = []

        for doc in results:
            trend_data.append({
                "name": doc["_id"],
                "total": round(doc.get("total", 0), 2),
                "recycled": round(doc.get("recycled", 0), 2),
            })

        return trend_data

    except Exception as e:
        logger.error(f"Error fetching waste trend: {e}", exc_info=True)
        return []


def get_city_comparison(db, year: int = None):
    """
    Get waste data comparison across cities.

    Args:
        db: MongoDB database instance
        year: Optional year filter

    Returns:
        List of city comparison dicts

    Raises:
        Exception: If aggregation fails
    """
    try:
        collection = db["waste_records"]
        match_stage = {}
        if year:
            match_stage["year"] = year

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": "$city",
                    "totalWaste": {"$sum": "$wasteGenerated"},
                    "avgRecycling": {"$avg": "$recyclingRate"},
                    "totalCost": {"$sum": "$managementCost"},
                    "recordCount": {"$sum": 1}
                }
            },
            {"$sort": {"totalWaste": -1}},
            {"$limit": 15}
        ]

        results = collection.aggregate(pipeline)
        cities = []

        for doc in results:
            cities.append({
                "city": doc["_id"],
                "totalWaste": round(doc.get("totalWaste", 0), 2),
                "avgRecycling": round(doc.get("avgRecycling", 0), 2),
                "totalCost": round(doc.get("totalCost", 0), 2),
                "recordCount": doc.get("recordCount", 0),
            })

        return cities

    except Exception as e:
        logger.error(f"Error fetching city comparison: {e}", exc_info=True)
        return []


def seed_database_from_csv(db, csv_path: str):
    """
    Seed the database with CSV data.

    Args:
        db: MongoDB database instance
        csv_path: Path to CSV file

    Returns:
        dict with 'inserted', 'updated', 'total' keys
    """
    from utils.csv_loader import seed_database
    return seed_database(db, csv_path)