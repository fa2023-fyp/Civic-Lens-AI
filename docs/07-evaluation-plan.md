# 07 · Evaluation plan

## Present scripts

- `training/train_classifier.py`: evaluates rule, TF-IDF + Logistic Regression, Naive Bayes, Linear SVM, and Random Forest on the generated grouped test split. It computes accuracy, macro precision/recall/F1, and confusion matrices from actual rows. It writes a JSON report, measured model registry, and serialized TF-IDF model artifacts. Runtime continues to use transparent rules because synthetic-only results are not a sound basis for production model selection.
- `evaluation/evaluate_classification.py`: reports the metrics from the generated training report.
- `evaluation/evaluate_duplicates.py`: computes precision, recall, F1, false-positive rate, and cross-language positive-pair count for token and character-ngram lexical methods. It explicitly does **not** evaluate sentence embeddings.

No values are included in source as benchmark results. Run the scripts to generate local outputs. Reports refer to SYNTHETIC data and cannot justify deployment.

## Required future evaluation

1. Obtain representative, permissioned, de-identified civic text and documented annotation guidelines.
2. Split by duplicate/issue group and time; maintain a locked external test set.
3. Classification: accuracy, per-class and macro precision/recall/F1, confusion matrices, calibration, and language/script subgroup metrics.
4. Duplicates: precision/recall/F1, false-positive duplicate rate, cross-language subset results, threshold curves, and manually reviewed false-positive analysis.
5. Urgency/routing: confusion matrices, high-impact error analysis, calibration, and human override rates.
6. SLA risk: temporal holdout, AUROC/PR-AUC, calibration, delay-range coverage, and workload-stratified results.
7. Workflow: processing time, escalation delay, notification latency, review workload, resolution-verification accept/reject rate.
8. Human review: confidence distribution, review coverage, correction/override rate, and low-confidence routing rate.

### Research methods still missing

Multilingual sentence embeddings, pretrained transformer comparisons, annotated operational SLA records, and workflow instrumentation need implementation and data before the corresponding claims are evaluated.
