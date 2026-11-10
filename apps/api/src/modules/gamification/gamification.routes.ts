import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getLeaderboard,
  getMyGamificationProfile,
  updateMyGamificationPreferences,
} from "./gamification.controller.js";

const router = Router();

router.get("/", authenticate, getLeaderboard);
router.get("/me", authenticate, getMyGamificationProfile);
router.patch("/preferences", authenticate, updateMyGamificationPreferences);

export default router;
