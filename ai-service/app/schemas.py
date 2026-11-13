from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    complaint_id: str | None = None
    text: str = Field(min_length=3, max_length=10000)
    candidates: list[dict] = Field(default_factory=list)

class AnalyzeResponse(BaseModel):
    language: str
    normalized_text: str
    extraction: dict
    category: dict
    urgency: dict
    department: dict
    related_complaints: list[dict]
    needs_human_review: bool
    model_versions: dict
