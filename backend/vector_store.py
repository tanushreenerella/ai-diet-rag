from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# your data
documents = [
    "Protein helps muscle growth and recovery.",
    "Eggs are a rich source of high-quality protein.",
    "Paneer is a good vegetarian protein source.",
    "Lentils contain protein and fiber.",
    "Oats provide slow-releasing carbohydrates for energy.",
    "Vegetables contain vitamins and minerals.",
    "Fruits provide fiber and antioxidants.",
    "Brown rice contains complex carbohydrates.",
    "Healthy fats come from nuts and seeds.",
    "A balanced diet includes protein, carbs, and fats.",
    "Drinking enough water supports metabolism.",
    "Leafy greens provide iron and calcium.",
    "Greek yogurt is high in protein.",
    "Chicken breast is a lean protein source.",
    "Fish contains omega-3 fatty acids."
]

# load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# convert to vectors
embeddings = model.encode(documents)

# create FAISS index
index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(np.array(embeddings))
def search(query, k=3):
    query_vector = model.encode([query])
    distances, indices = index.search(np.array(query_vector), k)

    results = [documents[i] for i in indices[0]]
    return results