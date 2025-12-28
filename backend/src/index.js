import "./bootstrap.js";

import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";
import { authenticate } from "./auth/authMiddleware.js";
import { authorize } from "./auth/authorize.js";
import auditRoute from "./routes/audit.js";


const app = express();

/* ✅ MUST be BEFORE routes */
app.use(cors());
app.use(express.json());



/* ✅ Routes AFTER middleware */
app.use(
  "/upload",
  authenticate,
  authorize(["admin", "editor"]),
  uploadRoute
);

app.use(
  "/chat",
  authenticate,
  authorize(["admin", "editor", "viewer"]),
  chatRoute
);

app.use(
  "/audit",
  authenticate,
  authorize(["admin"]),
  auditRoute
);


app.get("/health", (req, res) => {
  res.json({ status: "Industrial AI Copilot backend running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
