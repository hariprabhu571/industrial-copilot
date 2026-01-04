// src/nlp/noiseFilter.js

const NOISE_PATTERNS = [
    /^page \d+/i,
    /confidential/i,
    /copyright/i,
    /all rights reserved/i,
    /table of contents/i,
  ];
  
  export function filterNoise(sentences) {
    return sentences.filter(sentence =>
      !NOISE_PATTERNS.some(pattern => pattern.test(sentence))
    );
  }
  