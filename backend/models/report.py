"""
models/report.py
─────────────────
Report document schema for MongoDB.
"""

from datetime import datetime


def create_report_document(name: str, report_type: str, filters: dict,
                            file_path: str, file_size: str,
                            generated_by: str = "Admin") -> dict:
    """Build a report metadata document for MongoDB."""
    return {
        "name":         name,
        "type":         report_type,
        "filters":      filters,
        "filePath":     file_path,
        "fileSize":     file_size,
        "generatedBy":  generated_by,
        "status":       "Ready",
        "downloads":    0,
        "createdAt":    datetime.utcnow(),
    }
