import sys, os
from dotenv import load_dotenv
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load environment variables
load_dotenv()

import streamlit as st
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from google import genai
from visualization.charts import create_chart

# Configure page
st.set_page_config(page_title="AI Diet Assistant", page_icon="🥗", layout="wide")

# Load API key
GEMINI_KEY = os.getenv("GEMINI_KEY")
client = genai.Client(api_key=GEMINI_KEY)

# Load models (only once)
@st.cache_resource
def load_models():
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    index = faiss.read_index("vector_db/index.faiss")
    texts = np.load("vector_db/texts.npy", allow_pickle=True)
    return embedding_model, index, texts

embedding_model, index, texts = load_models()

# Sidebar (USER PROFILE)
with st.sidebar:
    st.header("👤 User Profile")
    age = st.number_input("Age", 10, 80, 20)
    weight = st.number_input("Weight (kg)", 30, 120, 60)
    goal = st.selectbox("Goal", ["Muscle Gain", "Weight Loss", "Maintain"])

st.title("🥗 AI Diet Assistant")
st.caption("Ask anything about diet, nutrition, or fitness")

# Chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display old messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input
query = st.chat_input("Ask your diet question...")

if query:
    # Show user message
    st.session_state.messages.append({"role": "user", "content": query})
    with st.chat_message("user"):
        st.markdown(query)

    # --- RAG PIPELINE ---
    query_embedding = embedding_model.encode([query])
    D, I = index.search(query_embedding, 3)

    context = ""
    results = []

    for idx in I[0]:
        context += texts[idx]
        results.append(texts[idx])

    # Better prompt (structured output)
    prompt = f"""
You are a professional diet assistant.

User Details:
Age: {age}
Weight: {weight}
Goal: {goal}

User Question:
{query}

Nutrition Knowledge:
{context}

Generate a structured diet plan:

Breakfast:
Lunch:
Dinner:
Snacks:
Tips:
"""

    # Generate response
    with st.chat_message("assistant"):
        with st.spinner("Generating diet plan..."):
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            ai_response = response.text

            st.markdown(ai_response)

            # Save message
            st.session_state.messages.append(
                {"role": "assistant", "content": ai_response}
            )

            # Visualization
            st.subheader("📊 Nutrition Insight")

            # Better dummy data (more realistic)
            labels = ["Protein", "Carbs", "Fats"]
            values = [30, 50, 20]

            import matplotlib.pyplot as plt
            fig = plt.figure()
            plt.bar(labels, values)
            plt.title("Macronutrient Distribution")

            st.pyplot(fig)