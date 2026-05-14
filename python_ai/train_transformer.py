import json
import os
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from transformers import Trainer, TrainingArguments
from datasets import Dataset

DATA_PATH = os.path.join(os.path.dirname(__file__), "model", "training_data_distilbert.json")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model", "distilbert_saved")

def load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    intents = data["intents"]
    examples = data["training_examples"]
    
    texts = [e["text"] for e in examples]
    labels_matrix = []
    
    for e in examples:
        # e["labels"] is a dict {"GET_LAGNA": 1, ...}
        # convert to list of floats
        row = [float(e["labels"][i]) for i in intents]
        labels_matrix.append(row)
        
    return texts, labels_matrix, intents

def train():
    print("Loading dataset...")
    texts, labels_matrix, intents = load_data()
    num_labels = len(intents)
    
    print(f"Loaded {len(texts)} examples for {num_labels} intents.")
    
    model_name = "distilbert-base-uncased"
    tokenizer = DistilBertTokenizer.from_pretrained(model_name)
    
    print("Tokenizing...")
    encodings = tokenizer(texts, truncation=True, padding=True, max_length=64)
    
    # Create huggingface dataset
    dataset = Dataset.from_dict({
        'input_ids': encodings['input_ids'],
        'attention_mask': encodings['attention_mask'],
        'labels': labels_matrix
    })
    
    # Split into train and eval (optional, doing train only for now)
    split_ds = dataset.train_test_split(test_size=0.1)
    train_ds = split_ds['train']
    eval_ds = split_ds['test']
    
    print("Initializing model...")
    model = DistilBertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=num_labels,
        problem_type="multi_label_classification",
        id2label={i: lbl for i, lbl in enumerate(intents)},
        label2id={lbl: i for i, lbl in enumerate(intents)}
    )
    
    training_args = TrainingArguments(
        output_dir="./results",
        per_device_train_batch_size=16,
        num_train_epochs=5,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_dir="./logs",
        load_best_model_at_end=True
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds
    )
    
    print("Starting training...")
    trainer.train()
    
    print(f"Saving model to {MODEL_DIR}...")
    model.save_pretrained(MODEL_DIR)
    tokenizer.save_pretrained(MODEL_DIR)
    
    # Save intents list
    with open(os.path.join(MODEL_DIR, "intents.json"), "w") as f:
        json.dump(intents, f)
        
    print("Training complete! Model ready for use.")

if __name__ == "__main__":
    train()
