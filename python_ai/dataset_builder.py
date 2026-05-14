import json
import random

# Generate a large dataset for multi-label intent classification

INTENTS = ["GET_LAGNA", "GET_NAKSHATRA", "GET_TODAY_NAKSHATRA", "EVAL_BUSINESS", "EVAL_TRAVEL", "EVAL_GENERAL_DAY", "FIND_BEST_TIME", "GET_PANCHANG", "UPDATE_PROFILE"]

TIME_WORDS = ["today", "tomorrow", "yesterday", "this weekend", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

# Templates
TEMPLATES = {
    "GET_LAGNA": [
        "what is my lagna",
        "tell me my ascendant",
        "what is my rising sign",
        "compute my lagna",
        "what sign was rising when i was born",
        "my lagnam",
        "calculate ascendant"
    ],
    "GET_NAKSHATRA": [
        "what is my nakshatra",
        "which star was i born in",
        "tell me my birth star",
        "my janma nakshatra",
        "what is my moon sign"
    ],
    "GET_TODAY_NAKSHATRA": [
        "what is the nakshatra today",
        "which star is today",
        "today's nakshatra",
        "what is the moon in right now",
        "current nakshatra"
    ],
    "EVAL_BUSINESS": [
        "is it good to start a business {time}",
        "can i do a business deal {time}",
        "is {time} auspicious for trading",
        "how is business looking {time}",
        "should i sign a contract {time}"
    ],
    "EVAL_TRAVEL": [
        "can i travel {time}",
        "is {time} good for a journey",
        "should i go out {time}",
        "is it safe to travel {time}",
        "travel muhurat {time}"
    ],
    "EVAL_GENERAL_DAY": [
        "how is my day {time}",
        "is {time} a good day",
        "will {time} be lucky for me",
        "general prediction for {time}",
        "what does {time} look like for me"
    ]
}

data = []

for intent, templates in TEMPLATES.items():
    for template in templates:
        if "{time}" in template:
            # Generate one with no time (implicit today)
            text_no_time = template.replace("{time}", "").strip()
            labels = {i: 1 if i == intent else 0 for i in INTENTS}
            data.append({"text": text_no_time, "labels": labels, "time": []})

            # Generate with single time
            for time_word in TIME_WORDS:
                text_single = template.replace("{time}", time_word).strip()
                data.append({"text": text_single, "labels": labels, "time": [time_word]})

            # Generate with compound time
            for _ in range(3):
                t1, t2 = random.sample(TIME_WORDS, 2)
                text_compound = template.replace("{time}", f"{t1} and {t2}").strip()
                data.append({"text": text_compound, "labels": labels, "time": [t1, t2]})
                
                text_compound2 = template.replace("{time}", f"{t1} or {t2}").strip()
                data.append({"text": text_compound2, "labels": labels, "time": [t1, t2]})
        else:
            labels = {i: 1 if i == intent else 0 for i in INTENTS}
            data.append({"text": template, "labels": labels, "time": []})

# Add compound queries (multi-intent)
for _ in range(200):
    i1, i2 = random.sample(["GET_LAGNA", "GET_NAKSHATRA", "EVAL_BUSINESS", "EVAL_TRAVEL", "EVAL_GENERAL_DAY"], 2)
    t1 = random.choice(TEMPLATES[i1])
    t2 = random.choice(TEMPLATES[i2])
    
    time_word = random.choice(TIME_WORDS)
    t1 = t1.replace("{time}", time_word).strip()
    t2 = t2.replace("{time}", time_word).strip()
    
    combined_text = f"{t1} and {t2}"
    labels = {i: 1 if i in [i1, i2] else 0 for i in INTENTS}
    
    # Simple time extraction logic for generation
    extracted_times = [tw for tw in TIME_WORDS if tw in combined_text]
    # Remove subsets like 'sunday' if 'sunday' is matched (handled implicitly by regex in node, but here just raw)
    
    data.append({"text": combined_text, "labels": labels, "time": extracted_times})

random.shuffle(data)

output_data = {
    "intents": INTENTS,
    "training_examples": data
}

with open("model/training_data_distilbert.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2)

print(f"Generated {len(data)} training examples.")
