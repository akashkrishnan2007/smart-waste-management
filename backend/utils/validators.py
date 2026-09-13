"""
utils/validators.py
───────────────────
Request payload validation helpers.
"""

import re


# ── Valid dataset values (from Colab-trained model encoders) ──────────────────
VALID_WASTE_TYPES = ["Construction", "E-Waste", "Hazardous", "Organic", "Plastic"]
VALID_CITIES = [
    "Agra", "Ahmedabad", "Allahabad", "Amritsar", "Bengaluru", "Bhopal",
    "Chennai", "Coimbatore", "Delhi", "Guwahati", "Gwalior", "Hyderabad",
    "Indore", "Jabalpur", "Jaipur", "Jodhpur", "Kanpur", "Kolkata",
    "Lucknow", "Ludhiana", "Madurai", "Meerut", "Mumbai", "Nagpur",
    "Nashik", "Patna", "Pune", "Rajkot", "Ranchi", "Surat",
    "Thiruvananthapuram", "Vadodara", "Varanasi", "Visakhapatnam",
]
VALID_DISPOSAL_METHODS = ["Landfill", "Recycling", "Composting", "Incineration"]
VALID_YEARS = list(range(2019, 2031))


def validate_login(data: dict) -> list[str]:
    """Validate login request payload. Returns list of error messages."""
    errors = []
    if not data.get("email"):
        errors.append("Email is required.")
    elif not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", data["email"]):
        errors.append("Invalid email format.")
    if not data.get("password"):
        errors.append("Password is required.")
    elif len(data["password"]) < 6:
        errors.append("Password must be at least 6 characters.")
    return errors


def validate_prediction_input(data: dict) -> list[str]:
    """Validate prediction API payload (9 fields). Returns list of error messages."""
    errors = []
    required = [
        "city", "wasteType", "populationDensity", "municipalEfficiency",
        "recyclingRate", "cost", "awareness", "landfillCapacity", "year",
    ]

    for field in required:
        if data.get(field) in (None, "", []):
            errors.append(f"'{field}' is required.")

    if data.get("city") and data["city"] not in VALID_CITIES:
        errors.append(f"city must be one of: {VALID_CITIES}")

    if data.get("wasteType") and data["wasteType"] not in VALID_WASTE_TYPES:
        errors.append(f"wasteType must be one of: {VALID_WASTE_TYPES}")

    try:
        pd_val = float(data.get("populationDensity", 0))
        if pd_val <= 0 or pd_val > 100000:
            errors.append("populationDensity must be between 1 and 100,000.")
    except (TypeError, ValueError):
        errors.append("populationDensity must be a number.")

    try:
        me_val = float(data.get("municipalEfficiency", 0))
        if me_val < 1 or me_val > 10:
            errors.append("municipalEfficiency must be between 1 and 10.")
    except (TypeError, ValueError):
        errors.append("municipalEfficiency must be a number.")

    try:
        rr_val = float(data.get("recyclingRate", -1))
        if rr_val < 0 or rr_val > 100:
            errors.append("recyclingRate must be between 0 and 100.")
    except (TypeError, ValueError):
        errors.append("recyclingRate must be a number.")

    try:
        cost_val = float(data.get("cost", -1))
        if cost_val < 0:
            errors.append("cost must be a non-negative number.")
    except (TypeError, ValueError):
        errors.append("cost must be a number.")

    try:
        aw_val = int(data.get("awareness", -1))
        if aw_val < 0:
            errors.append("awareness must be a non-negative integer.")
    except (TypeError, ValueError):
        errors.append("awareness must be an integer.")

    try:
        lc_val = int(data.get("landfillCapacity", -1))
        if lc_val < 0:
            errors.append("landfillCapacity must be a non-negative integer.")
    except (TypeError, ValueError):
        errors.append("landfillCapacity must be an integer.")

    try:
        yr_val = int(data.get("year", 0))
        if yr_val < 2019 or yr_val > 2030:
            errors.append("year must be between 2019 and 2030.")
    except (TypeError, ValueError):
        errors.append("year must be a valid integer.")

    return errors


def validate_report_input(data: dict) -> list[str]:
    """Validate report generation payload."""
    errors = []
    if not data.get("name"):
        errors.append("Report name is required.")
    valid_types = ["Annual", "Quarterly", "Monthly", "Custom", "Analytics"]
    if data.get("type") and data["type"] not in valid_types:
        errors.append(f"Report type must be one of: {valid_types}")
    return errors


def validate_scenario_input(scenario: dict) -> list[str]:
    """Validate scenario fields for what-if simulation."""
    errors = []

    if "municipal_efficiency" in scenario:
        try:
            v = float(scenario["municipal_efficiency"])
            if v < 1 or v > 10:
                errors.append("scenario.municipal_efficiency must be between 1 and 10.")
        except (TypeError, ValueError):
            errors.append("scenario.municipal_efficiency must be a number.")

    if "recycling_rate" in scenario:
        try:
            v = float(scenario["recycling_rate"])
            if v < 0 or v > 100:
                errors.append("scenario.recycling_rate must be between 0 and 100.")
        except (TypeError, ValueError):
            errors.append("scenario.recycling_rate must be a number.")

    if "cost" in scenario:
        try:
            v = float(scenario["cost"])
            if v < 0:
                errors.append("scenario.cost must be non-negative.")
        except (TypeError, ValueError):
            errors.append("scenario.cost must be a number.")

    if "awareness" in scenario:
        try:
            v = int(scenario["awareness"])
            if v < 0:
                errors.append("scenario.awareness must be non-negative.")
        except (TypeError, ValueError):
            errors.append("scenario.awareness must be an integer.")

    if "year" in scenario:
        try:
            v = int(scenario["year"])
            if v < 2019 or v > 2030:
                errors.append("scenario.year must be between 2019 and 2030.")
        except (TypeError, ValueError):
            errors.append("scenario.year must be a valid integer.")

    return errors


def validate_waste_record(data: dict) -> list[str]:
    """Validate a waste data record for import/manual entry."""
    errors = []
    required = ["city", "wasteType", "wasteGenerated", "year"]
    for field in required:
        if data.get(field) in (None, ""):
            errors.append(f"'{field}' is required.")

    if data.get("wasteType") and data["wasteType"] not in VALID_WASTE_TYPES:
        errors.append(f"wasteType must be one of: {VALID_WASTE_TYPES}")

    try:
        wg = float(data.get("wasteGenerated", -1))
        if wg < 0:
            errors.append("wasteGenerated must be a non-negative number.")
    except (TypeError, ValueError):
        errors.append("wasteGenerated must be a number.")

    return errors
