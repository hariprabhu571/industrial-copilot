import express from "express";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { chunkText } from "../rag/chunkText.js";
import { embedTexts } from "../rag/embeddings.js";
import {
  saveDocument,
  saveChunksWithEmbeddings
} from "../rag/vectorStore.postgres.js";

import { preprocessText } from "../nlp/preprocessText.js";
import { embedChunks } from "../rag/embeddingRouter.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


function requireAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({
      error: "Admin privileges required to upload documents",
    });
  }

  next();
}




router.post(
  "/",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // 1️⃣ Parse PDF
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(req.file.buffer),
      });

      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(" ") + "\n";
      }

      // 2️⃣ Chunk text
      // 2️⃣ Phase 15.1 – Local NLP preprocessing (SECURITY LAYER)
      const preprocessedChunks = await preprocessText(fullText);

      console.log(
        "Phase 15.2 sample:",
        preprocessedChunks.slice(0, 3)
      );

/*
preprocessedChunks structure (example):
[
  { content: "Sanitized sentence...", section: "policy" },
  { content: "Another safe sentence...", section: "procedure" }
]
*/

// Convert back to text for chunking (no PII now)
const cleanText = preprocessedChunks
  .map(p => p.content)
  .join("\n");

// 3️⃣ Chunk text (existing logic, unchanged)
const chunks = chunkText(cleanText);

// 4️⃣ Preserve metadata from preprocessing - map PII flags to chunks
// We need to map the preprocessed metadata to the chunks
const chunksWithMetadata = chunks.map((chunk, index) => {
  // Find which preprocessed chunks contributed to this chunk
  // For simplicity, we'll mark a chunk as PII-masked if any of its content came from PII-masked preprocessing
  const hasPiiContent = preprocessedChunks.some(p => 
    p.pii_masked && chunk.content.includes(p.content.substring(0, 50))
  );
  
  return {
    ...chunk,
    metadata: {
      pii_masked: hasPiiContent,
      chunk_index: index
    }
  };
});


      // 3️⃣ Embed chunks (Gemini)
      const embeddingsWithProviders = await embedChunks(chunksWithMetadata);


  // 4️⃣ Save document metadata (enterprise-aware)
      const {
        department = "general",
        doc_type = "general",
        version = "v1.0",
        status = "active",
        uploaded_by = "system",
      } = req.body;

      const documentId = await saveDocument({
        name: req.file.originalname,
        source: "uploaded-pdf",
        department,
        doc_type,
        version,
        status,
        uploaded_by,
      });


      // 5️⃣ Save chunks + embeddings (Postgres)
      await saveChunksWithEmbeddings(
        documentId,
        chunksWithMetadata,
        embeddingsWithProviders
      );

      // 6️⃣ Response
      res.json({
        documentId,
        characters: fullText.length,
        chunks: chunksWithMetadata.length,
        message: "Document parsed, chunked, embedded, and stored persistently",
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
});

export default router;
