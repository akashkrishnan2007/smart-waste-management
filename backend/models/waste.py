"""
models/waste.py
───────────────
Waste record document schema for MongoDB.
"""

from datetime import datetime


def create_waste_document(data: dict) -> dict:
    """Build a waste record document for MongoDB."""
    return {
        "city":               data.get("city", ""),
        "wasteType":          data.get("wasteType", ""),
        "wasteGenerated":     float(data.get("wasteGenerated", 0)),
        "recyclingRate":      float(data.get("recyclingRate", 0)),
        "populationDensity":  int(data.get("populationDensity", 0)),
        "municipalEfficiency":int(data.get("municipalEfficiency", 5)),
        "disposalMethod":     data.get("disposalMethod", "Landfill"),
        "managementCost":     float(data.get("managementCost", 0)),
        "awarenessCampaigns": int(data.get("awarenessCampaigns", 0)),
        "landfillName":       data.get("landfillName", ""),
        "landfillCapacity":   int(data.get("landfillCapacity", 0)),
        "location":           data.get("location", {"lat": 0.0, "lng": 0.0}),
        "year":               int(data.get("year", datetime.utcnow().year)),
        "createdAt":          datetime.utcnow(),
        "updatedAt":          datetime.utcnow(),
        "source":             data.get("source", "csv_import"),
    }
