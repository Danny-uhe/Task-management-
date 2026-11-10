import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  upload,
  getAttachments
} from "./task-attachment.controller.js";

import {
  uploadTaskAttachments,
} from "../../middleware/upload.middleware.js";

import { 
  create,
  getAll, 
  getOne,
  remove,
  update,
  getArchived,
  archive,
  restore,
} from "./task.controller.js";

import {
  create as createComment,
  getAll as getComments,
  update as updateComment
} from "../comments/comment.controller.js";

const router = Router();

// Wraps multer so its errors return clean 400 JSON instead of crashing as 500
function multerUpload(req: Request, res: Response, next: NextFunction) {
  uploadTaskAttachments.array("attachments", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err instanceof Error) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}

// Create a new task for a specific project
router.post(
  "/projects/:projectId/tasks",
  authenticate,
  create
);

// Get all tasks for a specific project
router.get(
  "/projects/:projectId/tasks",
  authenticate,
  getAll
);

// Get a specific task by ID
router.get("/tasks/archived", authenticate, getArchived);

router.get(
  "/tasks/:taskId",
  authenticate,
  getOne
);
router.patch("/tasks/:taskId/archive", authenticate, archive);
router.patch("/tasks/:taskId/restore", authenticate, restore);

router.get(
  "/tasks/:taskId/attachments",
  authenticate,
  getAttachments
);

// Update task — project-scoped route (used by frontend) + bare route
router.patch(
  "/projects/:projectId/tasks/:taskId",
  authenticate,
  update
);
router.patch(
  "/tasks/:taskId",
  authenticate,
  update
);

// Delete task — project-scoped route (used by frontend) + bare route
router.delete(
  "/projects/:projectId/tasks/:taskId",
  authenticate,
  remove
);
router.delete(
  "/tasks/:taskId",
  authenticate,
  remove
);

// Upload task attachment
router.post(
  "/tasks/:taskId/attachments",
  authenticate,
  multerUpload,
  upload
);

export default router;
