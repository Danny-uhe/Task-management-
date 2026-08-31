import { Router } from "express";
import { authenticate }  from "../../middleware/auth.middleware.js";
import { requireAdmin }  from "../../middleware/requireAdmin.middleware.js";
import {
  create,
  getByToken,
  accept,
  list,
  cancel,
  resend,
} from "./invitation.controller.js";

const router = Router();

// ── PUBLIC (no auth needed) ───────────────────────────────────────────────────
// IMPORTANT: specific routes must come BEFORE /:token to avoid conflicts
router.get( "/",              authenticate, requireAdmin, list);    // GET  all invites  (admin)
router.post("/",              authenticate, requireAdmin, create);  // POST send invite  (admin)
router.post("/:id/resend",    authenticate, requireAdmin, resend);  // POST resend       (admin)
router.patch("/:id/cancel",   authenticate, requireAdmin, cancel);  // PATCH cancel      (admin)

// Public — the token routes must be last (catch-all pattern)
router.get( "/:token",        getByToken);   // GET  invite details by token
router.post("/:token/accept", accept);       // POST accept invite + create account

export default router;