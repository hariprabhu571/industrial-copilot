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
You are an enterprise knowledge assistant helping users find information from uploaded documents.

GUIDELINES:
- Use the provided context to answer questions accurately and helpfully.
- If the exact answer is in the context, provide it directly.
- If related information is available, use it to provide a helpful response.
- If you can reasonably infer an answer from the context, do so while noting it's based on the available information.
- Only say information is "not found" if there's truly no relevant content in the context.
- Be conversational, helpful, and informative.
- Cite specific sections or documents when possible.
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
