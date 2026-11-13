# 04 · SRS outline

## Functional requirements

1. **FR-01 Intake:** authenticated citizens submit English, Urdu, Roman Urdu, or mixed complaint text, optional location coordinates, and up to five JPEG/PNG/WebP images (5 MiB each).
2. **FR-02 Preservation:** save exact submitted text in `original_text`; retain normalized text separately.
3. **FR-03 Recommendations:** return language, extraction cues, category, urgency, department, related-complaint baseline, threshold decision, and model version from the AI service.
4. **FR-04 Review:** route below-threshold cases for human review; officers must give a reason; retain initial and corrected AI records.
5. **FR-05 Workflow:** maintain status history, SLA deadline, resolution submission, citizen verification, reopen, and escalation.
6. **FR-06 Access:** JWT authentication and role checks for citizens, officers, supervisors, and administrators.
7. **FR-07 Audit:** admin can retrieve the AI-decision history and export CSV; aggregate override and low-confidence rates are exposed.
8. **FR-08 Research:** generate labeled synthetic data, validate schema, create leakage-aware splits, and compute baselines from files.

## Non-functional requirements

- Local development with Docker Compose; API schemas available at `/docs`.
- SQL queries use placeholders; password hashes use bcrypt; API requests are rate limited.
- Private citizen details are not part of aggregate analytics.
- Uncertain AI output must remain visibly a recommendation.
- Synthetic data is marked and isolated from real/operational records.
- Tests and scripts are deterministic where applicable and must not invent benchmark results.

## Out of scope

Government-system integration, automated proof of repair, production notification providers, legal service levels, and claims of operational accuracy.
