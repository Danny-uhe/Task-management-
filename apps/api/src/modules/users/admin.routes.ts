import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/requireAdmin.middleware.js";

import {
  listUsers,
  updateRole,
  deactivate,
  activate,
} from "./admin.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", listUsers);

router.patch(
  "/users/:id/role",
  updateRole
);

router.patch(
  "/users/:id/deactivate",
  deactivate
);

router.patch(
  "/users/:id/activate",
  activate
);

export default router;