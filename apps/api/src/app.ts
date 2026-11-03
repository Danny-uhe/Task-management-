import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import notificationRoutes from "./modules/notifications/ntification.routes.js";
import invitationRoutes from "./modules/invitaions/invitation.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";

// Admin Routes
import adminRoutes from "./modules/users/admin.routes.js";
import orgRoutes from "./modules/organisations/organisation.routes.js";
import activityRoutes from "./modules/activity/activity.routes.js";
import leaderboardRoutes from "./modules/gamification/gamification.routes.js";

const app = express();

// ── CORS — allow the deployed frontend + localhost in dev ──────────────────
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      // Allow any exact match
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.onrender.com preview URL (staging / PR deploys)
      if (origin.endsWith(".onrender.com")) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow /uploads to be loaded cross-origin
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Health check (used by Render) ──────────────────────────────────────────
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Admin Routes
app.use("/api/admin", adminRoutes);

app.get("/", (_, res) => {
  res.json({ success: true, message: "TaskSync API is running 🚀" });
});

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/organisation", orgRoutes);
app.use("/api/projects/:projectId/messages", messageRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

export default app;
