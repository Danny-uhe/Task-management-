import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getLeaderboard } from "./gamification.controller.js";

const router = Router();

router.get("/", authenticate, getLeaderboard);

export default router;
