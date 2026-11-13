import os

REVIEW_THRESHOLD = float(os.getenv("AI_REVIEW_THRESHOLD", "0.55"))
CATEGORIES = [
    "sanitation", "garbage/waste", "sewerage", "drainage", "water supply",
    "electricity", "street lighting", "roads", "traffic",
    "public infrastructure", "parks", "municipal services", "public safety", "other",
]
