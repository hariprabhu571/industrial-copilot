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
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const embeddings = [];

  for (const text of texts) {
    const result = await model.embedContent(text);
    embeddings.push(normalize(result.embedding.values));

  }

  return embeddings;
}

export async function embedQuery(text) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(text);
  return normalize(result.embedding.values);
}
