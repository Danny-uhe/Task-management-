import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export type AppNotification = {
  id: number;
  type: 'assignment' | 'invite' | 'mention' | 'completed' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatarColor?: string;
  avatarInitials?: string;
  dbId?: string; // real DB id
};

type NotifCtx = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'time'>) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  dismiss: (id: number) => void;
};

const NotificationContext = createContext<NotifCtx | null>(null);

let nextId = 1000;

function typeFromString(t: string): AppNotification['type'] {
  if (t.includes('assign')) return 'assignment';
  if (t.includes('invite')) return 'invite';
  if (t.includes('mention')) return 'mention';
  if (t.includes('complet') || t.includes('done')) return 'completed';
  return 'general';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load real notifications from API on login
  useEffect(() => {
    if (!accessToken) { setNotifications([]); return; }
    api.get<{ success: boolean; notifications: Array<{
      id: string; type: string; message: string; isRead: boolean; createdAt: string;
    }> }>('/notifications')
      .then((res) => {
        const mapped = (res.data.notifications ?? []).map((n) => ({
          id: nextId++,
          dbId: n.id,
          type: typeFromString(n.type),
          title: n.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          message: n.message,
          time: timeAgo(n.createdAt),
          read: n.isRead,
        }));
        setNotifications(mapped);
      })
      .catch(() => {
        // Fallback to empty — no mock data
        setNotifications([]);
      });
  }, [accessToken]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (n: Omit<AppNotification, 'id' | 'read' | 'time'>) => {
    setNotifications((prev) => [
      { ...n, id: nextId++, read: false, time: 'Just now' },
      ...prev,
    ]);
  };

  const markRead = (id: number) => {
    const notif = notifications.find((n) => n.id === id);
    // Fire-and-forget mark as read on backend
    if (notif?.dbId) {
      api.patch(`/notifications/${notif.dbId}/read`).catch(() => {});
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, dismiss }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
