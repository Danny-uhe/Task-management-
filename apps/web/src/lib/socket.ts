import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

let socket: Socket | null = null;

/** Connect the socket with a JWT access token. */
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

/** Disconnect and destroy the socket instance. */
export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

/** Get the current socket instance (may be null if not connected). */
export function getSocket(): Socket | null {
  return socket;
}
