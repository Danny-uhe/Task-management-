import { getIO } from "../socket.js";
import { Notification } from "@prisma/client";

/**
 * Push a notification to a user's personal socket room.
 * Call this from notification.service after saving to DB.
 */
export function emitNotification(userId: string, notification: Notification) {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit("notification", notification);
  } catch {
    // Socket not yet initialised (e.g. during tests) — silently skip
  }
}
