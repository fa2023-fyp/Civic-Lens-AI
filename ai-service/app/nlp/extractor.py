import re

def extract(text: str) -> dict:
    lower = text.lower()
    duration = re.search(r"(\d+)\s*(day|days|din|hafta|week)", lower)
    area = next((name for name in ("Model Town", "Johar Town", "Township", "Gulberg", "DHA") if name.lower() in lower), "")
    issue = next((word for word in ("sewer overflow", "gutter overflow", "water leak", "garbage", "pothole", "street light") if word in lower), "")
    return {
        "area": area, "block": "", "street": "", "landmark": "", "issue": issue,
        "duration_days": int(duration.group(1)) if duration else None,
        "affected": "", "requested_action": "",
    }
