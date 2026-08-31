import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type AppNotification = {
  id: number;
  type: 'assignment' | 'invite' | 'mention' | 'completed' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatarColor?: string;
  avatarInitials?: string;
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

const SEED: AppNotification[] = [
  {
    id: 1,
    type: 'assignment',
    title: 'Task Assigned',
    message: 'Sarah M. assigned you "Q4 Planning Deck"',
    time: '5m ago',
    read: false,
    avatarColor: 'bg-purple-500',
    avatarInitials: 'SM',
  },
  {
    id: 2,
    type: 'completed',
    title: 'Task Completed',
    message: 'Your streak reached 5 days 🔥',
    time: '1h ago',
    read: false,
    avatarColor: 'bg-orange-500',
    avatarInitials: '🔥',
  },
  {
    id: 3,
    type: 'invite',
    title: 'Organisation Invite',
    message: 'Rowland I. invited you to join TaskSync HQ',
    time: '3h ago',
    read: false,
    avatarColor: 'bg-blue-500',
    avatarInitials: 'RI',
  },
];

let nextId = 100;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (n: Omit<AppNotification, 'id' | 'read' | 'time'>) => {
    setNotifications((prev) => [
      { ...n, id: nextId++, read: false, time: 'Just now' },
      ...prev,
    ]);
  };

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

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
