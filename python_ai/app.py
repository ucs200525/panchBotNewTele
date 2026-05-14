"""
Vedic AI Intelligence Service — FastAPI v1.0
Python microservice for intent classification and NLP.
Node.js calls this at http://localhost:8001

Endpoints:
  POST /classify  → intent classification (ML model)
  POST /entities  → entity extraction (spaCy)
  POST /semantic  → semantic similarity
  GET  /health    → health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import os

# Optional imports — gracefully degrade if not installed
try:
    from model.intent_classifier import IntentClassifier
    classifier = IntentClassifier()
    classifier.load()
    CLASSIFIER_AVAILABLE = True
except Exception as e:
    logging.warning(f"Intent classifier not loaded: {e}. Train first with: python train.py")
    classifier = None
    CLASSIFIER_AVAILABLE = False

# Transformer Model Setup
TRANSFORMER_AVAILABLE = False
transformer_model = None
transformer_tokenizer = None
transformer_intents = []

try:
    import torch
    from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
    import json
    
    MODEL_DIR = os.path.join(os.path.dirname(__file__), "model", "distilbert_saved")
    if os.path.exists(MODEL_DIR):
        transformer_tokenizer = DistilBertTokenizer.from_pretrained(MODEL_DIR)
        transformer_model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
        
        with open(os.path.join(MODEL_DIR, "intents.json"), "r") as f:
            transformer_intents = json.load(f)
            
        TRANSFORMER_AVAILABLE = True
        logging.info("DistilBERT model loaded successfully.")
    else:
        logging.warning("DistilBERT model directory not found. Run train_transformer.py first.")
except ImportError:
    logging.warning("transformers or torch not installed. DistilBERT will not be available.")
except Exception as e:
    logging.warning(f"Failed to load DistilBERT: {e}")

try:
    from utils.entity_extractor import EntityExtractor
    entity_extractor = EntityExtractor()
    ENTITY_EXTRACTOR_AVAILABLE = True
except Exception as e:
    logging.warning(f"Entity extractor not loaded: {e}")
    entity_extractor = None
    ENTITY_EXTRACTOR_AVAILABLE = False

# ── App Setup ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Vedic AI Intelligence Service",
    description="Python NLP microservice for the Vedic Astro Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vedic_ai")

# ── Request/Response Models ────────────────────────────────────────────────
class ClassifyRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = {}

class ClassifyResponse(BaseModel):
    intent: str
    confidence: float
    source: str = "python_ml"

class EntitiesRequest(BaseModel):
    query: str

class SemanticRequest(BaseModel):
    query: str

# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "classifier_ready": CLASSIFIER_AVAILABLE,
        "entity_extractor_ready": ENTITY_EXTRACTOR_AVAILABLE
    }

@app.post("/classify")
def classify_intent(req: ClassifyRequest):
    """
    Classify user query intent using trained ML model.
    Returns structured intent with confidence score.
    Falls back to a graceful JSON error (not a 503) so the Node.js bridge
    can detect the failure and trigger the regex fallback cleanly.
    """
    if not CLASSIFIER_AVAILABLE or classifier is None:
        logger.warning(f"Classify called but model not ready. Run train.py first.")
        return {"intent": None, "confidence": 0.0, "error": "model_not_trained", "source": "python_ml"}

    try:
        intent, confidence = classifier.predict(req.query)
        logger.info(f"Classified: '{req.query}' → {intent} ({confidence:.2f})")
        return {"intent": intent, "confidence": confidence, "source": "python_ml"}
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return {"intent": None, "confidence": 0.0, "error": str(e), "source": "python_ml"}

class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
def predict_transformer(req: PredictRequest):
    """
    Classify using the DistilBERT multi-label model.
    """
    if not TRANSFORMER_AVAILABLE:
        return {"error": "DistilBERT model not loaded. Please train first."}
        
    try:
        import torch
        inputs = transformer_tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
        
        # Don't compute gradients
        with torch.no_grad():
            outputs = transformer_model(**inputs)
            
        probs = torch.sigmoid(outputs.logits).detach().numpy()[0]
        
        # Filter intents with > 0.4 probability
        threshold = 0.4
        matched_intents = []
        max_prob = 0.0
        max_intent = None
        
        for i, prob in enumerate(probs):
            prob = float(prob)
            if prob > threshold:
                matched_intents.append(transformer_intents[i])
            if prob > max_prob:
                max_prob = prob
                max_intent = transformer_intents[i]
                
        # If nothing passed threshold, return the top one
        if len(matched_intents) == 0 and max_intent is not None:
            matched_intents.append(max_intent)
            
        return {
            "intents": matched_intents,
            "confidence": float(max_prob),
            "all_probs": {transformer_intents[i]: float(probs[i]) for i in range(len(probs))}
        }
    except Exception as e:
        logger.error(f"Transformer prediction error: {e}")
        return {"error": str(e)}

@app.post("/entities")
def extract_entities(req: EntitiesRequest):
    """
    Extract named entities from the query using spaCy.
    """
    if not ENTITY_EXTRACTOR_AVAILABLE or entity_extractor is None:
        return {"entities": [], "message": "Entity extractor not available"}
    try:
        return entity_extractor.extract(req.query)
    except Exception as e:
        return {"entities": [], "error": str(e)}

@app.post("/semantic")
def semantic_search(req: SemanticRequest):
    """
    Semantic similarity search over the Vedic knowledge base.
    Returns the most relevant knowledge entry for the query.
    """
    # Phase 3 feature — returns empty for now
    return {"matches": [], "message": "Semantic search not yet initialized. Coming in Phase 3."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
