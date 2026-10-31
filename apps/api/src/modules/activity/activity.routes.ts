import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/requireAdmin.middleware.js";
import { getMyActivity, getOrgActivity } from "./activity.controller.js";

const router = Router();

router.get("/", authenticate, getMyActivity);
router.get("/org", authenticate, requireAdmin, getOrgActivity);

export default router;
