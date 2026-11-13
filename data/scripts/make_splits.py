import csv
import random
from pathlib import Path

DATA_ROOT = Path(__file__).resolve().parents[1]
SOURCE = DATA_ROOT / "synthetic" / "SYNTHETIC_complaints.csv"
OUT = DATA_ROOT / "splits"
SEED = 23

def main():
    with SOURCE.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    groups = sorted({row["duplicate_group"] for row in rows})
    random.Random(SEED).shuffle(groups)
    train_end, val_end = int(len(groups) * .70), int(len(groups) * .85)
    assignment = {group: "train" if i < train_end else "val" if i < val_end else "test" for i, group in enumerate(groups)}
    grouped = {split: [] for split in ("train", "val", "test")}
    for row in rows:
        grouped[assignment[row["duplicate_group"]]].append(row)
    OUT.mkdir(parents=True, exist_ok=True)
    for split, values in grouped.items():
        with (OUT / f"SYNTHETIC_{split}.csv").open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(values)
    group_sets = [{row["duplicate_group"] for row in values} for values in grouped.values()]
    leakage = any(group_sets[i] & group_sets[j] for i in range(3) for j in range(i + 1, 3))
    if leakage:
        raise RuntimeError("Duplicate-group leakage detected")
    print(f"Split sizes: { {k: len(v) for k,v in grouped.items()} }; duplicate_group leakage: {leakage}")

if __name__ == "__main__":
    main()
