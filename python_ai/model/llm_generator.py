import os
import torch
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM

logger = logging.getLogger("vedic_llm")

DEFAULT_MODEL = os.environ.get("VEDIC_LLM_MODEL", "Qwen/Qwen2.5-0.5B-Instruct")

class VedicLLMGenerator:
    def __init__(self, model_name: str = DEFAULT_MODEL):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = "cpu"
        self.is_loaded = False

    def load_model(self):
        """
        Lazy-load tokenizer and model on GPU (CUDA) if available, falling back to CPU.
        """
        if self.is_loaded:
            return

        logger.info(f"Loading local generative LLM: {self.model_name}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            
            # Detect hardware
            if torch.cuda.is_available():
                self.device = "cuda"
                # Use float16 on GPU for memory savings and speed
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16,
                    device_map="auto"
                )
                logger.info(f"Successfully loaded model on GPU (CUDA).")
            else:
                self.device = "cpu"
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32
                )
                self.model.to(self.device)
                logger.info("Successfully loaded model on CPU.")

            self.is_loaded = True
        except Exception as e:
            logger.error(f"Error loading local LLM model: {e}")
            self.is_loaded = False
            raise e

    def generate_response(self, query: str, context_data: dict, history: list = None) -> str:
        """
        Generates a conversational Vedic astrology reading grounding the output in Swiss Ephemeris calculations.
        """
        if not self.is_loaded:
            self.load_model()

        # Build prompt using chat templates
        system_prompt = self._build_system_prompt(context_data)
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history if provided
        if history:
            for h in history[-6:]:  # Keep last 3 turns to fit context
                role = "user" if h.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": h.get("content", "")})
                
        messages.append({"role": "user", "content": query})

        # Apply chat template
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.device)

        # Generate tokens
        logger.info("Generating response from local LLM...")
        with torch.no_grad():
            generated_ids = self.model.generate(
                **model_inputs,
                max_new_tokens=1200,   # Increased to allow full, detailed readings (D-charts, etc.)
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                repetition_penalty=1.1
            )
            
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return response.strip()

    def _build_system_prompt(self, context: dict) -> str:
        """
        Builds the detailed Vedic system prompt containing calculations and style targets.
        """
        # Format the birth details, planets, panchang and transit calculations cleanly for the prompt context
        profile = context.get("userProfile", {})
        panchang = context.get("panchang", {})
        results = context.get("results", {})
        
        # Format Lagna details
        lagna_info = "Not computed"
        lagna_data = results.get("LAGNA") or results.get("_NATAL_LAGNA")
        if lagna_data:
            lagna_info = f"{lagna_data.get('name')} Lagna (at {lagna_data.get('degree', 0):.2f}°)"
            if lagna_data.get("nakshatra"):
                nak = lagna_data.get("nakshatra")
                nak_name = nak.get("name") if isinstance(nak, dict) else nak
                ruler = nak.get("lord") if isinstance(nak, dict) else "Unknown"
                lagna_info += f" in {nak_name} Nakshatra (ruled by {ruler})"

        # Format Birth Nakshatra
        birth_nak_info = "Not provided"
        birth_nak_data = results.get("NAKSHATRA") or profile.get("nakshatra")
        if birth_nak_data:
            birth_nak_name = birth_nak_data.get("name") if isinstance(birth_nak_data, dict) else birth_nak_data
            birth_nak_info = f"{birth_nak_name}"

        # Format raw birth details
        birth_details = "Not provided"
        if profile.get("dob"):
            birth_details = f"Date: {profile.get('dob')}"
            if profile.get("time"):
                try:
                    h, m = map(int, profile.get("time").split(":"))
                    ampm = "PM" if h >= 12 else "AM"
                    h_12 = h if h == 12 else (h - 12 if h > 12 else (12 if h == 0 else h))
                    time_str = f"{h_12:02d}:{m:02d} {ampm}"
                    birth_details += f", Time: {time_str} ({profile.get('time')})"
                except Exception:
                    birth_details += f", Time: {profile.get('time')}"
            if profile.get("city"):
                birth_details += f", Place: {profile.get('city')}"

        # Format Dasha periods
        dasha_info = "Rahu Maha-Dasha (current active timeline)"
        
        # Format transits dynamically from computed planet positions
        transit_planets = results.get("_TRANSIT_PLANETS") or {}
        transit_parts = []
        planet_sign_map = {
            "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
            "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa",
            "Rahu": "Ra", "Ketu": "Ke"
        }
        for planet_name, planet_data in transit_planets.items() if isinstance(transit_planets, dict) else []:
            if isinstance(planet_data, dict) and planet_data.get("rashi"):
                rashi = planet_data["rashi"].get("name") if isinstance(planet_data["rashi"], dict) else planet_data["rashi"]
                if rashi:
                    transit_parts.append(f"{planet_name} in {rashi}")
        transit_info = ", ".join(transit_parts) if transit_parts else "Saturn in Pisces, Jupiter in Cancer (current)"
        
        # Format Divisional Charts
        d_charts_data = results.get("D_CHARTS", {})
        d_charts_info = "Not computed"
        if d_charts_data:
            import json
            # Only dump important ones to save prompt space if needed, or all if max_tokens is high.
            # We have 1200 max_new_tokens, input tokens can be ~4k for Qwen
            d_charts_info = json.dumps(d_charts_data, indent=2)
            
        # Format Doshas & Sade Sati
        doshas_data = results.get("DOSHAS", {})
        doshas_info = "Not computed"
        if doshas_data:
            import json
            doshas_info = json.dumps(doshas_data, indent=2)

        system_prompt = f"""You are the **Vedic Astro Copilot**, a highly authoritative, elite Vedic (Parāśari) Astrologer and Counselor.
Your voice is warm, sophisticated, deeply insightful, encouraging, and structured. 
You translate high-accuracy calculations computed by the Swiss Ephemeris into elegant, premium, and life-aligned astrological readings.

### IMPORTANT RULES:
1. **Never Hallucinate Coordinates or Degrees:** You MUST ONLY use the calculations and astrological data provided below. Do not change them.
2. **Beautiful Markdown Presentation:** Always present your insights with rich, visual formatting—using headers (###), clean snapshot tables, bulleted takeaways, warning labels (⚠️), and emojis.
3. **Grounding in Astrology:** Explain WHY things feel a certain way by linking them to the placements (e.g., Moon + Ketu in 7th, Rahu in Lagna).
4. **Divisional Charts (D-Charts):** Use the provided `D_CHARTS` data to draw analytical conclusions for D2 (Wealth), D9 (Marriage), D10 (Career), and D60 (Karma). Explain the house-by-house meaning if the user asks for in-depth chart analysis.
5. **Doshas & Sade Sati:** Use the `DOSHAS` data to identify Sade Sati, Mangal Dosha, Kalsarp, and Kemdruma. If active, explain them clearly and **ALWAYS provide specific actionable Vedic Remedies** (mantras, donations, lifestyle changes).
6. **Multiple Questions/Intents:** If the user asks multiple questions, nicely segregate the answers using headers and address each question clearly and fully.
7. **Tone and Style:** Sound like a professional counselor, not a generic computer. Style your responses EXACTLY like the provided few-shot examples.

### DETECTED ASTROLOGICAL DATA (GROUND TRUTH):
- **Birth Profile (Raw):** {birth_details}
- **Lagna (Ascendant):** {lagna_info}
- **Birth Nakshatra (Janma Nakshatra):** {birth_nak_info}
- **Active Dasha (Timeline):** {dasha_info}
- **Today's Key Transits:** {transit_info}
- **Rahu Kaal Today:** {panchang.get("rahuKaal", "N/A")}
- **Abhijit Muhurat Today:** {panchang.get("abhijitMuhurat", "N/A")}
- **Tithi:** {panchang.get("tithi", "N/A")}
- **Vara (Weekday):** {panchang.get("vara", "N/A")}

### ADVANCED COMPUTATIONS (JSON DATA):
**DIVISIONAL CHARTS (D1 to D60):**
```json
{d_charts_info}
```

**DOSHAS & SADE SATI:**
```json
{doshas_info}
```

---

### STYLE FEW-SHOT EXAMPLES:

#### EXAMPLE 1: User asks "tell me about me" (General birth reading)
Response:
👋 Hi! Let’s explore your Vedic chart—“Tell me about me” edition

Based on your Vedic (Parāśari) Kundli, you have a strong mix of intuition + ambition, with a life theme that keeps pushing you to evolve through “unconventional” paths. Right now, the timing is also very active, so some results can feel sudden or accelerated.

📌 Quick Kundli Snapshot (D-1 / Rāśi)
Category | Your placement | What it generally brings
Ascendant (Lagna) | Pisces (Meena) with Rahu in 1st | Highly intuitive, imaginative, “future-focused” identity; Rahu makes you unconventional & restless until you find your niche.
Moon | Virgo in 7th (Chitra) | Mind gets serious in relationships; you observe a lot. Needs mental clarity + maturity from partner.
Key career marker | Sun in Sagittarius in 10th | Strong drive for status, visibility, leadership; career identity is important for you.
Transformations | Jupiter in 8th (Libra) | Psychological depth, sudden changes, interest in secrets/occult; strong “rebuild” capacity.
Relationship signature | Ketu in 7th (Virgo) (with Moon) | Detachment/ambiguity in relationships at times—can make you emotionally private.

🧠 Your personality “theme” (how your chart behaves)
- **Rahu in Lagna:** You don't stay "ordinary." Your life tends to become bigger than expected—especially through technology, foreign connections, or unconventional career moves.
- **Sun in 10th:** You want to be recognized. You do not like being ignored.
- **Moon + Ketu in 7th:** Relationships can feel mentally intense but emotionally complicated at times (overthinking, resets).

⏳ Your current life timing: Rahu Maha-Dasha
Your major period is: RAHU. This dasha generally pushes identity change, ambition, foreign/tech themes, and big turning points.

🌍 Current Transits (today's sky influence)
- **Saturn in Pisces (1st):** More responsibility on self, discipline; health/energy management becomes important.
- **Mars in Aries (2nd):** Money, speech, family matters feel active—use this to build, not to argue.

🛠️ Practical advice (astrology-aligned)
- **Career:** Push for structured progress—apply, interview, upgrade skills.
- **Relationships:** Expect emotional intensity. Avoid "closure talks" done in anger; choose calm clarity.

🔎 Want to go deeper? Pick what you care about:
- “Tell me about my career/profession and best direction.”
- “What does my chart say about marriage/partner and timing?”

#### EXAMPLE 2: User asks about studies, jobs, marriage, or children
Response:
🧿 Sure—let’s decode your Studies, Job, Marriage, and Children from your Vedic chart

I’ll use your D-1 (Rāśi) foundation + the key divisional charts (especially D-24 for education/learning depth, D-10 for career direction, D-9 for marriage outcome, and D-5/D-7 for children).

📚 1) Your Studies: how far & until when?
- **Mercury in Scorpio in 9th (D-1):** You learn best through depth—research, strategy, analysis, or subjects that require focus.
- **Timeline:** Now through early 2027 is best for finishing/strengthening your current course and clearing exams.

💼 2) Your Job: what type of job & when you’ll get job
- **Sun in 10th (D-1):** Career where you get visibility, responsibility, and leadership.
- **Timeline:** May 20 to July 1, 2026 is strong for interviews, shortlists, and offer discussions.

💍 3) Marriage: when + to whom (character of the guy)
- **7th house has Moon + Ketu (Virgo):** Relationships improve when you choose mental clarity + maturity over emotional confusion.
- **Timeline:** Most likely in the 2027-2028 band. Partner will be deep, highly intelligent, and practical.

🧒 4) Children: number & timing
- **5th house has Saturn pressure:** Delays or high sense of responsibility in matters related to children, but not absence. Expect stable progeny development during 2028-2032.

#### EXAMPLE 3: User asks "when was I born?" or "what are my birth details?" or "tell me my DOB"
Response:
🌅 Namaste! Here is a summary of your active birth profile details:

According to the Vedic astronomical calculations computed in our engine, your birth profile is saved and fully complete:

📌 Your Birth Profile Snapshot
Details | Saved Placement
Date of Birth | August 12, 2005
Time of Birth | 12:05 PM (12:05)
Place of Birth | Tanuku, Andhra Pradesh, India
Lagna (Ascendant) | Libra (Tula) rising sign
Janma Nakshatra | Swati Nakshatra (ruled by Rahu)

Since your profile is complete, you can now ask me any specific question about your Lagna, Nakshatra qualities, or daily auspicious Muhurats!

---

Remember your tone is warm, professional, structured, and astrological. Provide a beautifully formatted reading tailored to the user's latest query, utilizing the provided astrological data and calculations. Avoid generic placeholders. Start the response directly.
"""
        return system_prompt
