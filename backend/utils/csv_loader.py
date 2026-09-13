"""
utils/csv_loader.py
────────────────────
Reads the CSV dataset, cleans it, and bulk-upserts records into MongoDB.

Dataset columns:
  City/District | Waste Type | Waste Generated (Tons/Day) | Recycling Rate (%)
  Population Density (People/km²) | Municipal Efficiency Score (1-10)
  Disposal Method | Cost of Waste Management (₹/Ton) | Awareness Campaigns Count
  Landfill Name | Landfill Location (Lat, Long) | Landfill Capacity (Tons) | Year
"""

import os
import logging
from typing import Optional
import pandas as pd

logger = logging.getLogger(__name__)


# ── Column rename map (CSV header → internal key) ─────────────────────────────
COLUMN_MAP = {
    "City/District":                        "city",
    "Waste Type":                           "wasteType",
    "Waste Generated (Tons/Day)":           "wasteGenerated",
    "Recycling Rate (%)":                   "recyclingRate",
    "Population Density (People/km²)":      "populationDensity",
    "Municipal Efficiency Score (1-10)":    "municipalEfficiency",
    "Disposal Method":                      "disposalMethod",
    "Cost of Waste Management (₹/Ton)":     "managementCost",
    "Awareness Campaigns Count":            "awarenessCampaigns",
    "Landfill Name":                        "landfillName",
    "Landfill Location (Lat, Long)":        "landfillLocation",
    "Landfill Capacity (Tons)":             "landfillCapacity",
    "Year":                                 "year",
}


