from app.config import CATEGORIES
from app.nlp.normalizer import normalize

KEYWORDS = {
    "sewerage": ("sewer", "gutter", "overflow", "manhole", "smell"),
    "drainage": ("drain", "naali", "flood", "waterlogging"),
    "water supply": ("water", "pani", "supply", "pipe leak"),
    "garbage/waste": ("garbage", "kachra", "waste", "rubbish"),
    "electricity": ("electricity", "bijli", "power outage", "wire"),
    "street lighting": ("street light", "lamp", "dark road"),
    "roads": ("pothole", "road", "sarak", "pavement"),
    "traffic": ("traffic", "signal", "congestion"),
    "parks": ("park", "playground"),
    "public safety": ("unsafe", "danger", "crime"),
}

def classify(text: str) -> dict:
    normalized = normalize(text)
    counts = {category: sum(1 for word in words if word in normalized) for category, words in KEYWORDS.items()}
    label = max(counts, key=counts.get) if max(counts.values(), default=0) else "other"
    confidence = min(0.95, 0.58 + 0.1 * counts[label]) if label != "other" else 0.35
    ranked = sorted(((k, v) for k, v in counts.items() if v), key=lambda x: -x[1])
    top = [{"label": k, "confidence": round(min(0.95, 0.58 + v * 0.1), 2)} for k, v in ranked[:3]]
    if not top:
        top = [{"label": "other", "confidence": confidence}]
    if label not in CATEGORIES:
        label = "sanitation" if label == "sewerage" else "other"
    return {"label": label, "confidence": round(confidence, 2), "top_k": top}
