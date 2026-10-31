import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getUsers,
  updateMe,
  changePassword,
} from "./users.controller.js";

const router = Router();

router.get("/", authenticate, getUsers);

router.patch("/me", authenticate, updateMe);
router.patch("/me/password", authenticate, changePassword);

export default router;