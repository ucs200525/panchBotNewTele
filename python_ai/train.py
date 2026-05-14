"""
Training Script — Run once to build intent_model.pkl
Usage: python train.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from model.intent_classifier import IntentClassifier

DATA_PATH = os.path.join(os.path.dirname(__file__), "model", "training_data.json")


def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    examples = data["training_examples"]
    texts = [e["text"] for e in examples]
    labels = [e["intent"] for e in examples]
    print(f"[Train] Loaded {len(texts)} examples across {len(set(labels))} intents.")
    return texts, labels


def evaluate(classifier, texts, labels):
    """Simple in-sample accuracy check."""
    correct = 0
    for text, true_label in zip(texts, labels):
        pred, conf = classifier.predict(text)
        if pred == true_label:
            correct += 1
    acc = correct / len(texts) * 100
    print(f"[Train] In-sample accuracy: {acc:.1f}% ({correct}/{len(texts)})")
    return acc


if __name__ == "__main__":
    print("=" * 50)
    print(" Vedic AI — Intent Classifier Training ")
    print("=" * 50)

    texts, labels = load_data()

    clf = IntentClassifier()
    clf.build(texts, labels)

    acc = evaluate(clf, texts, labels)
    if acc < 80:
        print("[WARN] Accuracy below 80%. Consider adding more training examples.")

    clf.save()
    print("[Done] Model saved. Start Python service: uvicorn app:app --port 8001 --reload")
