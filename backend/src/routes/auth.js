import express from "express";
import bcrypt from "bcrypt";
import { signToken } from "../auth/jwt.js";
import { query } from "../db/postgres.js";

const router = express.Router();

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    // Get user from database
    const userResult = await query(
      "SELECT id, username, email, password_hash, role, equipment_role, department FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Update last login
    await query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          equipmentRole: user.equipment_role,
          department: user.department,
          createdAt: new Date().toISOString(),
        },
        token,
      },
    });

  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

/**
 * POST /auth/verify
 * Verify JWT token and return user info
 */
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Token is required",
      });
    }

    const { verifyToken } = await import("../auth/jwt.js");
    const decoded = verifyToken(token);

    // Find user by ID
    const user = Object.values(users).find(u => u.userId === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.userId,
        username: Object.keys(users).find(k => users[k].userId === user.userId),
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString(),
      },
    });

  } catch (err) {
    console.error("TOKEN VERIFY ERROR:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;