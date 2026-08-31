import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  create,
  getAll,
  update,
  remove,
} from "./comment.controller.js";

const router = Router();

router.post(
  "/tasks/:taskId/comments",
  authenticate,
  create
);

router.get(
  "/tasks/:taskId/comments",
  authenticate,
  getAll
);

router.patch(
  "/comments/:commentId",
  authenticate,
  update
);

router.delete(
  "/comments/:commentId",
  authenticate,
  remove
);

export default router;