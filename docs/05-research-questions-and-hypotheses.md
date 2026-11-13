# 05 · Research questions and hypotheses

All hypotheses are **to be tested, not assumed**. Synthetic-only measurements are pipeline checks and cannot establish field performance.

## Research questions

- **RQ1:** How do multilingual baselines compare for civic complaint category classification across English, Urdu, Roman Urdu, and mixed text?
- **RQ2:** Does multilingual semantic similarity improve duplicate detection over lexical keyword/TF-IDF baselines, including cross-language pairs?
- **RQ3:** Which language, script, and spelling variation groups have the most classification or routing errors?
- **RQ4:** How does confidence-threshold human review affect coverage, error rates, and officer workload?
- **RQ5:** Which complaint, status, elapsed-time, and workload features are useful for predicting SLA breaches on valid historical data?
- **RQ6:** Do location, time-window, and category constraints improve the usefulness of recurrent-issue clusters?
- **RQ7:** How often does citizen verification accept or reject submitted resolutions, and what explanations support appropriate follow-up?

## Hypotheses

- **H1:** A model trained/evaluated with language-aware representations will have higher macro-F1 than a transparent rule baseline on a representative, group-separated multilingual test set.
- **H2:** A multilingual semantic duplicate model will improve cross-language recall at an acceptable false-positive rate compared with lexical baselines.
- **H3:** Confidence-threshold human review will reduce high-impact routing errors among reviewed cases, while increasing review workload.
- **H4:** SLA risk features will outperform a category/urgency-only baseline on a temporally separated operational test set.
- **H5:** Combining semantic similarity with geospatial and temporal constraints will yield more actionable clusters than semantic similarity alone.

## Test protocol

Pre-register data inclusion and split rules, use group/time-aware holdouts, report confidence intervals and subgroup metrics, and retain annotation disagreements. Do not select a model by fashion or by synthetic test score alone.
