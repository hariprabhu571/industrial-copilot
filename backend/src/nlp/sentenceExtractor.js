// src/nlp/sentenceExtractor.js

/**
 * Deterministic sentence segmentation
 * No NLP model yet – safe, fast, predictable
 */
export function extractSentences(text) {
    if (!text) return [];
  
    return text
      .split(/(?<=[.?!])\s+/)   // split on sentence boundaries
      .map(s => s.trim())
      .filter(s => s.length > 20); // ignore junk
  }
  