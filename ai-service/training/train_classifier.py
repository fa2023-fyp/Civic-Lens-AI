import csv
import json
import sys
from datetime import date
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.svm import LinearSVC
from joblib import dump

ROOT = Path(__file__).resolve().parents[2]
SPLITS = ROOT / "data" / "splits"
REPORTS = ROOT / "ai-service" / "evaluation" / "reports"
ARTIFACTS = ROOT / "ai-service" / "app" / "models" / "artifacts"

def load(split):
    with (SPLITS / f"SYNTHETIC_{split}.csv").open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))

def rule_predict(text):
    lower = text.lower()
    rules = [("sewerage", ("sewer", "gutter", "گٹر")), ("drainage", ("drain", "naali", "نالہ")),
             ("garbage/waste", ("garbage", "kachra", "کوڑا")), ("electricity", ("electricity", "bijli", "بجلی")),
             ("water supply", ("water", "pani", "پانی")), ("roads", ("road", "sarak", "سڑک"))]
    return next((label for label, words in rules if any(word in lower for word in words)), "other")

def metrics(y_true, y_pred, labels):
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, labels=labels, average="macro", zero_division=0)
    return {"accuracy": accuracy_score(y_true, y_pred), "precision_macro": precision, "recall_macro": recall,
            "macro_f1": f1, "confusion_matrix": confusion_matrix(y_true, y_pred, labels=labels).tolist()}

def main():
    train, test = load("train"), load("test")
    x_train, y_train = [r["complaint_text"] for r in train], [r["category"] for r in train]
    x_test, y_test = [r["complaint_text"] for r in test], [r["category"] for r in test]
    labels = sorted(set(y_train) | set(y_test))
    results = {"rule_based": metrics(y_test, [rule_predict(x) for x in x_test], labels)}
    models = {
        "tfidf_logistic_regression": make_pipeline(TfidfVectorizer(ngram_range=(1, 2), max_features=12000), LogisticRegression(max_iter=1000, random_state=23)),
        "tfidf_naive_bayes": make_pipeline(TfidfVectorizer(ngram_range=(1, 2), max_features=12000), MultinomialNB()),
        "tfidf_linear_svm": make_pipeline(TfidfVectorizer(ngram_range=(1, 2), max_features=12000), LinearSVC(random_state=23)),
        "tfidf_random_forest": make_pipeline(TfidfVectorizer(ngram_range=(1, 2), max_features=12000), RandomForestClassifier(n_estimators=100, random_state=23, n_jobs=-1)),
    }
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    artifact_paths = {}
    for name, model in models.items():
        model.fit(x_train, y_train)
        results[name] = metrics(y_test, model.predict(x_test), labels)
        path = ARTIFACTS / f"SYNTHETIC_{name}.joblib"
        dump(model, path)
        artifact_paths[name] = path.relative_to(ROOT / "ai-service").as_posix()
    REPORTS.mkdir(parents=True, exist_ok=True)
    report_file = REPORTS / "SYNTHETIC_classifier_comparison.json"
    report_file.write_text(json.dumps({"dataset": "SYNTHETIC", "labels": labels, "results": results}, indent=2), encoding="utf-8")
    registry = {
        "dataset_version": "SYNTHETIC-v1",
        "trained_on": date.today().isoformat(),
        "runtime_selection": "transparent rules remain active; synthetic test results are not a basis for a real-world model selection",
        "artifacts": [{"name": n, "version": "0.1.0", "artifact_path": artifact_paths.get(n), "metrics": m} for n,m in results.items()]
    }
    registry_file = ROOT / "ai-service" / "app" / "models" / "model_registry.json"
    registry_file.parent.mkdir(parents=True, exist_ok=True)
    registry_file.write_text(json.dumps(registry, indent=2), encoding="utf-8")
    print(f"Evaluated {len(results)} classifier baselines on {len(test)} held-out SYNTHETIC rows; report: {report_file}")

if __name__ == "__main__":
    main()
