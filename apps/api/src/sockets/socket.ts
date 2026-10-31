import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { registerMessageHandlers } from "./handlers/message.handler.js";

interface SocketUser {
  userId: string;
  systemRole: "admin" | "member";
}

declare module "socket.io" {
  interface Socket {
    user: SocketUser;
  }
}

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // JWT Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized: no token"));
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketUser;
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    // Wrap entire connection handler — a DB error must never crash the server
    handleConnection(socket).catch((err) => {
      console.error("[Socket] Connection handler error:", err?.message ?? err);
      socket.disconnect(true);
    });
  });

  return io;
}

async function handleConnection(socket: Socket) {
  const { userId } = socket.user;

  // Join personal room immediately (no DB needed)
  socket.join(`user:${userId}`);

  // Join project rooms — gracefully skip if DB is unreachable
  let memberships: { projectId: string }[] = [];
  try {
    memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    memberships.forEach(({ projectId }) => socket.join(`project:${projectId}`));
  } catch (err) {
    console.warn("[Socket] Could not load project memberships:", (err as Error).message);
  }

  // Mark online
  try {
    await prisma.user.update({ where: { id: userId }, data: { isOnline: true } });
    memberships.forEach(({ projectId }) =>
      socket.to(`project:${projectId}`).emit("user_presence", { userId, isOnline: true })
    );
  } catch {
    // Non-fatal — presence is best-effort
  }

  // Register feature handlers
  registerMessageHandlers(io, socket);

  // Typing indicators
  socket.on("typing", ({ projectId }: { projectId: string }) => {
    socket.to(`project:${projectId}`).emit("typing", { userId, projectId });
  });
  socket.on("stop_typing", ({ projectId }: { projectId: string }) => {
    socket.to(`project:${projectId}`).emit("stop_typing", { userId, projectId });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    try {
      await prisma.user.update({ where: { id: userId }, data: { isOnline: false } });
      memberships.forEach(({ projectId }) =>
        io.to(`project:${projectId}`).emit("user_presence", { userId, isOnline: false })
      );
    } catch {
      // Non-fatal
    }
  });
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialised — call initSocket first");
  return io;
}
