import { Server, Socket } from "socket.io";
import { prisma } from "../../config/prisma.js";
import { notifyProjectMessage } from "../../modules/notifications/notification.service.js";

interface SendMessagePayload {
  projectId: string;
  content: string;
}

export function registerMessageHandlers(io: Server, socket: Socket) {
  const { userId } = socket.user;

  socket.on("send_message", async (payload: SendMessagePayload) => {
    const { projectId, content } = payload;

    if (!content?.trim() || !projectId) return;

    // Verify sender is a project member
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) return;

    const message = await prisma.message.create({
      data: { content: content.trim(), projectId, userId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, position: true },
        },
      },
    });

    // Broadcast to project room (catches users actively in the room)
    io.to(`project:${projectId}`).emit("new_message", message);

    // Also push directly to each member's personal room
    // — this guarantees delivery even if a member's socket missed the room join
    try {
      const members = await prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true },
      });
      members.forEach(({ userId: memberId }) => {
        if (memberId !== userId) {
          // Don't double-send to sender (they got it from the project room)
          io.to(`user:${memberId}`).emit("new_message", message);
        }
      });
    } catch (error) {
      console.error("[Socket] Failed to broadcast message to project members:", error);
    }

    try {
      await notifyProjectMessage(message, io);
    } catch (error) {
      console.error("[MessageNotification] Failed to notify project members:", error);
    }
  });
}
