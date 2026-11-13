#!/usr/bin/env sh
set -eu
python data/scripts/generate_synthetic.py
python data/scripts/make_splits.py
python ai-service/training/train_classifier.py
python ai-service/evaluation/evaluate_classification.py
python ai-service/evaluation/evaluate_duplicates.py
