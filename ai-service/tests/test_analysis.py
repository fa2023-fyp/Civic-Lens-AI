from fastapi.testclient import TestClient
from app.main import app
from app.nlp.language_id import detect_language
from app.nlp.similarity import lexical_similarity
from app.nlp.extractor import extract

client = TestClient(app)

def test_roman_urdu_example():
    response = client.post("/analyze", json={"text": "Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai."})
    assert response.status_code == 200
    result = response.json()
    assert result["language"] == "roman_urdu"
    assert result["category"]["label"] == "sewerage"
    assert result["urgency"]["label"] == "High"
    assert result["extraction"]["duration_days"] == 3

def test_language_variants_and_duration():
    assert detect_language("Street light is broken") == "en"
    assert detect_language("پانی کی فراہمی بند ہے") == "urdu"
    assert extract("Johar Town sewer leak for 4 days")["area"] == "Johar Town"

def test_similarity_baseline():
    assert lexical_similarity("water pipe leak", "water pipe leak") == 1

def test_low_confidence_is_routed_to_human_review():
    response = client.post("/analyze", json={"text": "Please look into this unusual civic matter."})
    assert response.status_code == 200
    assert response.json()["needs_human_review"] is True

def test_similarity_and_sla_risk_endpoints():
    match = client.post("/similarity", json={
        "text": "water pipe leak", "candidates": [{"id": "case-1", "text": "water pipe leak"}]
    }).json()
    assert match["matches"][0]["id"] == "case-1"
    risk = client.post("/sla-risk", json={
        "category": "roads", "urgency": "High", "status": "In Progress",
        "elapsed_hours": 23, "sla_hours": 24, "pending_workload": 50
    }).json()
    assert risk["experimental"] is True
    assert risk["risk"] == "High"

def test_cluster_groups_related_records_without_location():
    response = client.post("/clusters", json={"complaints": [
        {"id": "a", "category": "roads", "text": "large road pothole near school"},
        {"id": "b", "category": "roads", "text": "large road pothole near school"},
        {"id": "c", "category": "garbage/waste", "text": "uncollected garbage"}
    ]})
    assert response.status_code == 200
    clusters = response.json()["clusters"]
    assert len(clusters) == 1
    assert clusters[0]["complaint_count"] == 2
