import os
import json
import logging
import time
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

from google import genai
from google.genai import types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
HISTORY_FILE = 'history.json'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# PASTE YOUR API KEY HERE
API_KEY = "apikey"

try:
    client = genai.Client(api_key=API_KEY)
    logger.info("Gemini 3 Client Connected")
except Exception as e:
    logger.error(f"Client Failed: {e}")
    client = None

MODEL_NAME = "gemini-3-flash-preview"

if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, 'w') as f:
        json.dump([], f)

SYSTEM_PROMPT = """
You are EcoFix, an expert AI Repair Engineer.
1. IDENTIFY: Object name.
2. DIAGNOSE: Specific fault.
3. ACTION: 3 repair steps.
4. SAFETY: Critical warning.
5. IMPACT CALCULATION:
   - Money Saved: Estimate replacement cost vs repair cost (e.g. "$400").
   - E-Waste Saved: Estimate the physical weight of the device that is kept out of a landfill (e.g. "0.18 kg" for a phone, "2.5 kg" for a laptop).

FORMAT JSON:
{
  "device_name": "...",
  "diagnosis": "...",
  "steps": ["..."],
  "safety": "...",
  "impact": { "money_saved": "...", "ewaste_saved": "..." }
}
"""

CHAT_PROMPT = """
You are EcoFix. The user is asking a follow-up question about the broken device.
Answer directly, concisely, and helpfully. Plain text only.
"""

def save_to_history(data, filename):
    record = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "image": filename,
        "data": data
    }
    try:
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        else: history = []
    except: history = []
    
    history.insert(0, record)
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/history')
def get_history():
    try:
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, 'r') as f:
                return jsonify(json.load(f))
    except: pass
    return jsonify([])

@app.route('/analyze', methods=['POST'])
def analyze():
    if not client: return jsonify({'error': 'API Client missing'}), 500
    if 'image' not in request.files: return jsonify({'error': 'No image'}), 400
    
    file = request.files['image']
    user_problem = request.form.get('problem', '')

    try:
        filename = f"repair_{int(time.time())}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
            
        image = Image.open(filepath)
        full_prompt = f"{SYSTEM_PROMPT}\n\nUSER PROBLEM: {user_problem}"
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[full_prompt, image],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        result_json = json.loads(response.text)
        save_to_history(result_json, filename)
        
        return jsonify({'result': response.text, 'filename': filename})

    except Exception as e:
        logger.error(f"Analyze Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    filename = data.get('filename')
    
    if not message or not filename: return jsonify({'error': 'Missing data'}), 400
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath): return jsonify({'error': 'Image lost.'}), 404
        
    try:
        image = Image.open(filepath)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[CHAT_PROMPT, "User Question: " + message, image]
        )
        return jsonify({'reply': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
