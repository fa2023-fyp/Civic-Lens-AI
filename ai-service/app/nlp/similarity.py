import re
from collections import Counter
from math import sqrt

def _tokens(text: str) -> Counter:
    return Counter(re.findall(r"\w+", text.lower()))

def lexical_similarity(left: str, right: str) -> float:
    a, b = _tokens(left), _tokens(right)
    keys = set(a) | set(b)
    dot = sum(a[k] * b[k] for k in keys)
    denom = sqrt(sum(v*v for v in a.values()) * sum(v*v for v in b.values()))
    return dot / denom if denom else 0.0

def related(text: str, candidates: list[dict], threshold: float = 0.45) -> list[dict]:
    matches = []
    for candidate in candidates:
        score = lexical_similarity(text, candidate.get("text", ""))
        if score >= threshold:
            matches.append({"id": candidate["id"], "similarity": round(score, 3)})
    return sorted(matches, key=lambda x: x["similarity"], reverse=True)
