import express from "express";
import { embedQuery } from "../rag/embeddings.js";
import { similaritySearch } from "../rag/vectorStore.postgres.js";
import { generateAnswer } from "../rag/chatCompletion.js";
import { detectSectionWeights } from "../rag/questionSectionDetector.js";
import { saveAuditLog } from "../db/auditLogs.js";



const MIN_RESULTS = 2;
const MIN_SCORE = 0.55;
const MIN_CONTEXT_CHARS = 300;


const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1️⃣ Detect preferred section FROM QUESTION
const sectionWeights = detectSectionWeights(question);
console.log("Section weights:", sectionWeights);


    // 2️⃣ Embed query
    const queryEmbedding = await embedQuery(question);

    // 3️⃣ Vector similarity search WITH section bias

const results = await similaritySearch(
  queryEmbedding,
  4,
  sectionWeights
);

// 🚫 Not enough results
if (!results || results.length < MIN_RESULTS) {
  return res.json({
    answer: "The requested information is not found in the provided documents.",
    retrieval: [],
  });
}

// 🚫 Low confidence results
const highConfidenceResults = results.filter(
  r => r.score >= MIN_SCORE
);

if (highConfidenceResults.length === 0) {
  return res.json({
    answer: "The requested information is not found in the provided documents.",
    retrieval: [],
  });
}

// 🚫 Weak context coverage
const contextText = highConfidenceResults
  .map(r => r.pageContent)
  .join(" ");

if (contextText.length < MIN_CONTEXT_CHARS) {
  return res.json({
    answer: "The requested information is not found in the provided documents.",
    retrieval: [],
  });
}


    if (results.length === 0) {
      return res.json({
        answer: "No relevant information found in uploaded documents.",
        retrieval: [],
      });
    }

    // 4️⃣ Build context
const context = highConfidenceResults
  .map((r, i) => `Source ${i + 1}:\n${r.pageContent}`)
  .join("\n\n");


    // 5️⃣ Generate answer
    const answer = await generateAnswer(context, question);

    // 6️⃣ Build retrieval metadata
const retrieval = highConfidenceResults.map((r, index) => ({
  rank: index + 1,
  score: Number(r.score.toFixed(4)),

  document: {
    id: r.metadata.documentId,
    name: r.metadata.documentName,
    department: r.metadata.department,
    type: r.metadata.docType,
    version: r.metadata.version,
    status: r.metadata.status,
  },

  chunk: {
    index: r.metadata.chunkIndex,
    section: r.metadata.section,
    preview: r.pageContent.slice(0, 200) + "...",
  },
}));
  await saveAuditLog({
  question,
  answer,
  retrievedDocuments: retrieval,
  metadata: {
    sectionWeights,
    resultCount: retrieval.length,
  },
});



    res.json({
      answer,
      retrieval,
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
