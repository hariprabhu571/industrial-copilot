const store = [];

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export function addDocuments(documents, embeddings) {
  documents.forEach((doc, i) => {
    store.push({
      embedding: embeddings[i],
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    });
  });
}

export function similaritySearch(queryEmbedding, k = 4) {
  return store
    .map(item => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function storeSize() {
  return store.length;
}
