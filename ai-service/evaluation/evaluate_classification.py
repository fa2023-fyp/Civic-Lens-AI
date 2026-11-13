import json
from pathlib import Path

REPORT = Path(__file__).resolve().parent / "reports" / "SYNTHETIC_classifier_comparison.json"

def main():
    if not REPORT.exists():
        raise SystemExit("No evaluation report found. Generate SYNTHETIC data and run training/train_classifier.py first.")
    result = json.loads(REPORT.read_text(encoding="utf-8"))
    print(f"Dataset: {result['dataset']}; held-out baseline comparison:")
    for model, metrics in result["results"].items():
        print(f"{model}: accuracy={metrics['accuracy']:.3f}, macro-F1={metrics['macro_f1']:.3f}")

if __name__ == "__main__":
    main()
