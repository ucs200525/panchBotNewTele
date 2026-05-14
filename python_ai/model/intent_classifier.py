"""
Intent Classifier — TF-IDF + Logistic Regression
Trained on Vedic astrology query examples.
Run train.py to create intent_model.pkl.
"""

import os
import joblib
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = os.path.join(os.path.dirname(__file__), "intent_model.pkl")


class IntentClassifier:
    def __init__(self):
        self.pipeline = None
        self.label_encoder = None
        self.classes = None

    def build(self, texts, labels):
        """Build and train the classification pipeline."""
        self.label_encoder = LabelEncoder()
        encoded_labels = self.label_encoder.fit_transform(labels)
        self.classes = self.label_encoder.classes_

        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                ngram_range=(1, 3),       # unigrams, bigrams, trigrams
                max_features=5000,
                min_df=1,
                analyzer='word',
                lowercase=True,
                sublinear_tf=True,        # log scaling to reduce freq bias
            )),
            ('clf', LogisticRegression(
                max_iter=1000,
                C=5.0,                    # regularization strength
                solver='lbfgs',
            ))
        ])

        self.pipeline.fit(texts, encoded_labels)
        print(f"[IntentClassifier] Trained on {len(texts)} examples, {len(self.classes)} classes.")
        return self

    def save(self):
        """Serialize the model to disk."""
        joblib.dump({
            'pipeline': self.pipeline,
            'label_encoder': self.label_encoder,
            'classes': self.classes,
        }, MODEL_PATH)
        print(f"[IntentClassifier] Saved to {MODEL_PATH}")

    def load(self):
        """Load serialized model from disk."""
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
        data = joblib.load(MODEL_PATH)
        self.pipeline = data['pipeline']
        self.label_encoder = data['label_encoder']
        self.classes = data['classes']
        print(f"[IntentClassifier] Loaded from {MODEL_PATH}, classes: {list(self.classes)}")
        return self

    def predict(self, text: str):
        """
        Predict the intent of a query.
        Returns (intent_label: str, confidence: float)
        """
        if self.pipeline is None:
            raise RuntimeError("Model not loaded. Call load() or build() first.")

        probs = self.pipeline.predict_proba([text])[0]
        top_idx = int(np.argmax(probs))
        intent = self.label_encoder.inverse_transform([top_idx])[0]
        confidence = float(probs[top_idx])
        return intent, confidence

    def predict_top_n(self, text: str, n: int = 3):
        """Returns top N intents with confidence scores."""
        probs = self.pipeline.predict_proba([text])[0]
        top_indices = np.argsort(probs)[::-1][:n]
        return [
            {
                "intent": self.label_encoder.inverse_transform([i])[0],
                "confidence": float(probs[i])
            }
            for i in top_indices
        ]
