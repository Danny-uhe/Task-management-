import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "./NotificationContext";
import type {
  SocketMessage,
  SocketNotification,
  SocketTaskEvent,
  SocketPresence,
  SocketTyping,
} from "@/types/socket.types";

interface SocketCtx {
  sendMessage: (projectId: string, content: string) => void;
  sendTyping: (projectId: string) => void;
  sendStopTyping: (projectId: string) => void;
}

const SocketContext = createContext<SocketCtx | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      connectedRef.current = false;
      return;
    }

    if (connectedRef.current) return;

    const socket = connectSocket(accessToken);
    connectedRef.current = true;

    // ── Incoming messages ───────────────────────────────────────────────────
    socket.on("new_message", (msg: SocketMessage) => {
      // Append to cached message list for the project
      queryClient.setQueryData<SocketMessage[]>(
        ["messages", msg.projectId],
        (old = []) => [...old, msg]
      );
    });

    socket.on("message_deleted", ({ messageId }: { messageId: string }) => {
      // Remove from all cached message lists
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      void messageId;
    });

    // ── Task updates ────────────────────────────────────────────────────────
    socket.on("task_updated", (event: SocketTaskEvent) => {
      // Invalidate the task queries so the board re-fetches
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void event;
    });

    // ── Live notifications ──────────────────────────────────────────────────
    socket.on("notification", (notif: SocketNotification) => {
      addNotification({
        type: "general",
        title: notif.type.replace(/_/g, " "),
        message: notif.message,
      });
      toast(notif.message, { icon: "🔔" });
    });

    // ── Presence ────────────────────────────────────────────────────────────
    socket.on("user_presence", (presence: SocketPresence) => {
      // Invalidate member queries so online indicators refresh
      queryClient.invalidateQueries({ queryKey: ["members"] });
      void presence;
    });

    // ── Typing (forwarded to message query data — consumed by chat UI) ──────
    socket.on("typing", (payload: SocketTyping) => {
      queryClient.setQueryData(
        ["typing", payload.projectId],
        (old: string[] = []) =>
          old.includes(payload.userId) ? old : [...old, payload.userId]
      );
    });

    socket.on("stop_typing", (payload: SocketTyping) => {
      queryClient.setQueryData(["typing", payload.projectId], (old: string[] = []) =>
        old.filter((id) => id !== payload.userId)
      );
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    return () => {
      socket.off("new_message");
      socket.off("message_deleted");
      socket.off("task_updated");
      socket.off("notification");
      socket.off("user_presence");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("connect_error");
    };
  }, [accessToken, queryClient, addNotification]);

  // Disconnect on logout
  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      connectedRef.current = false;
    }
  }, [accessToken]);

  const sendMessage = (projectId: string, content: string) => {
    getSocket()?.emit("send_message", { projectId, content });
  };

  const sendTyping = (projectId: string) => {
    getSocket()?.emit("typing", { projectId });
  };

  const sendStopTyping = (projectId: string) => {
    getSocket()?.emit("stop_typing", { projectId });
  };

  return (
    <SocketContext.Provider value={{ sendMessage, sendTyping, sendStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
