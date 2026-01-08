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

CRITICAL ANTI-HALLUCINATION RULES:
- ONLY use information that is explicitly stated in the provided context
- If the context doesn't contain relevant information, clearly state "The requested information is not found in the provided documents"
- NEVER make up facts, procedures, or technical specifications
- NEVER provide information from your general knowledge if it's not in the context
- If you can only partially answer based on the context, clearly indicate what parts are missing

GUIDELINES:
- Use the provided context to answer questions accurately and helpfully
- If the exact answer is in the context, provide it directly
- If related information is available, use it to provide a helpful response while noting limitations
- Be conversational, helpful, and informative
- Cite specific sections or documents when possible
- Always be transparent about the limitations of the available information
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
