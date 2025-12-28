import Groq from "groq-sdk";
import { LLM_CONFIG } from "../config/llmConfig.js";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

async function callGroq(model, messages) {
  const client = getGroqClient();

  return client.chat.completions.create({
    model,
    messages,
    temperature: LLM_CONFIG.temperature,
  });
}

export async function generateAnswer(context, question) {
  const messages = [
    {
      role: "system",
      content: `
You are an enterprise knowledge assistant.

STRICT RULES:
- Answer ONLY using the provided context.
- DO NOT infer, estimate, calculate, or assume anything.
- DO NOT use external knowledge.
- If the answer is NOT explicitly stated in the context, respond with:
  "The requested information is not explicitly mentioned in the provided documents."
- Be factual, concise, and precise.
      `.trim(),
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion:\n${question}`,
    },
  ];

  try {
    // 🔹 Primary model attempt
    const response = await callGroq(
      LLM_CONFIG.models.primary,
      messages
    );
    return response.choices[0].message.content;

  } catch (primaryError) {
    console.error("Primary model failed:", primaryError.message);

    // 🔹 Fallback model attempt
    const fallbackResponse = await callGroq(
      LLM_CONFIG.models.fallback,
      messages
    );
    return fallbackResponse.choices[0].message.content;
  }
}
