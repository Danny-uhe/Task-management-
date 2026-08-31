import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Task } from '@/features/tasks/types/types';
import { useUserProfile, POINTS } from './UserProfileContext';
import { useNotifications } from './NotificationContext';

/* ─── Initial seed data (single source of truth) ─── */
const SEED_TASKS: Task[] = [
  /* ── TODAY ── */
  {
    id: 101, filter: 'Today', status: 'progress', priority: 'High',
    title: 'Redesign Task Dashboard UI',
    description: 'Refactor the main tasks view to incorporate bento-grid layouts and improve responsive behaviour on tablet screens.',
    dueDate: 'Today', assignee: 'Rowland E.', assigneeColor: 'bg-blue-500',
    progress: 65, comments: 3,
    actionItems: [
      { label: 'Review typography tokens', done: true },
      { label: 'Audit spacing system', done: true },
      { label: 'Implement dark mode classes', done: false },
    ],
    attachments: [
      { name: 'Audit_Report.pdf', size: '1.2 MB', type: 'pdf' },
      { name: 'New_Styles.png', size: '4.5 MB', type: 'image' },
    ],
  },
  {
    id: 102, filter: 'Today', status: 'progress', priority: 'Medium',
    title: 'Client Feedback Sync',
    description: 'Consolidate all client feedback from Q3 and prepare action items for the design team.',
    dueDate: 'Today', assignee: 'Sarah M.', assigneeColor: 'bg-purple-500',
    progress: 40, comments: 1,
    actionItems: [
      { label: 'Collect feedback forms', done: true },
      { label: 'Prioritise action items', done: false },
    ],
    attachments: [],
  },

  /* ── UPCOMING ── */
  {
    id: 103, filter: 'Upcoming', status: 'todo', priority: 'High',
    title: 'Quarterly Budget Review',
    description: 'Complete the quarterly budget review with the finance team.',
    dueDate: 'Oct 24', assignee: 'Rowland E.', assigneeColor: 'bg-blue-500',
    progress: 0, comments: 0, actionItems: [], attachments: [],
  },
  {
    id: 104, filter: 'Upcoming', status: 'todo', priority: 'Medium',
    title: 'Database Migration Strategy',
    description: 'Draft the database migration plan for Q4 infrastructure overhaul.',
    dueDate: 'Oct 28', assignee: 'Dev Team', assigneeColor: 'bg-emerald-500',
    progress: 20, comments: 2,
    actionItems: [
      { label: 'Draft schema changes', done: false },
      { label: 'Test in staging', done: false },
    ],
    attachments: [],
  },
  {
    id: 105, filter: 'Upcoming', status: 'todo', priority: 'Medium',
    title: 'Vendor Contract Renewal',
    description: 'Renew all vendor contracts expiring in Q4.',
    dueDate: 'Nov 2', assignee: 'Rowland E.', assigneeColor: 'bg-blue-500',
    progress: 0, comments: 0, actionItems: [], attachments: [],
  },

  /* ── COMPLETED ── */
  {
    id: 106, filter: 'Completed', status: 'completed', priority: 'Low',
    title: 'Draft Team Guidelines',
    description: 'Finalised the team code-of-conduct guidelines document.',
    dueDate: 'Jul 3', assignee: 'Sarah M.', assigneeColor: 'bg-purple-500',
    progress: 100, comments: 0,
    actionItems: [{ label: 'Write first draft', done: true }, { label: 'Review with team', done: true }],
    attachments: [{ name: 'Guidelines_v2.pdf', size: '800 KB', type: 'pdf' }],
  },
  {
    id: 107, filter: 'Completed', status: 'completed', priority: 'High',
    title: 'Audit Spacing System',
    description: 'Full audit of the design system spacing tokens.',
    dueDate: 'Jun 30', assignee: 'Dev Team', assigneeColor: 'bg-emerald-500',
    progress: 100, comments: 0, actionItems: [], attachments: [],
  },
  {
    id: 108, filter: 'Completed', status: 'completed', priority: 'Low',
    title: 'Review Typography Tokens',
    description: 'Reviewed and updated all typography tokens.',
    dueDate: 'Jun 28', assignee: 'Dev Team', assigneeColor: 'bg-emerald-500',
    progress: 100, comments: 0, actionItems: [], attachments: [],
  },
  {
    id: 109, filter: 'Completed', status: 'completed', priority: 'Medium',
    title: 'Authentication UI',
    description: 'Login and register pages fully completed and handed off.',
    dueDate: 'Jun 20', assignee: 'Rowland E.', assigneeColor: 'bg-blue-500',
    progress: 100, comments: 0, actionItems: [], attachments: [],
  },

  /* ── ASSIGNED ── */
  {
    id: 110, filter: 'Assigned', status: 'progress', priority: 'Low',
    title: 'Onboarding Checklist Update',
    description: 'Update the employee onboarding checklist for Q4 hires.',
    dueDate: 'Oct 29', assignee: 'Rowland E.', assigneeColor: 'bg-blue-500',
    progress: 50, comments: 1, actionItems: [], attachments: [],
  },
  {
    id: 111, filter: 'Assigned', status: 'review', priority: 'Medium',
    title: 'Q4 Planning Deck',
    description: 'Prepare the Q4 planning presentation deck for the all-hands meeting.',
    dueDate: 'Nov 5', assignee: 'Sarah M.', assigneeColor: 'bg-purple-500',
    progress: 75, comments: 4,
    actionItems: [
      { label: 'Gather metrics', done: true },
      { label: 'Design slides', done: true },
      { label: 'Exec review', done: false },
    ],
    attachments: [{ name: 'Q4_Deck_Draft.pdf', size: '2.1 MB', type: 'pdf' }],
  },
];

