// Debug JWT Token
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

async function debugJWT() {
  try {
    console.log("🔍 Debugging JWT Token...\n");
    
    // Authenticate and get token
    const authResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const authData = await authResponse.json();
    const token = authData.data.token;
    
    console.log("1️⃣ JWT Token (first 50 chars):", token.substring(0, 50) + "...");
    
    // Decode token without verification to see payload
    const decoded = jwt.decode(token);
    console.log("\n2️⃣ JWT Payload:", decoded);
    
    // Check what user ID is in database
    const { query } = await import("./src/db/postgres.js");
    const users = await query("SELECT id, username FROM users WHERE username = 'admin'");
    console.log("\n3️⃣ Database user:", users.rows[0]);
    
    // Compare
    console.log("\n4️⃣ Comparison:");
    console.log("   JWT userId:", decoded.userId);
    console.log("   DB user id:", users.rows[0].id);
    console.log("   Match:", decoded.userId === users.rows[0].id);
    
  } catch (error) {
    console.error("Debug error:", error.message);
  }
}

debugJWT();