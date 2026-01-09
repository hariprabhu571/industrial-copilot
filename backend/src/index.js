import "./bootstrap.js";

import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";
import authRoute from "./routes/auth.js";
import equipmentRoute from "./routes/equipment.js";
import documentsRoute from "./routes/documents.js";
import errorCodeRoute from "./routes/errorCodes.js";
import { authenticate } from "./auth/authMiddleware.js";
import { authorize } from "./auth/authorize.js";
import auditRoute from "./routes/audit.js";


const app = express();

/* ✅ MUST be BEFORE routes */
app.use(cors());
app.use(express.json());



/* ✅ Routes AFTER middleware */
app.use("/api/auth", authRoute);

// Test route without auth
app.get("/api/test-error-codes", (req, res) => {
  res.json({ message: "Error codes test route working" });
});

app.use(
  "/api/error-codes",
  authenticate,
  authorize(["admin", "editor", "viewer"]),
  errorCodeRoute
);

app.use(
  "/api/equipment",
  authenticate,
  authorize(["admin", "editor", "viewer"]),
  equipmentRoute
);

app.use(
  "/api/upload",
  authenticate,
  authorize(["admin"]), // Only admin can upload
  uploadRoute
);

// Legacy upload endpoint (bypasses JWT auth, uses admin key)
app.use("/api/upload-legacy", uploadRoute);

app.use(
  "/api/chat",
  authenticate,
  authorize(["admin", "editor", "viewer"]),
  chatRoute
);

app.use(
  "/api/documents",
  authenticate,
  authorize(["admin", "editor", "viewer"]),
  documentsRoute
);

app.use(
  "/api/audit",
  authenticate,
  authorize(["admin"]),
  auditRoute
);

console.log('🔧 All routes registered successfully');


app.get("/api/health", (req, res) => {
  res.json({ status: "Industrial AI Copilot backend running" });
});

// Direct test route to debug
app.get("/api/direct-test", (req, res) => {
  res.json({ message: "Direct test route working" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  
  // Debug: Print all registered routes
  console.log('\n🔍 Registered routes:');
  if (app._router && app._router.stack) {
    app._router.stack.forEach((middleware, index) => {
      if (middleware.route) {
        console.log(`${index}: ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        console.log(`${index}: Router middleware - ${middleware.regexp}`);
      } else {
        console.log(`${index}: ${middleware.name} middleware`);
      }
    });
  } else {
    console.log('No router found');
  }
});
