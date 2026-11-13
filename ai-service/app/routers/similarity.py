from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.nlp.similarity import related

router = APIRouter(tags=["similarity"])

class SimilarityRequest(BaseModel):
    text: str = Field(min_length=3, max_length=10000)
    candidates: list[dict] = Field(default_factory=list)
    threshold: float = Field(default=0.45, ge=0, le=1)

@router.post("/similarity")
def find_related(payload: SimilarityRequest):
    return {"matches": related(payload.text, payload.candidates, payload.threshold),
            "method": "token-overlap lexical baseline; not multilingual semantic embeddings"}
