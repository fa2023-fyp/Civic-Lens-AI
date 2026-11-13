import csv
import json
from pathlib import Path

DATA_ROOT = Path(__file__).resolve().parents[1]
DATA = DATA_ROOT / "synthetic" / "SYNTHETIC_complaints.csv"
SCHEMA = DATA_ROOT / "schema" / "complaints.schema.json"

def validate():
    required = json.loads(SCHEMA.read_text(encoding="utf-8"))["required"]
    with DATA.open(encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        if reader.fieldnames != required:
            raise ValueError("CSV columns do not match schema")
    if len(rows) < 2000:
        raise ValueError(f"Expected >= 2000 rows; received {len(rows)}")
    if any(row["is_synthetic"].lower() != "true" for row in rows):
        raise ValueError("Every sample row must be marked synthetic")
    counts = {}
    for row in rows:
        counts[row["language"]] = counts.get(row["language"], 0) + 1
    if set(counts) != {"en", "urdu", "roman_urdu", "mixed"}:
        raise ValueError(f"Expected all four languages, got {counts}")
    print(f"Validated {len(rows)} SYNTHETIC records; language counts: {counts}")

if __name__ == "__main__":
    validate()
