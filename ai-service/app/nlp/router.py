DEPARTMENTS = {
    "sewerage": "Municipal Sewerage Department", "sanitation": "Municipal Sanitation Department",
    "drainage": "Drainage Department", "garbage/waste": "Waste Management Department",
    "water supply": "Water Supply Department", "electricity": "Electricity Department",
    "street lighting": "Street Lighting Department", "roads": "Roads Department",
    "traffic": "Traffic Department", "parks": "Parks Department",
}

def recommend(category: str) -> dict:
    return {"label": DEPARTMENTS.get(category, "Municipal Services Department"),
            "confidence": 0.78 if category != "other" else 0.4,
            "reason": "Recommended from the predicted complaint category; an officer makes the final assignment."}
