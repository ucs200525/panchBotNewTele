"""
Text Preprocessing Utilities
Vedic-aware text normalizer for the Python intelligence layer.
"""

import re

# Common Vedic term typos
TYPO_MAP = {
    r'\blagan\b': 'lagna',
    r'\blasendant\b': 'ascendant',
    r'\bnakashtra\b': 'nakshatra',
    r'\bnaksatra\b': 'nakshatra',
    r'\bmuhurtha\b': 'muhurat',
    r'\bmuhurta\b': 'muhurat',
    r'\bbuisness\b': 'business',
    r'\btoady\b': 'today',
    r'\btommorow\b': 'tomorrow',
    r'\bjupitar\b': 'jupiter',
    r'\bsatrun\b': 'saturn',
    r'\bvenis\b': 'venus',
    r'\bmerucry\b': 'mercury',
}

# Synonym normalization
SYNONYM_MAP = {
    r'\brising sign\b': 'lagna',
    r'\birth sign\b': 'lagna',
    r'\bbirth star\b': 'nakshatra',
    r'\bmy star\b': 'nakshatra',
    r'\bgood time\b': 'muhurat',
    r'\bauspicious time\b': 'muhurat',
    r'\btrip\b': 'travel',
    r'\bjourney\b': 'travel',
    r'\bstartup\b': 'business',
    r'\bnorth node\b': 'rahu',
    r'\bsouth node\b': 'ketu',
}


def preprocess(text: str) -> str:
    """Full preprocessing pipeline for Vedic queries."""
    if not text:
        return ""
    text = text.lower().strip()
    # Fix typos
    for pattern, replacement in TYPO_MAP.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    # Normalize synonyms
    for pattern, replacement in SYNONYM_MAP.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    # Clean special chars
    text = re.sub(r"[^\w\s?.!,'-]", " ", text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    return text
