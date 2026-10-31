import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { listMessages, sendMessage, removeMessage } from "./message.controller.js";

const router = Router({ mergeParams: true });

router.get("/", authenticate, listMessages);
router.post("/", authenticate, sendMessage);
router.delete("/:messageId", authenticate, removeMessage);

export default router;