/* ─── Context type ─── */
type TaskContextType = {
  tasks: Task[];
  addTask: (t: Omit<Task, 'id'>) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: number) => void;
  moveTask: (id: number, newStatus: Task['status']) => void;
  /** Whether the Add Task modal is open */
  addTaskOpen: boolean;
  openAddTask: () => void;
  closeAddTask: () => void;
  /** Board-view detail panel state */
  boardDetailTask: Task | null;
  setBoardDetailTask: (t: Task | null) => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [boardDetailTask, setBoardDetailTask] = useState<Task | null>(null);

  const { addPoints } = useUserProfile();
  const { addNotification } = useNotifications();

  const addTask = (t: Omit<Task, 'id'>) => {
    setTasks((prev) => [{ ...t, id: Date.now() }, ...prev]);
    addPoints(POINTS.TASK_CREATE, 'Task created');
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => {
      const old = prev.find((t) => t.id === updated.id);
      /* Award points if transitioning to completed */
      if (old && old.status !== 'completed' && updated.status === 'completed') {
        addPoints(POINTS.TASK_COMPLETE, `"${updated.title}" completed`);
        addNotification({
          type: 'completed',
          title: 'Task Completed! 🎉',
          message: `You earned ${POINTS.TASK_COMPLETE} points for completing "${updated.title}"`,
          avatarColor: 'bg-green-500',
          avatarInitials: '✓',
        });
      }
      return prev.map((t) => (t.id === updated.id ? updated : t));
    });
  };

  const deleteTask = (id: number) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const moveTask = useCallback((id: number, newStatus: Task['status']) => {
    setTasks((prev) => {
      const old = prev.find((t) => t.id === id);
      /* Award points if moving to completed for the first time */
      if (old && old.status !== 'completed' && newStatus === 'completed') {
        addPoints(POINTS.TASK_COMPLETE, `"${old.title}" completed`);
        addNotification({
          type: 'completed',
          title: 'Task Completed! 🎉',
          message: `You earned ${POINTS.TASK_COMPLETE} points for completing "${old.title}"`,
          avatarColor: 'bg-green-500',
          avatarInitials: '✓',
        });
      }
      return prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    });
  }, [addPoints, addNotification]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addTaskOpen,
        openAddTask: () => setAddTaskOpen(true),
        closeAddTask: () => setAddTaskOpen(false),
        boardDetailTask,
        setBoardDetailTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used inside TaskProvider');
  return ctx;
}
