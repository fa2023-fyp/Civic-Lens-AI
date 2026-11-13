.PHONY: up down seed train eval test
up:
	docker compose up --build
down:
	docker compose down
seed:
	python data/scripts/generate_synthetic.py
	python data/scripts/make_splits.py
	docker compose exec backend npm run seed
train:
	python data/scripts/generate_synthetic.py
	python data/scripts/make_splits.py
	python ai-service/training/train_classifier.py
eval:
	python data/scripts/generate_synthetic.py
	python data/scripts/make_splits.py
	python ai-service/training/train_classifier.py
	python ai-service/evaluation/evaluate_classification.py
	python ai-service/evaluation/evaluate_duplicates.py
test:
	python -m pytest ai-service/tests
	cd backend && npm test
