import { prisma } from "../../config/prisma.js"
import { emitNotification } from "../../sockets/handlers/notification.handler.js";
import { getIO } from "../../sockets/socket.js";
import { queueNewMessageEmail } from "../../queues/email.queue.js";
import { env } from "../../config/env.js";
import type { Server } from "socket.io";

export async function createNotification(
    userId: string,
    type: string,
    message: string,
    relatedId?: string
) {
    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            message,
            relatedId,
        },
    });

    // Push live to user's socket room
    emitNotification(userId, notification);

    return notification;
}

export async function notifyProjectMessage(
    message: {
        projectId: string;
        userId: string;
        user: { name: string };
    },
    socketServer?: Server
) {
    const project = await prisma.project.findUnique({
        where: { id: message.projectId },
        select: {
            name: true,
            members: {
                where: { userId: { not: message.userId } },
                select: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
        },
    });

    if (!project) {
        console.error(
            `[MessageNotification] Project ${message.projectId} not found after message creation`
        );
        return;
    }

    let io = socketServer;
    if (!io) {
        try {
            io = getIO();
        } catch (error) {
            console.error("[MessageNotification] Socket server unavailable:", error);
        }
    }

    await Promise.all(
        project.members.map(async ({ user }) => {
            try {
                const notification = await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: "new_message",
                        message: `${message.user.name} sent a message in ${project.name}.`,
                        relatedId: message.userId,
                    },
                });
                emitNotification(user.id, notification);
            } catch (error) {
                console.error(
                    `[MessageNotification] Failed to save notification for user ${user.id}:`,
                    error
                );
            }

            if (!io) return;

            let isOnline: boolean;
            try {
                isOnline = (await io.in(`user:${user.id}`).fetchSockets()).length > 0;
            } catch (error) {
                console.error(
                    `[MessageNotification] Could not check socket presence for user ${user.id}:`,
                    error
                );
                return;
            }
            if (isOnline) return;

            try {
                await queueNewMessageEmail({
                    to: user.email,
                    recipientName: user.name,
                    senderName: message.user.name,
                    projectName: project.name,
                    replyUrl: `${env.FRONTEND_URL}/profile/${message.userId}?message=1`,
                });
            } catch (error) {
                console.error(
                    `[MessageNotification] Failed to queue email for user ${user.id}:`,
                    error
                );
            }
        })
    );
}

export async function getUserNotifications(userId: string) {
    return prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc"
        },
    });
}

export async function markNotificationAsRead(
    notificationId: string,
    userId: string
){
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    return prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });
}

export async function markAllNotificationsAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  
    return {
      message: "All notifications marked as read",
    };
  }

export async function deleteNotification(
    notificationId: string,
    userId: string
) {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    await prisma.notification.delete({
        where: {
            id: notificationId,
        },
    });

    return {
        message: "Notification deleted successfully",
    };
}