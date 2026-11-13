# 02 · Novelty and research gap

## Positioning

Civic-Lens AI is an AI intelligence and accountability layer, not a replacement complaint portal. Existing complaint systems may already provide intake, tracking, routing, escalation, and feedback. This project does not claim that Pakistani portals lack AI or that any portal integration exists.

| Level | Scope |
|---|---|
| Existing workflow capabilities | Intake, tracking, routing, status management, escalation, citizen feedback (system-specific; not assessed here). |
| Partial capabilities in this prototype | English/Urdu/Roman Urdu/mixed-language heuristics, keyword category recommendations, extraction cues, SLA rules, role-aware lifecycle, citizen verification, append-only decision records. |
| Strong capabilities to investigate | Robust multilingual understanding, duplicate detection that transfers across scripts/languages, calibrated confidence, representative operational SLA-risk prediction, geographically aware recurrent-issue discovery. |
| Research novelty to test | Whether a human-in-the-loop, language-aware intelligence layer improves measurable routing/duplicate/SLA decision support without increasing harmful false positives or hiding uncertainty. |

This repository currently provides baselines and research infrastructure, not evidence that the hypotheses hold. No benchmark or novelty claim should be made before representative data, annotation quality checks, and evaluation.

## Current prototype boundary

The deployed classifier, urgency detector, and router use transparent rules. Similarity and cluster endpoints use lexical overlap. There is no multilingual embedding model, government integration, or validated production model. The synthetic data is not evidence of field performance.
