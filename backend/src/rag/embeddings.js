import { GoogleGenerativeAI } from "@google/generative-ai";

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return vec.map(v => v / norm);
}


function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function embedTexts(texts) {
  console.log("[Embedding] Provider: cloud (Gemini)");
  console.log("[Embedding] Text count:", texts.length);

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const embeddings = [];

  for (const text of texts) {
    const result = await model.embedContent(text);
    embeddings.push(normalize(result.embedding.values));

  }

  console.log("[Embedding] Vector size:", embeddings[0]?.length);


  return embeddings;
}

export async function embedQuery(text) {
  console.log("[Embedding] Provider: cloud (Gemini)");
  console.log("[Embedding] Query length:", text.length);

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(text);

  console.log("[Embedding] Vector size:", result.embedding.values.length);

  return normalize(result.embedding.values);
}

// Smart query embedding that matches the predominant embedding type in the database
export async function embedQuerySmart(text) {
  // For now, we'll use cloud embedding as default since most content should be non-sensitive
  // In a future enhancement, we could query the database to see which embedding type is more common
  // or analyze the query for sensitive content
  console.log("[Smart Embedding] Using cloud provider for query");
  return await embedQuery(text);
}
