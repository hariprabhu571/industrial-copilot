import express from "express";
import { query } from "../db/postgres.js";

const router = express.Router();

console.log('🔧 Audit routes loaded');

/**
 * GET /audit/test
 * Simple test endpoint
 */
router.get("/test", (req, res) => {
  console.log('🔍 Audit test endpoint called');
  res.json({ message: "Audit route is working" });
});

/**
 * GET /audit
 * Admin-only audit log access
 */
router.get("/", async (req, res) => {
  try {
    console.log('🔍 Audit endpoint called');
    
    // First, check if the table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      );
    `);
    
    console.log('Table exists check:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ audit_logs table does not exist');
      return res.status(500).json({ 
        success: false,
        error: "Audit logs table not found",
        details: "The audit_logs table does not exist in the database"
      });
    }
    
    const result = await query(
      `
      SELECT
        id,
        created_at as timestamp,
        question,
        answer,
        retrieved_documents,
        metadata,
        user_id,
        session_id
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
      `
    );

    console.log('✅ Audit query successful, rows:', result.rows.length);

    res.json({
      success: true,
      count: result.rows.length,
      logs: result.rows,
    });

  } catch (err) {
    console.error("AUDIT ERROR:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch audit logs",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