def load_and_clean_csv(csv_path: str) -> pd.DataFrame:
    """
    Load the CSV, rename columns, clean data types, and return a clean DataFrame.
    
    Args:
        csv_path: Path to the CSV file
        
    Returns:
        Cleaned DataFrame ready for database insertion
        
    Raises:
        FileNotFoundError: If CSV file doesn't exist
        ValueError: If dataset format is invalid
    """
    if not os.path.exists(csv_path):
        logger.error(f"Dataset not found at: {csv_path}")
        raise FileNotFoundError(f"Dataset not found at: {csv_path}")

    try:
        logger.info(f"Loading dataset from: {csv_path}")
        df = pd.read_csv(csv_path, encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to read CSV file: {e}", exc_info=True)
        raise ValueError(f"Failed to parse CSV file: {e}")

    # ── 1. Rename columns ────────────────────────────────────────────────────
    original_cols = list(df.columns)
    df = df.rename(columns=COLUMN_MAP)
    missing_cols = [col for col in COLUMN_MAP.values() if col not in df.columns]
    if missing_cols:
        logger.error(f"Column rename failed - expected columns not found: {missing_cols}")
        raise ValueError(f"Dataset format mismatch. Expected columns not found: {missing_cols}")
    logger.info(f"Columns renamed: {original_cols} → {list(df.columns)}")

    # ── 2. Drop duplicates ───────────────────────────────────────────────────
    original_len = len(df)
    df = df.drop_duplicates()
    duplicates_removed = original_len - len(df)
    logger.info(f"Removed {duplicates_removed} duplicate rows.")

    # ── 3. Handle missing values ─────────────────────────────────────────────
    numeric_cols = ["wasteGenerated", "recyclingRate", "populationDensity",
                    "municipalEfficiency", "managementCost", "awarenessCampaigns",
                    "landfillCapacity", "year"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    string_cols = ["city", "wasteType", "disposalMethod", "landfillName", "landfillLocation"]
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")

    # ── 4. Cast types ────────────────────────────────────────────────────────
    df["wasteGenerated"]    = pd.to_numeric(df["wasteGenerated"],    errors="coerce").fillna(0).round(2)
    df["recyclingRate"]     = pd.to_numeric(df["recyclingRate"],     errors="coerce").fillna(0).round(2)
    df["populationDensity"] = pd.to_numeric(df["populationDensity"], errors="coerce").fillna(0).astype(int)
    df["municipalEfficiency"]= pd.to_numeric(df["municipalEfficiency"], errors="coerce").fillna(5).astype(int)
    df["managementCost"]    = pd.to_numeric(df["managementCost"],    errors="coerce").fillna(0).round(2)
    df["awarenessCampaigns"]= pd.to_numeric(df["awarenessCampaigns"],errors="coerce").fillna(0).astype(int)
    df["landfillCapacity"]  = pd.to_numeric(df["landfillCapacity"],  errors="coerce").fillna(0).astype(int)
    df["year"]              = pd.to_numeric(df["year"],              errors="coerce").fillna(2023).astype(int)

    # ── 5. Parse lat/long from "lat, long" string ────────────────────────────
    def parse_location(loc_str: str) -> dict:
        """Parse location string 'lat, long' into dict."""
        try:
            parts = str(loc_str).split(",")
            if len(parts) >= 2:
                return {"lat": float(parts[0].strip()), "lng": float(parts[1].strip())}
            return {"lat": 0.0, "lng": 0.0}
        except Exception:
            logger.warning(f"Invalid location format: {loc_str}", exc_info=True)
            return {"lat": 0.0, "lng": 0.0}

    if "landfillLocation" in df.columns:
        df["location"] = df["landfillLocation"].apply(parse_location)
    else:
        df["location"] = [{"lat": 0.0, "lng": 0.0}] * len(df)

    # ── 6. Strip whitespace from strings ────────────────────────────────────
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].str.strip()

    logger.info(f"Dataset loaded and cleaned: {len(df)} records.")
    return df


def df_to_records(df: pd.DataFrame) -> list[dict]:
    """
    Convert DataFrame rows to list of dicts suitable for MongoDB insertion.
    Uses vectorized operations for better performance.
    """
    try:
        records = []
        for _, row in df.iterrows():
            record = {
                "city":               row["city"],
                "wasteType":          row["wasteType"],
                "wasteGenerated":     float(row["wasteGenerated"]),
                "recyclingRate":      float(row["recyclingRate"]),
                "populationDensity":  int(row["populationDensity"]),
                "municipalEfficiency":int(row["municipalEfficiency"]),
                "disposalMethod":     row["disposalMethod"],
                "managementCost":     float(row["managementCost"]),
                "awarenessCampaigns": int(row["awarenessCampaigns"]),
                "landfillName":       row["landfillName"],
                "landfillCapacity":   int(row["landfillCapacity"]),
                "location":           row["location"],
                "year":               int(row["year"]),
            }
            records.append(record)
        return records
    except KeyError as e:
        logger.error(f"Missing required column: {e}", exc_info=True)
        raise ValueError(f"Missing required column: {e}")


def seed_database(db, csv_path: str) -> dict:
    """
    Load CSV and upsert all records into MongoDB.
    Returns summary dict with counts.
    
    Skips import if waste_records collection already has data.
    """
    collection = db["waste_records"]
    
    # Check if dataset already exists
    record_count = collection.count_documents({})
    if record_count > 0:
        logger.info(f"Dataset already exists ({record_count} records). Skipping import.")
        return {"inserted": 0, "updated": 0, "total": 0, "skipped": True}
    
    # Load and process CSV
    logger.info("Dataset is empty. Importing from CSV...")
    df = load_and_clean_csv(csv_path)
    records = df_to_records(df)

    inserted = 0
    updated  = 0

    # Bulk upsert using ordered operations for better performance
    try:
        for rec in records:
            # Upsert on (city + wasteType + year) composite key
            result = collection.update_one(
                {"city": rec["city"], "wasteType": rec["wasteType"], "year": rec["year"]},
                {"$set": rec},
                upsert=True
            )
            if result.upserted_id:
                inserted += 1
            else:
                updated += 1

        logger.info(f"Dataset imported successfully — inserted: {inserted}, updated: {updated}")
        return {"inserted": inserted, "updated": updated, "total": len(records), "skipped": False}

    except Exception as e:
        logger.error(f"Error during dataset import: {e}", exc_info=True)
        raise
