from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(tags=["sla-risk"])

class RiskRequest(BaseModel):
    category: str
    urgency: str
    status: str
    elapsed_hours: float = Field(ge=0)
    sla_hours: float = Field(gt=0)
    pending_workload: int = Field(default=0, ge=0)

@router.post("/sla-risk")
def assess_risk(payload: RiskRequest):
    elapsed_ratio = payload.elapsed_hours / payload.sla_hours
    score = min(1.0, elapsed_ratio * 0.7 + min(payload.pending_workload / 50, 0.3))
    if payload.status in ("Resolution Submitted", "Citizen Verification", "Resolved"):
        score *= 0.5
    level = "High" if score >= 0.75 else "Medium" if score >= 0.4 else "Low"
    return {
        "risk": level, "risk_score": round(score, 3), "estimated_delay_hours": [0, 0] if level == "Low" else [1, 24] if level == "Medium" else [24, 72],
        "experimental": True, "model": "transparent rules baseline",
        "explanation": ["Estimate uses elapsed-to-SLA ratio and pending workload; it is not trained on operational records."]
    }
