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
# Step system
if "step" not in st.session_state:
    st.session_state.step = 1

if "user_data" not in st.session_state:
    st.session_state.user_data = {}
st.selectbox("Goal", ["Muscle Gain", "Weight Loss", "Maintain"])
st.title("🥗 AI Diet Assistant")

# ---------- STEP 1 ----------
if st.session_state.step == 1:
    st.subheader("Let's start with the basics")

    name = st.text_input("What's your name?")
    age = st.number_input("How old are you?", 10, 80)
    gender = st.radio("Gender", ["Male", "Female", "Other"])

    if st.button("Next"):
        st.session_state.user_data.update({
            "name": name,
            "age": age,
            "gender": gender
        })
        st.session_state.step = 2
        st.rerun()

# ---------- STEP 2 ----------
elif st.session_state.step == 2:
    st.subheader("Your physical stats")

    height = st.number_input("Height (cm)", 100, 220)
    weight = st.number_input("Weight (kg)", 30, 150)

    col1, col2 = st.columns(2)

    with col1:
        if st.button("Back"):
            st.session_state.step = 1
            st.rerun()

    with col2:
        if st.button("Next"):
            st.session_state.user_data.update({
                "height": height,
                "weight": weight
            })
            st.session_state.step = 3
            st.rerun()

# ---------- STEP 3 ----------
elif st.session_state.step == 3:
    st.subheader("How active are you?")

    activity = st.radio("", [
        "Sedentary",
        "Lightly Active",
        "Moderately Active",
        "Very Active"
    ])

    if st.button("Next"):
        st.session_state.user_data["activity"] = activity
        st.session_state.step = 4
        st.rerun()

# ---------- STEP 4 ----------
elif st.session_state.step == 4:
    st.subheader("What's your goal?")

    goal = st.radio("", [
        "Lose Weight",
        "Maintain Weight",
        "Gain Muscle"
    ])

    meals = st.radio("Meals per day", ["2", "3", "4", "5+"])

    if st.button("Next"):
        st.session_state.user_data.update({
            "goal": goal,
            "meals": meals
        })
        st.session_state.step = 5
        st.rerun()

# ---------- STEP 5 ----------
elif st.session_state.step == 5:
    st.subheader("Final details")

    diet = st.text_area("Diet preferences")
    health = st.text_area("Health conditions")

    if st.button("Start AI Assistant 🚀"):
        st.session_state.user_data.update({
            "diet": diet,
            "health": health
        })
        st.session_state.step = 6
        st.rerun()

# ---------- CHATBOT ----------
elif st.session_state.step == 6:

    st.subheader("💬 Your AI Diet Assistant")

    user_data = st.session_state.user_data

    # Chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Show history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    query = st.chat_input("Ask your diet question...")

    if query:
        st.session_state.messages.append({"role": "user", "content": query})

        with st.chat_message("user"):
            st.markdown(query)

        # RAG
        query_embedding = embedding_model.encode([query])
        D, I = index.search(query_embedding, 3)

        context = ""
        results = []

        for idx in I[0]:
            context += texts[idx]
            results.append(texts[idx])

        # PERSONALIZED PROMPT
        prompt = f"""
User Profile:
Name: {user_data.get("name")}
Age: {user_data.get("age")}
Gender: {user_data.get("gender")}
Height: {user_data.get("height")}
Weight: {user_data.get("weight")}
Activity: {user_data.get("activity")}
Goal: {user_data.get("goal")}
Meals: {user_data.get("meals")}
Diet: {user_data.get("diet")}
Health: {user_data.get("health")}

User Question:
{query}

Context:
{context}

Give a personalized diet answer.
"""

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )

                reply = response.text
                st.markdown(reply)

                st.session_state.messages.append({
                    "role": "assistant",
                    "content": reply
                })

                # Visualization
                st.subheader("📊 Nutrition Insight")

                import matplotlib.pyplot as plt
                fig = plt.figure()
                plt.bar(["Protein", "Carbs", "Fats"], [30, 50, 20])
                plt.title("Macronutrient Distribution")

                st.pyplot(fig)