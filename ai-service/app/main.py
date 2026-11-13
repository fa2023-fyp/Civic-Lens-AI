from fastapi import FastAPI
from app.config import REVIEW_THRESHOLD
from app.schemas import AnalyzeRequest
from app.nlp.language_id import detect_language
from app.nlp.normalizer import normalize
from app.nlp.extractor import extract
from app.nlp.classifier import classify
from app.nlp.urgency import recommend as urgency_recommend
from app.nlp.router import recommend as route_recommend
from app.nlp.similarity import related
from app.routers.similarity import router as similarity_router
from app.routers.cluster import router as cluster_router
from app.routers.sla_risk import router as sla_risk_router

app = FastAPI(title="Civic-Lens AI Analysis API", version="0.1.0",
              description="Research baseline recommendations; decisions remain with authorized officers.")
app.include_router(similarity_router)
app.include_router(cluster_router)
app.include_router(sla_risk_router)

@app.get("/health")
def health():
    return {"status": "ok", "model_mode": "transparent-rules-baseline"}

@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    category = classify(payload.text)
    extraction = extract(payload.text)
    urgency = urgency_recommend(payload.text, extraction["duration_days"])
    department = route_recommend(category["label"])
    language = detect_language(payload.text)
    review = min(category["confidence"], department["confidence"], urgency["confidence"]) < REVIEW_THRESHOLD
    return {
        "language": language, "normalized_text": normalize(payload.text),
        "extraction": extraction, "category": category, "urgency": urgency,
        "department": department, "related_complaints": related(payload.text, payload.candidates),
        "needs_human_review": review, "model_versions": {
            "classifier": "rules-v0.1", "urgency": "rules-v0.1", "router": "rules-v0.1",
            "embedder": "lexical-baseline-v0.1",
        },
    }
