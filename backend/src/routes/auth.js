import express from "express";
import { signToken } from "../auth/jwt.js";

const router = express.Router();

// Mock users for demo (in production, this would be from database)
const users = {
  admin: {
    userId: "1",
    email: "admin@company.com",
    role: "admin",
    password: "admin123", // In production, this would be hashed
  },
  editor: {
    userId: "2", 
    email: "editor@company.com",
    role: "editor",
    password: "editor123",
  },
  viewer: {
    userId: "3",
    email: "viewer@company.com", 
    role: "viewer",
    password: "viewer123",
  },
};

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

    const user = users[username.toLowerCase()];
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          username: username.toLowerCase(),
          email: user.email,
          role: user.role,
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