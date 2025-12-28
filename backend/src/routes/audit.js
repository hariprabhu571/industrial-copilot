import express from "express";
import { query } from "../db/postgres.js";

const router = express.Router();

/**
 * GET /audit
 * Admin-only audit log access
 */
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        timestamp,
        question,
        answer,
        retrieved_documents,
        metadata
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 100
      `
    );

    res.json({
      count: result.rows.length,
      logs: result.rows,
    });

  } catch (err) {
    console.error("AUDIT ERROR:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
