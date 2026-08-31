import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import notificationRoutes from "./modules/notifications/ntification.routes.js";
import invitationRoutes from "./modules/invitaions/invitation.routes.js";

//Admin Routes
import adminRoutes from "./modules/users/admin.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

//Admin Routes 
app.use("/api/admin", adminRoutes);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "TaskSync API is running 🚀",
  });
});

// Serve uploaded files (e.g. task attachments) as static assets
app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api", commentRoutes);
app.use("/api/notifications", notificationRoutes)
app.use("/api/invitations", invitationRoutes);



export default app;