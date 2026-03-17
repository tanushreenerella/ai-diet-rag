import sys, os
from dotenv import load_dotenv
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# load .env file
load_dotenv()

import streamlit as st
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from google import genai

from visualization.charts import create_chart

# read key from environment
GEMINI_KEY = os.getenv("GEMINI_KEY")

client = genai.Client(api_key=GEMINI_KEY)
print("Loaded key:", GEMINI_KEY)  # temporary debug

# Add your Gemini API key here


# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Load vector database
index = faiss.read_index("vector_db/index.faiss")
texts = np.load("vector_db/texts.npy", allow_pickle=True)

st.title("AI Diet Assistant")

query = st.text_input("Ask a nutrition or diet question")

if st.button("Get Advice"):

    # Convert query to embedding
    query_embedding = embedding_model.encode([query])

    # Vector search
    D, I = index.search(query_embedding, 3)

    context = ""
    results = []

    for idx in I[0]:
        context += texts[idx]
        results.append(texts[idx])

    prompt = f"""
You are a helpful nutrition assistant.

User question:
{query}

Relevant nutrition information:
{context}

Give helpful diet advice based on this information.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    st.subheader("AI Advice")
    st.write(response.text)

    st.subheader("Retrieved Knowledge")

    for r in results:
        st.write(r)

    values = [len(r) for r in results]

    fig = create_chart(values)

    st.subheader("Visualization")
    st.pyplot(fig)