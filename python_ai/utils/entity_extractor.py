"""
Entity Extractor — spaCy + Sentence Transformers
Extracts structured entities from Vedic astrological queries.
"""

import re
import spacy
from sentence_transformers import SentenceTransformer, util
from typing import Dict, List, Any

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading en_core_web_sm...")
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Load Sentence Transformer for semantic phrase matching
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")

# Reference phrases for "Date of Birth" matching
DOB_PHRASES = ["date of birth", "dob", "born on", "birth date", "year of birth", "when i was born"]
dob_embeddings = semantic_model.encode(DOB_PHRASES)

PLANETS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu",
           "surya", "chandra", "mangal", "budha", "guru", "shukra", "shani"]
ZODIAC = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
          "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
NAKSHATRAS = ["ashwini", "bharani", "krittika", "rohini", "mrigashirsha", "ardra",
              "punarvasu", "pushya", "ashlesha", "magha", "purva phalguni", "uttara phalguni",
              "hasta", "chitra", "swati", "vishakha", "anuradha", "jyeshtha",
              "mula", "purva ashadha", "uttara ashadha", "shravana", "dhanishta",
              "shatabhisha", "purva bhadrapada", "uttara bhadrapada", "revati"]


class EntityExtractor:
    def extract(self, text: str) -> Dict[str, Any]:
        doc = nlp(text)
        q = text.lower()
        
        entities = {
            "planets": [],
            "zodiac_signs": [],
            "nakshatras": [],
            "dates": [],
            "times": [],
            "locations": [],
            "is_providing_dob": self._is_providing_dob(q)
        }
        
        # Astrological Entities (Dictionary matching)
        for p in PLANETS:
            if re.search(rf"\b{p}\b", q):
                entities["planets"].append(p.capitalize())
        for z in ZODIAC:
            if re.search(rf"\b{z}\b", q):
                entities["zodiac_signs"].append(z.capitalize())
        for n in NAKSHATRAS:
            if re.search(rf"\b{n}\b", q):
                entities["nakshatras"].append(n.title())

        # spaCy NER for general entities
        for ent in doc.ents:
            if ent.label_ == "DATE":
                entities["dates"].append(ent.text)
            elif ent.label_ == "TIME":
                entities["times"].append(ent.text)
            elif ent.label_ == "GPE" or ent.label_ == "LOC":
                entities["locations"].append(ent.text)
                
        # Regex fallback for Times if spaCy misses it
        fallback_times = re.findall(r"\b\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\b", text)
        for ft in fallback_times:
            if ft not in entities["times"]:
                entities["times"].append(ft)
                
        return entities

    def _is_providing_dob(self, text: str) -> bool:
        """
        Uses semantic matching to detect if the user is giving their date of birth,
        handling variations like "DOB", "date of birth", "date and year of birth", etc.
        """
        # If it's a question asking for/retrieving DOB, it's NOT providing DOB
        is_question = bool(re.search(r"\b(when|where|what\s+is|what\s+are|tell\s+me|show|get|retrieve|do\s+you\s+know)\b", text))
        if is_question:
            return False
            
        text_embedding = semantic_model.encode([text])
        cos_scores = util.cos_sim(text_embedding, dob_embeddings)[0]
        # If any of the scores is above a threshold (e.g., 0.5), we assume they are talking about DOB
        if max(cos_scores) > 0.5:
            return True
        return False
