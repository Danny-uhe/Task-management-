import { Request, Response } from "express";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "./notification.service.js";

export async function getAll(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.userId;

        const notifications = await getUserNotifications(userId);

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
}

export async function markAsRead(
    req: Request,
    res: Response
) {
    try {
        const notificationId = req.params.id as string;
        const userId = req.user!.userId;

        const notification = await markNotificationAsRead(
            notificationId,
            userId
        );

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
}

export async function markAllAsRead(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user!.userId;

        const result = await markAllNotificationsAsRead(userId);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
}

export async function remove(
    req: Request,
    res: Response
) {
    try {
        const notificationId = req.params.id as string;
        const userId = req.user!.userId;

        const result = await deleteNotification(
            notificationId,
            userId
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
}