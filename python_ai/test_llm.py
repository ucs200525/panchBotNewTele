import os
import sys
import time
import logging

logging.basicConfig(level=logging.INFO)
sys.path.append(os.path.dirname(__file__))

from model.llm_generator import VedicLLMGenerator

def test_local_llm():
    print("Starting Local LLM Verification...")
    
    # Initialize the generator
    # We use Qwen2.5-0.5B-Instruct which is extremely fast and lightweight
    generator = VedicLLMGenerator()
    
    # 1. Test Model Loading
    start_load = time.time()
    generator.load_model()
    load_time = time.time() - start_load
    print(f"Model loaded successfully on {generator.device.upper()} in {load_time:.2f} seconds.")
    
    # 2. Construct mock Swiss Ephemeris calculations context
    mock_context = {
        "userProfile": {
            "dob": "2004-08-12",
            "time": "10:30",
            "city": "Hyderabad",
            "nakshatra": "Chitra",
            "rashi": "Virgo"
        },
        "panchang": {
            "tithi": "Dwitiya",
            "vara": "Thursday",
            "rahuKaal": "13:30 - 15:00",
            "abhijitMuhurat": "11:50 - 12:40"
        },
        "results": {
            "LAGNA": {
                "name": "Pisces",
                "degree": 14.56,
                "nakshatra": {
                    "name": "Uttara Bhadrapada",
                    "lord": "Saturn"
                }
            },
            "NAKSHATRA": {
                "name": "Chitra"
            }
        }
    }
    
    # 3. Test generation for "tell me about me" query
    query = "tell me about me"
    print(f"\nSending Query: '{query}'")
    
    start_gen = time.time()
    response = generator.generate_response(query, mock_context)
    gen_time = time.time() - start_gen
    
    print("\nWriting generated response to test_output_llm.txt with UTF-8 encoding...")
    with open("test_output_llm.txt", "w", encoding="utf-8") as f:
        f.write(response)
    print("Generation complete and successfully saved to test_output_llm.txt.")
    print(f"Generation complete in {gen_time:.2f} seconds.")

if __name__ == "__main__":
    test_local_llm()
