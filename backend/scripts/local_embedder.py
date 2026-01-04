import sys
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

payload = json.loads(sys.stdin.read())
texts = payload["texts"]

embeddings = model.encode(texts, normalize_embeddings=True)

print(json.dumps(embeddings.tolist()))
