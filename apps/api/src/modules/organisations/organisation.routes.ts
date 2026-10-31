import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/requireAdmin.middleware.js";
import {
  getOrgStats,
  getOrgMembers,
  inviteMember,
  removeUser,
  activateUser,
  changeUserRole,
} from "./organisation.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats",                       getOrgStats);
router.get("/members",                     getOrgMembers);
router.post("/invite",                     inviteMember);
router.delete("/members/:userId",          removeUser);
router.patch("/members/:userId/activate",  activateUser);
router.patch("/members/:userId/role",      changeUserRole);

export default router;
