import "./bootstrap.js";

import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";
import authRoute from "./routes/auth.js";
import { authenticate } from "./auth/authMiddleware.js";
import { authorize } from "./auth/authorize.js";
import auditRoute from "./routes/audit.js";


const app = express();

/* ✅ MUST be BEFORE routes */
app.use(cors());
app.use(express.json());



/* ✅ Routes AFTER middleware */
app.use("/api/auth", authRoute);

app.use(
  "/api/upload",
  authenticate,
  authorize(["admin", "editor"]),
  uploadRoute
);

app.use(
  "/api/chat",
  authenticate,
  authorize(["admin", "editor", "viewer"]),
  chatRoute
);

app.use(
  "/api/audit",
  authenticate,
  authorize(["admin"]),
  auditRoute
);


app.get("/api/health", (req, res) => {
  res.json({ status: "Industrial AI Copilot backend running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
