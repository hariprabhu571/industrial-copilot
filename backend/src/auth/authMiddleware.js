import { verifyToken } from "./jwt.js";
import { query } from "../db/postgres.js";

// Async middleware wrapper
function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

async function authenticateAsync(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // Get user from database to ensure current info
    const userResult = await query(
      "SELECT id, username, email, role, equipment_role, department FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Attach user to request
    req.user = {
      id: user.id,
      userId: user.id, // Keep for backward compatibility
      username: user.username,
      email: user.email,
      role: user.role,
      equipmentRole: user.equipment_role,
      department: user.department,
    };

    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

// Export wrapped middleware
export const authenticate = asyncMiddleware(authenticateAsync);
