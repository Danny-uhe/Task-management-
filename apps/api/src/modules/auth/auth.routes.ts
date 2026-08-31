import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  login,
  me,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPasswordHandler,
} from "./auth.controller.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/login",           login);
router.post("/refresh",         refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPasswordHandler);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.post("/logout",     authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);
router.get("/me",          authenticate, me);

export default router;