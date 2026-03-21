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

        D, I = index.search(query_embedding, 3)

        context = ""
        for idx in I[0]:
            context += texts[idx] + "\n"

        prompt = f"""
You are a professional AI diet assistant.

User Profile:
- Age: {req.user_data.get('age')}
- Weight: {req.user_data.get('weight')} kg
- Height: {req.user_data.get('height')} cm
- Goal: {req.user_data.get('goal')}
- Dietary Preference: {req.user_data.get('dietary_preference')}
- Activity Level: {req.user_data.get('activity_level')}

Question:
{req.query}

Context:
{context}

Give a helpful personalized answer.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        reply = response.candidates[0].content.parts[0].text

        return {"reply": reply}

    except Exception as e:
        print("🔥 ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))