# run this script to check which models are available in your plan for the API key.

from google import genai
client = genai.Client(api_key="pasteYourAPIkeyHere")
print("Listing available models...")
for m in client.models.list(config={"page_size": 100}):
    if "generateContent" in m.supported_actions:
        print(f"- {m.name}")
