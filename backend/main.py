# backend/main.py (updated to handle user profile)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotense
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
    allow_origins=["http://localhost:3000"],
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
        # Generate embedding for query
        query_embedding = embedding_model.encode([req.query])
        D, I = index.search(query_embedding, 3)

        # Build context from retrieved texts
        context = ""
        for idx in I[0]:
            context += texts[idx] + "\n"

        # Enhanced prompt with user profile
        prompt = f"""
You are a professional AI diet assistant. Use the provided context and user profile to give personalized advice.

User Profile:
- Age: {req.user_data.get('age', 'Not specified')}
- Weight: {req.user_data.get('weight', 'Not specified')} kg
- Height: {req.user_data.get('height', 'Not specified')} cm
- Goal: {req.user_data.get('goal', 'Not specified')}
- Dietary Preference: {req.user_data.get('dietary_preference', 'None')}
- Activity Level: {req.user_data.get('activity_level', 'Not specified')}

User Question:
{req.query}

Relevant Nutrition Information:
{context}

Provide a personalized, helpful, and encouraging response. Include specific recommendations based on their profile.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {"reply": response.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}