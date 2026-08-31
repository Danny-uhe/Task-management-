import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getUsers,
  updateMe,
} from "./users.controller.js";

const router = Router();

router.get("/", authenticate, getUsers);

router.patch("/me", authenticate, updateMe);

export default router;