import csv
import json
import random
import re
from collections import Counter
from math import sqrt
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import precision_recall_fscore_support
from sklearn.metrics.pairwise import cosine_similarity

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data" / "synthetic" / "SYNTHETIC_complaints.csv"
REPORT = ROOT / "ai-service" / "evaluation" / "reports" / "SYNTHETIC_duplicate_comparison.json"

def tokens(text):
    return Counter(re.findall(r"\w+", text.lower()))

def lexical(a, b):
    left, right = tokens(a), tokens(b)
    shared = set(left) | set(right)
    den = sqrt(sum(x*x for x in left.values()) * sum(x*x for x in right.values()))
    return sum(left[x] * right[x] for x in shared) / den if den else 0

def summary(y, pred):
    p, r, f, _ = precision_recall_fscore_support(y, pred, average="binary", zero_division=0)
    tn = sum(1 for actual, guess in zip(y, pred) if actual == 0 and guess == 0)
    fp = sum(1 for actual, guess in zip(y, pred) if actual == 0 and guess == 1)
    return {"precision": p, "recall": r, "f1": f, "false_positive_rate": fp / (fp + tn) if fp + tn else 0}

def main():
    with SOURCE.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    rng = random.Random(23)
    rng.shuffle(rows)
    pairs = []
    by_group = {}
    for index, row in enumerate(rows):
        by_group.setdefault(row["duplicate_group"], []).append(index)
    for members in by_group.values():
        if len(members) >= 2:
            pairs.append((members[0], members[1], 1))
    texts = [row["complaint_text"] for row in rows]
    while len(pairs) < 1000:
        left, right = rng.sample(range(len(rows)), 2)
        if rows[left]["duplicate_group"] != rows[right]["duplicate_group"]:
            pairs.append((left, right, 0))
    pairs = pairs[:2000]
    vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(2, 5), max_features=20000)
    matrix = vectorizer.fit_transform(texts)
    actual = [pair[2] for pair in pairs]
    lexical_scores = [lexical(texts[a], texts[b]) for a,b,_ in pairs]
    char_scores = [float(cosine_similarity(matrix[a], matrix[b])[0,0]) for a,b,_ in pairs]
    lexical_pred = [int(score >= .3) for score in lexical_scores]
    char_pred = [int(score >= .25) for score in char_scores]
    report = {
        "dataset": "SYNTHETIC",
        "scope_note": "Both systems are lexical baselines. Character n-gram TF-IDF is not a multilingual sentence-embedding model.",
        "pair_count": len(pairs),
        "cross_language_positive_pairs": sum(1 for a,b,label in pairs if label and rows[a]["language"] != rows[b]["language"]),
        "token_tfidf_like_baseline": summary(actual, lexical_pred),
        "character_ngram_tfidf_baseline": summary(actual, char_pred)
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Compared two lexical duplicate baselines on {len(pairs)} SYNTHETIC pairs; report: {REPORT}")

if __name__ == "__main__":
    main()
