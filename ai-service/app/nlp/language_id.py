import re

URDU_RANGE = re.compile(r"[\u0600-\u06FF]")
URDU_WORDS = {"اور", "ہے", "میں", "کو", "کا", "کی", "سے", "پانی", "سڑک"}

def detect_language(text: str) -> str:
    if URDU_RANGE.search(text):
        latin = re.search(r"[A-Za-z]", text)
        return "mixed" if latin else "urdu"
    roman_markers = re.search(r"\b(gali|mein|hai|ho raha|bohat|pani|se|ka|ki|ko|din)\b", text.lower())
    return "roman_urdu" if roman_markers else "en"
