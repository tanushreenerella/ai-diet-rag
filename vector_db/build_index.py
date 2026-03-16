from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Read dataset
with open("data/nutrition.txt", "r") as f:
    texts = f.readlines()

# Generate embeddings
embeddings = model.encode(texts)

dimension = embeddings.shape[1]

# Create FAISS index
index = faiss.IndexFlatL2(dimension)

index.add(np.array(embeddings))

# Save index
faiss.write_index(index, "vector_db/index.faiss")

# Save original texts
np.save("vector_db/texts.npy", texts)

print("Vector database created successfully")