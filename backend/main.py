# backend/main.py (updated to handle user profile)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from google import genai
from typing import Optional

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
index = faiss.read_index(os.path.join(BASE_DIR, "vector_db/index.faiss"))
texts = np.load(os.path.join(BASE_DIR, "vector_db/texts.npy"), allow_pickle=True)
client = genai.Client(api_key=os.getenv("GEMINI_KEY"))

class ChatRequest(BaseModel):
    query: str
    user_data: dict

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        print("Incoming request:", req)
        print("✅ CHAT HIT")

        query_embedding = np.array(
            embedding_model.encode([req.query])
        ).astype("float32")

        k = 5
        D, I = index.search(query_embedding, k)

        context_list = [texts[idx] for idx in I[0]]
        context = "\n".join(context_list)

        prompt = f"""
You are a friendly AI diet assistant.

STRICT RULES:
- DO NOT use markdown formatting
- DO NOT use ** or * or any symbols for formatting
- Return plain text only
- Do NOT bold anything
- Do NOT use bullet points unless absolutely necessary

Style:
- Natural, conversational
- Simple English
- Short to medium answers
- Sound like talking to a friend

User Profile:
Age: {req.user_data.get('age')}
Weight: {req.user_data.get('weight')} kg
Height: {req.user_data.get('height')} cm
Goal: {req.user_data.get('goal')}
Diet: {req.user_data.get('dietary_preference')}
Activity: {req.user_data.get('activity_level')}

Context:
{context}

User Question:
{req.query}

Now respond in plain text only, with zero formatting.
"""

        # ✅ NOW INSIDE TRY
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        # ✅ SAFE EXTRACTION
        if hasattr(response, "text") and response.text:
            reply = response.text
        else:
            print("⚠️ Empty or invalid response:", response)
            reply = "Hmm, I couldn't come up with a good answer. Try again?"

        return {"reply": reply}

    except Exception as e:
        print("🔥 ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/generate-meal-plan")
async def generate_meal_plan(req: ChatRequest):
    try:
        query_embedding = np.array(
            embedding_model.encode(["healthy meal plan"])
        ).astype("float32")

        D, I = index.search(query_embedding, 5)
        context = "\n".join([texts[idx] for idx in I[0]])

        prompt = f"""
You are a friendly AI diet assistant chatting with a user.

IMPORTANT STYLE RULES:
- Talk like a real person (casual, friendly tone)
- No markdown formatting (no ** or *)
- No fancy formatting
- Keep it conversational
- Keep structure simple (Breakfast, Lunch, Dinner, Snacks)
- Do NOT over-format
- Keep it natural like chat, not like a report

User:
Age: {req.user_data.get('age')}
Weight: {req.user_data.get('weight')}
Goal: {req.user_data.get('goal')}
Diet: {req.user_data.get('dietary_preference')}

Context:
{context}

User asked for a meal plan.

Reply like this example style (IMPORTANT):

"Alright, here’s a simple plan you can follow today:

Breakfast: Oatmeal with fruits and some nuts.

Lunch: Paneer with roti and vegetables.

Dinner: Dal with rice and a side of salad.

Snacks: Fruits or a handful of nuts between meals.

Let me know if you want a veg-only or high-protein version!"

Now generate a response in this same tone and format.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {"meal_plan": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/visualize-bmi")
async def visualize_bmi(req: ChatRequest):
    try:
        weight = req.user_data.get("weight")
        height_cm = req.user_data.get("height")

        height_m = height_cm / 100
        bmi = weight / (height_m ** 2)

        if bmi < 18.5:
            category = "Underweight"
        elif bmi < 25:
            category = "Normal"
        elif bmi < 30:
            category = "Overweight"
        else:
            category = "Obese"

        return {
            "bmi": round(bmi, 2),
            "category": category
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/visualize-bmi")
async def visualize_bmi(req: ChatRequest):
    try:
        weight = req.user_data.get("weight")
        height_cm = req.user_data.get("height")

        height_m = height_cm / 100
        bmi = weight / (height_m ** 2)

        if bmi < 18.5:
            category = "Underweight"
        elif bmi < 25:
            category = "Normal"
        elif bmi < 30:
            category = "Overweight"
        else:
            category = "Obese"

        return {
            "bmi": round(bmi, 2),
            "category": category
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
@app.post("/visualize-macros")
async def visualize_macros(req: ChatRequest):
    try:
        meal_text = req.query.lower()

        protein = meal_text.count("paneer") + meal_text.count("chicken") + meal_text.count("egg")
        carbs = meal_text.count("rice") + meal_text.count("roti") + meal_text.count("oats")
        fats = meal_text.count("nuts") + meal_text.count("seeds")

        return {
            "protein": protein + 1,
            "carbs": carbs + 1,
            "fats": fats + 1
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))