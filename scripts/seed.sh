#!/usr/bin/env sh
set -eu
python data/scripts/generate_synthetic.py
python data/scripts/validate_dataset.py
python data/scripts/make_splits.py
