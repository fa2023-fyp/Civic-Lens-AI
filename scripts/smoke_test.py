import json
import os
import urllib.error
import urllib.request
import uuid

BACKEND = os.getenv("BACKEND_URL", "http://localhost:3000")
AI = os.getenv("AI_SERVICE_URL", "http://localhost:8000")
PASSWORD = "Smoke-Test-Local-Only-123!"

def request(url, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as response:
        return json.loads(response.read())

def main():
    assert request(f"{AI}/health")["status"] == "ok"
    assert request(f"{BACKEND}/health")["status"] == "ok"
    email = f"smoke-{uuid.uuid4().hex}@example.local"
    request(f"{BACKEND}/api/auth/register", {"name": "Local smoke test", "email": email, "password": PASSWORD})
    session = request(f"{BACKEND}/api/auth/login", {"email": email, "password": PASSWORD})
    complaint = request(f"{BACKEND}/api/complaints", {
        "text": "Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai."
    }, session["token"])
    ai = complaint["ai"]
    assert complaint["original_text"] == "Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai."
    assert ai["language"] == "roman_urdu"
    assert ai["category"]["label"] == "sewerage"
    assert ai["extraction"]["duration_days"] == 3
    officer = request(f"{BACKEND}/api/auth/login", {
        "email": "officer@example.local", "password": "LocalDemo-Only-ChangeMe!"
    })
    request(f"{BACKEND}/api/complaints/{complaint['id']}/review", {
        "category": "sewerage", "urgency": "High", "reason": "Officer accepted the model recommendations and assigned the issue."
    }, officer["token"])
    request(f"{BACKEND}/api/complaints/{complaint['id']}/resolutions", {
        "description": "Maintenance team reports the blockage was cleared.",
        "action_taken": "Drain cleared and inspected"
    }, officer["token"])
    rejected = request(f"{BACKEND}/api/complaints/{complaint['id']}/verify", {
        "accepted": False, "feedback": "The issue continues; please inspect again."
    }, session["token"])
    assert rejected["status"] == "Reopened"

    low_confidence = request(f"{BACKEND}/api/complaints", {
        "text": "A civic problem needs attention in this neighborhood."
    }, session["token"])
    assert low_confidence["needs_human_review"] is True
    admin = request(f"{BACKEND}/api/auth/login", {
        "email": "admin@example.local", "password": "LocalDemo-Only-ChangeMe!"
    })
    request(f"{BACKEND}/api/complaints/{low_confidence['id']}/review", {
        "category": "other", "urgency": "Medium", "reason": "Reviewed and confirmed as a general municipal issue."
    }, admin["token"])
    print(f"Smoke flow passed: complaint {complaint['id']} was rejected/reopened; low-confidence case was reviewed.")

if __name__ == "__main__":
    main()
