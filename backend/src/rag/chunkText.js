// src/rag/chunkText.js
import { detectSection } from "./sectionDetector.js";

export function chunkText(text, chunkSize = 800, overlap = 150) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunkContent = text.slice(start, end);

    chunks.push({
      content: chunkContent.trim(),
      section: detectSection(chunkContent),
    });

    start += chunkSize - overlap;
  }

  return chunks;
}
