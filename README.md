# EcoFix: The AI Repair Companion

[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%203-4cc9f0?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Python](https://img.shields.io/badge/Made%20with-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

> **"Don't toss it. Fix it."** > EcoFix is a multimodal AI assistant that turns anyone into a repair technician. Powered by Google's **Gemini 3 Flash**, it diagnoses broken items via live video, voice, and images, calculating real-time **e-waste diversion metrics to gamify sustainability**.

---
## Features

### 1. Multimodal Diagnosis (Gemini 3)
Upload an image or use the **Live Vision Camera** to show EcoFix the problem. The AI analyzes visual data instantly to identify the device and the damage.

### 2. Voice-First Interaction
Hands busy with a screwdriver? No problem. Use the **integrated microphone** to speak to EcoFix naturally. It fuses your voice context ("The fan is making a grinding noise") with the visual data for a precise diagnosis.

### 3. The Impact Engine
EcoFix gamifies sustainability by calculating:
* **E-Waste Diverted:** The actual weight of the device kept out of a landfill (e.g., *0.18 kg* for a smartphone).
* **Wealth Saved:** The estimated difference between the repair cost and buying a new unit.

---
## Technologies

* **AI Model:** Google Gemini 3 Flash Preview (via `google-genai` SDK) [NOTE:run the `check_model.py` script to see available models in your plan.]
* **Backend:** Python, Flask
* **Frontend:** HTML5, CSS3, JavaScript
* **Audio:** Web Speech API (Voice-to-Text)
* **Database:** JSON-based local storage (Session History)

---
## Installation & Setup

### Prerequisites
* Python 3.8+
* A Google Cloud Project with the **Gemini API** enabled.
* [Get a Gemini API Key here](https://aistudio.google.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/PS-003R32/EcoFix.git
cd EcoFix
```
### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```
### Step 3: Configure API Key
Open `app.py` and locate the API Key section. Security Tip: For production, use environment variables. For testing:

```python
# In app.py
API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE"
```
### Step 4: Run the Application
```bash
python app.py
```

### Step 5: Launch
Open your browser and navigate to: 
```text
http://localhost:5000
```
> Watch EcoFix in action [here](https://youtu.be/x3MIHhwZ7Ds?si=8k2XgjgiyIefDwPG)!!
---
## Usage Guide
* **Select Mode:** Choose SCAN (Upload) or VISION (Live Camera).
* **Input Context:** (Optional) Type or use the Microphone button to describe the issue (e.g., "Screen is cracked").
* **Capture/Upload:** Click "Initiate Sequence" or "Capture Light."
* **View Results:**
- See the Diagnosis and Repair Steps.
- Check your Impact Card (E-Waste & Money Saved).
- Read the Safety Warning.
* **Chat:** Use the chat box at the bottom to ask follow-up questions about the repair.
* **Archive:** Visit the ARCHIVE tab to see a history of your past repairs.

---
## License
Distributed under the MIT License.  – see the [LICENSE](LICENSE) file for details.
