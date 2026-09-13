"""
services/recommendation_service.py
────────────────────────────────────
Explainable recommendation engine.
Generates dynamic, data-driven recommendations from prediction inputs.
All language is hedged (estimated / potential / may improve) — no guarantees.
"""

import logging

logger = logging.getLogger(__name__)


def generate_recommendations(
    predicted_waste: float,
    risk_level: str,
    recycling_rate: float,
    municipal_efficiency: float,
    awareness_campaigns: int,
    waste_type: str,
    landfill_pressure: float,
) -> list:
    """
    Generate prioritised, explainable recommendations.

    Returns list of dicts:
        {priority, title, message, expected_benefit}
    """
    recs = []

    # ── Recycling rate recommendations ────────────────────────────────────────
    if recycling_rate < 30:
        recs.append({
            "priority": "HIGH",
            "title": "Urgently Improve Recycling Infrastructure",
            "message": (
                f"The current recycling rate of {recycling_rate:.1f}% is critically low. "
                "Establishing dedicated segregation facilities and material recovery centres "
                "is recommended as a priority intervention."
            ),
            "expected_benefit": "Potential reduction in landfill dependency and waste volume pressure",
        })
    elif recycling_rate < 50:
        recs.append({
            "priority": "HIGH",
            "title": "Improve Recycling Capacity",
            "message": (
                f"The current recycling rate of {recycling_rate:.1f}% is below the recommended "
                "50% threshold. Expanding source segregation programmes and material recovery "
                "facilities may improve recycling performance."
            ),
            "expected_benefit": "Estimated improvement in material recovery and reduced landfill pressure",
        })
    elif recycling_rate < 65:
        recs.append({
            "priority": "MEDIUM",
            "title": "Enhance Material Recovery Performance",
            "message": (
                f"Recycling rate is at {recycling_rate:.1f}%. Targeted improvements to "
                "collection logistics and processing capacity may help reach the 65% benchmark."
            ),
            "expected_benefit": "Potential increase in recovered materials and cost efficiency",
        })

    # ── Municipal efficiency recommendations ──────────────────────────────────
    if municipal_efficiency <= 4:
        recs.append({
            "priority": "HIGH",
            "title": "Overhaul Municipal Waste Operations",
            "message": (
                f"Municipal efficiency score of {municipal_efficiency}/10 indicates significant "
                "operational gaps. Route optimisation, fleet upgrades, and staff training are "
                "recommended to improve collection coverage."
            ),
            "expected_benefit": "Potential improvement in collection efficiency and service coverage",
        })
    elif municipal_efficiency <= 6:
        recs.append({
            "priority": "MEDIUM",
            "title": "Improve Collection Route Efficiency",
            "message": (
                f"Municipal efficiency score of {municipal_efficiency}/10 suggests room for "
                "operational improvement. Reviewing collection routes and scheduling may "
                "reduce operational costs."
            ),
            "expected_benefit": "Estimated reduction in operational costs and improved service delivery",
        })

    # ── Awareness campaign recommendations ────────────────────────────────────
    if awareness_campaigns < 3:
        recs.append({
            "priority": "HIGH",
            "title": "Launch Public Awareness Campaigns",
            "message": (
                f"Only {awareness_campaigns} awareness campaign(s) recorded. Increasing public "
                "engagement through community drives, school programmes, and digital outreach "
                "is recommended to improve waste segregation at source."
            ),
            "expected_benefit": "Potential improvement in source segregation and recycling participation",
        })
    elif awareness_campaigns < 8:
        recs.append({
            "priority": "MEDIUM",
            "title": "Expand Awareness Programme Reach",
            "message": (
                f"With {awareness_campaigns} campaigns, there is scope to increase public "
                "outreach. Targeted campaigns for high-density areas may improve waste "
                "management behaviour."
            ),
            "expected_benefit": "Estimated improvement in community participation and waste reduction",
        })

    # ── Landfill pressure recommendations ─────────────────────────────────────
    if landfill_pressure >= 70:
        recs.append({
            "priority": "HIGH",
            "title": "Reduce Landfill Dependency Urgently",
            "message": (
                "Landfill pressure is critically high. Prioritising composting, biomethanation, "
                "and recycling diversion is recommended to reduce landfill intake. "
                "Exploring alternative disposal infrastructure may be necessary."
            ),
            "expected_benefit": "Potential reduction in landfill utilisation and extended site lifespan",
        })
    elif landfill_pressure >= 40:
        recs.append({
            "priority": "MEDIUM",
            "title": "Monitor and Manage Landfill Pressure",
            "message": (
                "Landfill pressure is at a moderate level. Increasing diversion through "
                "recycling and composting is recommended to prevent escalation."
            ),
            "expected_benefit": "Estimated stabilisation of landfill utilisation rates",
        })

    # ── Waste-type specific recommendations ───────────────────────────────────
    waste_type_recs = {
        "Plastic": {
            "priority": "MEDIUM",
            "title": "Implement Plastic Source Segregation",
            "message": (
                "Plastic waste requires dedicated source segregation and recovery programmes. "
                "Establishing plastic collection points and partnering with recyclers is "
                "recommended to improve plastic recovery rates."
            ),
            "expected_benefit": "Potential increase in plastic material recovery and reduced landfill input",
        },
        "Organic": {
            "priority": "MEDIUM",
            "title": "Scale Composting and Biomethanation",
            "message": (
                "Organic waste is well-suited for composting and biomethanation. "
                "Expanding decentralised composting units and biogas plants may "
                "significantly reduce organic waste sent to landfill."
            ),
            "expected_benefit": "Estimated reduction in organic waste landfilling and potential energy recovery",
        },
        "E-Waste": {
            "priority": "HIGH",
            "title": "Strengthen E-Waste Collection Channels",
            "message": (
                "E-waste requires authorised collection and recycling through certified "
                "e-waste processors. Establishing dedicated collection drives and "
                "producer responsibility programmes is recommended."
            ),
            "expected_benefit": "Potential recovery of valuable materials and prevention of hazardous leaching",
        },
        "Hazardous": {
            "priority": "HIGH",
            "title": "Ensure Specialised Hazardous Waste Handling",
            "message": (
                "Hazardous waste must be handled through certified treatment, storage, "
                "and disposal facilities (TSDFs). Compliance with CPCB guidelines and "
                "regular audits are strongly recommended."
            ),
            "expected_benefit": "Prevention of environmental contamination and regulatory compliance",
        },
        "Construction": {
            "priority": "LOW",
            "title": "Implement C&D Waste Recovery",
            "message": (
                "Construction and demolition waste can be processed for material recovery. "
                "Establishing C&D waste processing facilities and mandating waste management "
                "plans for construction projects is recommended."
            ),
            "expected_benefit": "Potential recovery of aggregates and reduction in virgin material consumption",
        },
    }

    if waste_type in waste_type_recs:
        recs.append(waste_type_recs[waste_type])

    # ── Risk-level based general recommendation ───────────────────────────────
    if risk_level == "CRITICAL" and predicted_waste > 3000:
        recs.append({
            "priority": "HIGH",
            "title": "Activate Emergency Waste Management Protocol",
            "message": (
                f"The predicted waste volume of {predicted_waste:,.1f} T/Day combined with "
                "a CRITICAL risk level suggests immediate intervention is required. "
                "A comprehensive waste management action plan is recommended."
            ),
            "expected_benefit": "Scenario-based reduction in waste management risk through coordinated action",
        })

    # Sort by priority: HIGH → MEDIUM → LOW
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    recs.sort(key=lambda r: priority_order.get(r["priority"], 3))

    return recs
