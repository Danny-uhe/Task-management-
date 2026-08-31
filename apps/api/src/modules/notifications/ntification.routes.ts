import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { 
    getAll,
    markAsRead,
    markAllAsRead,
    remove,
} from "./notification.controller.js";

const router = Router();

//Get my notifications
router.get(
    "/",
    authenticate,
    getAll
);


// mark one notification as read
router.patch(
    "/:id/read",
    authenticate,
    markAsRead
)

//Mark all my notifications as read
router.patch(
    "/read-all",
    authenticate,
    markAllAsRead
);

//Delete one notification
router.delete(
    "/:id",
    authenticate,
    remove
);

export default router