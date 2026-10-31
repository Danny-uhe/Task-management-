export interface SocketMessage {
  id: string;
  content: string;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    position: string | null;
  };
}

export interface SocketNotification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  createdAt: string;
}

export interface SocketTaskEvent {
  action: "created" | "updated" | "deleted";
  task?: Record<string, unknown>;
  taskId?: string;
}

export interface SocketPresence {
  userId: string;
  isOnline: boolean;
}

export interface SocketTyping {
  userId: string;
  projectId: string;
}
