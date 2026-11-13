# 01 · Project overview

## Identity

**Civic-Lens AI** — *AI-Powered Multilingual Civic Complaint Intelligence and Resolution System*. This is an AI/NLP R&D project aligned primarily with SDGs 11 and 16 and secondarily with SDGs 9 and 10.

It is **not a replacement complaint portal**. Pakistan already has complaint systems that support registration, tracking, routing, escalation, and feedback. Civic-Lens AI explores an AI intelligence and accountability layer: understand → extract → classify → prioritize → route → detect related issues → monitor SLA → escalate → verify resolution → audit AI decisions.

## Implemented foundation

- React + Vite UI with English/Urdu strings, RTL switching, login, complaint submission/list/detail, review queue, and reusable confidence, SLA, timeline, and explanation components.
- Express + PostgreSQL/PostGIS backend with JWT authentication, role checks, validated image upload limits, parameterized SQL, complaint submission and immutable original text, AI decision record, review reason, lifecycle status history, citizen resolution verification, escalation records, and admin audit export endpoints.
- FastAPI independent service with language heuristic, text normalization, information extraction, category/urgency/department recommendations, lexical similarity, clustering endpoint, experimental rule-based SLA risk, and OpenAPI.
- 2,000-row deterministic synthetic data generator, validation, grouped 70/15/15 split, classifier comparisons, and duplicate lexical baseline evaluation.
- Five-service Docker Compose definition and n8n workflow templates.

## Explicitly deferred

- `TODO(OPTIONAL)`: multilingual sentence-transformer embeddings and cross-language semantic duplicate evaluation.
- `TODO(OPTIONAL)`: validated learned SLA model using consented, representative historical operational data.
- `TODO(OPTIONAL)`: production email/SMS integration, notification recipient policy, and automated n8n event wiring.
- `TODO(OPTIONAL)`: complete role-specific dashboard designs, interactive public map, issue-cluster persistence, and advanced admin visualizations.
- `TODO(OPTIONAL)`: predictive hotspot detection, workload prediction, image relevance assistance, and LLM classification baseline.
- `TODO(OPTIONAL)`: production identity provisioning, deployment hardening, and formal privacy/security assessment.

CRUD, auth, maps, Docker, n8n, and REST endpoints support the research; they are not research novelty.
