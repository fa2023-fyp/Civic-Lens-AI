# 06 · Dataset card

## Current dataset

`data/scripts/generate_synthetic.py` writes `data/synthetic/SYNTHETIC_complaints.csv` with 2,000 deterministic **SYNTHETIC** rows. Four text variants per generated issue group yield exactly 500 rows per label: English (`en`), Urdu script (`urdu`), Roman Urdu (`roman_urdu`), and mixed (`mixed`). Locality names are illustrative; generated coordinates are randomized and are not citizen reports.

Fields: `complaint_id`, `complaint_text`, `language`, `category`, `urgency`, `department`, `location`, `latitude`, `longitude`, `duration`, `resolution_time`, `status`, `duplicate_group`, `issue_cluster`, `is_synthetic`.

## Splits and leakage

`data/scripts/make_splits.py` uses seed 23 and assigns entire `duplicate_group` groups to train/validation/test at 70/15/15. All language variants of a generated issue stay together. The script prints counts and raises if duplicate groups overlap. A grouped split is preferable to a row shuffle but is not a substitute for temporal or external validation.

## Limitations

Text is template-generated and does not model real spelling diversity, geographic distribution, reporting behavior, annotation noise, class prevalence, or operational outcomes. Labels are generated from templates. Training/testing on this file only validates code paths and must never be described as real-world accuracy.

Schema: `data/schema/complaints.schema.json`. Validation checks required fields, 2,000-row minimum, language coverage, and `is_synthetic=true`.
