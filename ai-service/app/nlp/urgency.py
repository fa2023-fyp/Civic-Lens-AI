def recommend(text: str, duration_days=None) -> dict:
    lower = text.lower()
    critical = any(term in lower for term in ("life threatening", "fire", "electric shock", "injury"))
    high = critical or any(term in lower for term in ("overflow", "smell", "flood", "danger", "bohat zyada"))
    label = "Critical" if critical else "High" if high else "Medium" if duration_days else "Low"
    confidence = 0.82 if high else 0.72
    reasons = ["Urgency is a model recommendation for officer review."]
    if duration_days:
        reasons.append(f"Reported duration: {duration_days} day(s).")
    if high:
        reasons.append("Text includes a potential public-health or safety cue.")
    return {"label": label, "confidence": confidence, "reasons": reasons}
