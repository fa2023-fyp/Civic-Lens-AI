import csv
import random
from pathlib import Path

SEED = 23
DATA_ROOT = Path(__file__).resolve().parents[1]
OUT = DATA_ROOT / "synthetic" / "SYNTHETIC_complaints.csv"
CATEGORIES = [
    ("sanitation", "Municipal Sanitation Department", "street litter", "کچرا", "kachra"),
    ("garbage/waste", "Waste Management Department", "uncollected garbage", "کوڑا", "kooda"),
    ("sewerage", "Municipal Sewerage Department", "sewer overflow", "گٹر کا پانی", "gutter ka pani"),
    ("drainage", "Drainage Department", "blocked drain", "نالہ بند", "naali band"),
    ("water supply", "Water Supply Department", "water supply outage", "پانی کی فراہمی بند", "pani band"),
    ("electricity", "Electricity Department", "power outage", "بجلی بند", "bijli band"),
    ("street lighting", "Street Lighting Department", "street light outage", "سٹریٹ لائٹ خراب", "street light kharab"),
    ("roads", "Roads Department", "road pothole", "سڑک پر گڑھا", "sarak par gaddha"),
    ("traffic", "Traffic Department", "broken traffic signal", "ٹریفک سگنل خراب", "traffic signal kharab"),
    ("public infrastructure", "Municipal Services Department", "damaged footpath", "فٹ پاتھ ٹوٹا", "footpath toota"),
    ("parks", "Parks Department", "damaged park equipment", "پارک کا سامان خراب", "park ka saman kharab"),
    ("municipal services", "Municipal Services Department", "overflowing public bin", "عوامی ڈبہ بھرا ہوا", "public dabba bhara"),
    ("public safety", "Municipal Services Department", "unsafe exposed wiring", "کھلی تار خطرناک", "khuli taar khatarnak"),
    ("other", "Municipal Services Department", "municipal service issue", "بلدیاتی مسئلہ", "baldiati masla"),
]
AREAS = ["Model Town", "Johar Town", "Township", "Gulberg", "DHA", "Iqbal Town", "Wapda Town"]

def build_text(language, issue, urdu, roman, area, block, days, index):
    en = [
        f"{issue.capitalize()} reported in Block {block}, {area}; issue has continued for {days} days.",
        f"Please inspect the {issue} near Block {block} in {area}. It started {days} days ago."
    ]
    ur = [
        f"{area} بلاک {block} میں {urdu} کا مسئلہ ہے، یہ {days} دن سے جاری ہے۔",
        f"براہ کرم بلاک {block} {area} میں {urdu} کی شکایت دیکھیں، {days} دن ہو گئے۔"
    ]
    roman_ur = [
        f"{area} block {block} mein {roman} ka masla {days} din se hai.",
        f"Please {area} block {block} mein {roman}, {days} din se issue chal raha hai."
    ]
    return {"en": en, "urdu": ur, "roman_urdu": roman_ur, "mixed": [en[0] + " " + roman, roman + f" at {area} block {block}, {days} days se."]}[language][index % 2]

def main():
    random.seed(SEED)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fields = ["complaint_id","complaint_text","language","category","urgency","department","location","latitude","longitude","duration","resolution_time","status","duplicate_group","issue_cluster","is_synthetic"]
    languages = ["en", "urdu", "roman_urdu", "mixed"]
    with OUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for group in range(500):
            category, department, issue, urdu, roman = CATEGORIES[group % len(CATEGORIES)]
            area = random.choice(AREAS)
            block = random.randint(1, 25)
            duration = random.randint(1, 14)
            urgency = "Critical" if category == "public safety" and duration > 10 else "High" if duration >= 7 else "Medium" if duration >= 3 else "Low"
            for idx, language in enumerate(languages):
                writer.writerow({
                    "complaint_id": f"SYN-{group:04d}-{idx}", "complaint_text": build_text(language, issue, urdu, roman, area, block, duration, idx),
                    "language": language, "category": category, "urgency": urgency, "department": department,
                    "location": f"{area}, Lahore", "latitude": round(31.35 + random.random() * 0.18, 6),
                    "longitude": round(74.15 + random.random() * 0.2, 6), "duration": duration,
                    "resolution_time": random.randint(4, 168), "status": random.choice(["Resolved", "In Progress", "Assigned"]),
                    "duplicate_group": f"SYN-DUP-{group:04d}", "issue_cluster": f"SYN-CLUSTER-{group:04d}",
                    "is_synthetic": "true"
                })
    print(f"Generated 2000 SYNTHETIC rows at {OUT}")

if __name__ == "__main__":
    main()
