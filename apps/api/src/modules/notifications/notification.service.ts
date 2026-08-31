import { prisma } from "../../config/prisma.js"

export async function createNotification(
    userId: string,
    type: string,
    message: string,
    relatedId?: string
) {
    return prisma.notification.create({
        data: {
            userId,
            type,
            message,
            relatedId,
        },
    });
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