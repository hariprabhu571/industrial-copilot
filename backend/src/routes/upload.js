import express from "express";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { chunkText } from "../rag/chunkText.js";
import {
  saveDocument,
  saveChunksWithEmbeddings
} from "../rag/vectorStore.postgres.js";

import { preprocessText } from "../nlp/preprocessText.js";
import { embedChunks } from "../rag/embeddingRouter.js";
import { authenticate } from "../auth/authMiddleware.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// Updated function to require admin role via JWT
function requireAdminRole(req, res, next) {
  // Check if user is authenticated (should be done by authenticate middleware)
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: "Admin role required to upload documents. Only administrators can upload documents.",
    });
  }

  next();
}

// Legacy admin key support for backward compatibility (optional)
function requireAdminKey(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({
      error: "Admin API key required for upload",
    });
  }

  next();
}




// Primary route: JWT-based authentication (admin role required)
router.post(
  "/",
  authenticate,
  requireAdminRole,
  upload.single("file"),
  async (req, res) => {

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // 1️⃣ Parse PDF or handle text files for testing
      let fullText = "";
      
      if (req.file.mimetype === 'application/pdf') {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(req.file.buffer),
        });

        const pdf = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          fullText += strings.join(" ") + "\n";
        }
      } else {
        // Handle text files for testing
        fullText = req.file.buffer.toString('utf-8');
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
      } = req.body;

      // Use authenticated user info
      const uploaded_by = req.user.username || "system";

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
        uploadedBy: uploaded_by,
        message: "Document parsed, chunked, embedded, and stored persistently",
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
});

// Legacy route: Admin API key support (for backward compatibility and testing)
router.post(
  "/legacy",
  requireAdminKey,
  upload.single("file"),
  async (req, res) => {

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Same processing logic as main route
      let fullText = "";
      
      if (req.file.mimetype === 'application/pdf') {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(req.file.buffer),
        });

        const pdf = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          fullText += strings.join(" ") + "\n";
        }
      } else {
        // Handle text files for testing
        fullText = req.file.buffer.toString('utf-8');
      }

      const preprocessedChunks = await preprocessText(fullText);
      const cleanText = preprocessedChunks.map(p => p.content).join("\n");
      const chunks = chunkText(cleanText);

      const chunksWithMetadata = chunks.map((chunk, index) => {
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

      const embeddingsWithProviders = await embedChunks(chunksWithMetadata);

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

      await saveChunksWithEmbeddings(
        documentId,
        chunksWithMetadata,
        embeddingsWithProviders
      );

      res.json({
        documentId,
        characters: fullText.length,
        chunks: chunksWithMetadata.length,
        uploadedBy: uploaded_by,
        message: "Document parsed, chunked, embedded, and stored persistently (legacy API key)",
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
});

export default router;
