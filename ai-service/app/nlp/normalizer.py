import re

VARIANTS = {
    r"\bgutter\b": "sewer",
    r"\bnaali\b": "drain",
    r"\bpani\b": "water",
    r"\bbijli\b": "electricity",
    r"\bkachra\b": "garbage",
    r"\bsmell\b": "odor",
}

def normalize(text: str) -> str:
    value = re.sub(r"\s+", " ", text.strip().lower())
    for pattern, replacement in VARIANTS.items():
        value = re.sub(pattern, replacement, value)
    return value
