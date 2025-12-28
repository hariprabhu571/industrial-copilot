export const LLM_CONFIG = {
  provider: process.env.CHAT_PROVIDER || "groq",

  models: {
    primary: process.env.LLM_PRIMARY_MODEL || "llama-3.1-8b-instant",
    fallback: process.env.LLM_FALLBACK_MODEL || "llama-3.1-70b-versatile",
  },

  temperature: 0.0,
};
