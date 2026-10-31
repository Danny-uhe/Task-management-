import { prisma } from "../../config/prisma.js";
import { getIO } from "../../sockets/socket.js";
import { CreateMessageInput } from "./message.validation.js";

const MESSAGE_PAGE_SIZE = 50;

export async function getProjectMessages(
  projectId: string,
  userId: string,
  cursor?: string
) {
  // Security: must be a project member
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member) throw new Error("You are not a member of this project");

  const messages = await prisma.message.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, position: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: MESSAGE_PAGE_SIZE,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  // Return oldest-first for display
  return messages.reverse();
}

export async function createMessage(
  projectId: string,
  userId: string,
  data: CreateMessageInput
) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member) throw new Error("You are not a member of this project");

  const message = await prisma.message.create({
    data: { content: data.content.trim(), projectId, userId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true, position: true },
      },
    },
  });

  // Broadcast to project room via socket
  try {
    const io = getIO();
    io.to(`project:${projectId}`).emit("new_message", message);

    // Also push to each member's personal room for guaranteed delivery
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });
    members.forEach(({ userId: memberId }) => {
      if (memberId !== userId) {
        io.to(`user:${memberId}`).emit("new_message", message);
      }
    });
  } catch { /* socket not ready */ }


  return message;
}

export async function deleteMessage(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");
  if (message.userId !== userId) throw new Error("You can only delete your own messages");

  await prisma.message.delete({ where: { id: messageId } });

  // Broadcast deletion to project room
  try {
    getIO().to(`project:${message.projectId}`).emit("message_deleted", { messageId });
  } catch { /* socket not ready */ }

  return { message: "Message deleted" };
}
