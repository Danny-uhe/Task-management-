import {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

import type { Task, TaskStatus } from '@/features/tasks/types/types';
import { taskService }    from '@/features/tasks/services/task.service';
import { projectService } from '@/services/project.service';
import { useUserProfile, POINTS } from './UserProfileContext';
import { useNotifications }        from './NotificationContext';
import { useAuthStore }            from '@/store/authStore';

// ── Status mapping: backend → frontend (and back) ────────────────────────────

/** Maps a backend ApiTask to the shared Task shape used by the UI */
function mapApiTask(raw: import('@/features/tasks/services/task.service').ApiTask): Task {
  return {
    id:           raw.id,
    title:        raw.title,
    description:  raw.description,
    status:       raw.status as TaskStatus,
    priority:     raw.priority as Task['priority'],
    dueDate:      raw.dueDate,
    points:       raw.points,
    projectId:    raw.projectId,
    assignedToId: raw.assignedToId,
    assignedTo:   raw.assignedTo,
    createdById:  raw.createdById,
    comments:     raw._count?.comments ?? 0,
    progress:
      raw.status === 'done'        ? 100 :
      raw.status === 'in_progress' ?  50 :
      raw.status === 'in_review'   ?  80 : 0,
    // Derive list-view filter from status + dueDate
    filter: deriveFilter(raw),
  };
}

function deriveFilter(raw: import('@/features/tasks/services/task.service').ApiTask): Task['filter'] {
  if (raw.status === 'done') return 'Completed';
  const due = raw.dueDate ? new Date(raw.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due && due <= today) return 'Today';
  if (raw.assignedToId)    return 'Assigned';
  return 'Upcoming';
}

// ── Context type ─────────────────────────────────────────────────────────────

type TaskContextType = {
  tasks:        Task[];
  loading:      boolean;
  refetch:      () => void;
  addTask:      (projectId: string, data: Omit<Task, 'id' | 'projectId' | 'progress' | 'filter'>) => Promise<void>;
  updateTask:   (t: Task) => Promise<void>;
  deleteTask:   (projectId: string, id: string) => Promise<void>;
  moveTask:     (id: string, newStatus: TaskStatus) => void;
  /** True if the current user can approve tasks (move to Done) in a given project */
  canApprove:   (projectId: string) => boolean;
  addTaskOpen:      boolean;
  openAddTask:      () => void;
  closeAddTask:     () => void;
  boardDetailTask:  Task | null;
  setBoardDetailTask: (t: Task | null) => void;
};

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [addTaskOpen,    setAddTaskOpen]    = useState(false);
  const [boardDetailTask, setBoardDetailTask] = useState<Task | null>(null);

  // Map of projectId → user's role in that project
  const [projectRoles, setProjectRoles]   = useState<Record<string, string>>({});

  const { addPoints }       = useUserProfile();
  const { addNotification } = useNotifications();
  const user                = useAuthStore((s) => s.user);
  const accessToken         = useAuthStore((s) => s.accessToken);

  // Track project IDs so we can load tasks for all projects
  const projectIdsRef = useRef<string[]>([]);

  // ── Fetch all tasks across all user's projects ───────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const projRes = await projectService.getProjects();
      const projects = projRes.data.projects;
      projectIdsRef.current = projects.map((p) => p.id);

      if (projects.length === 0) {
        setTasks([]);
        return;
      }

      const taskArrays = await Promise.all(
        projects.map((p) =>
          taskService.getProjectTasks(p.id).then((r) => r.data.tasks)
        )
      );
      setTasks(taskArrays.flat().map(mapApiTask));

      // Build role map: project owner = "owner", otherwise fetch member list
      // Simple heuristic: system admin → can approve everywhere
      // For project-level, we derive from the ownerId in the project response
      const roles: Record<string, string> = {};
      for (const p of projects) {
        if (user?.systemRole === 'admin') {
          roles[p.id] = 'admin';
        } else if (p.ownerId === user?.id) {
          roles[p.id] = 'owner';
        } else {
          roles[p.id] = 'member';
        }
      }
      setProjectRoles(roles);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!accessToken) {
      setTasks([]);
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [fetchTasks, accessToken]);

  // ── Can the current user approve (move to done) in this project? ─────────
  const canApprove = useCallback((projectId: string): boolean => {
    if (user?.systemRole === 'admin') return true;
    const role = projectRoles[projectId];
    return role === 'owner' || role === 'admin';
  }, [user, projectRoles]);

  // ── Add task ─────────────────────────────────────────────────────────────
  const addTask = useCallback(async (
    projectId: string,
    data: Omit<Task, 'id' | 'projectId' | 'progress' | 'filter'>
  ) => {
    const res = await taskService.createTask(projectId, {
      title:        data.title,
      description:  data.description ?? undefined,
      status:       data.status,
      priority:     data.priority,
      dueDate:      data.dueDate ?? undefined,
      points:       data.points,
      assignedToId: data.assignedToId ?? undefined,
    });
    const newTask = mapApiTask(res.data.task);
    setTasks((prev) => [newTask, ...prev]);
    addPoints(POINTS.TASK_CREATE, 'Task created');
  }, [addPoints]);

  // ── Update task ──────────────────────────────────────────────────────────
  const updateTask = useCallback(async (updated: Task) => {
    const res = await taskService.updateTask(updated.projectId, updated.id, {
      title:        updated.title,
      description:  updated.description ?? undefined,
      status:       updated.status,
      priority:     updated.priority,
      dueDate:      updated.dueDate ?? undefined,
      assignedToId: updated.assignedToId ?? undefined,
    });
    const saved = mapApiTask(res.data.task);
    setTasks((prev) => {
      const old = prev.find((t) => t.id === saved.id);
      if (old && old.status !== 'done' && saved.status === 'done') {
        addPoints(POINTS.TASK_COMPLETE, `"${saved.title}" completed`);
        addNotification({
          type:           'completed',
          title:          'Task Approved! 🎉',
          message:        `"${saved.title}" has been marked as Done`,
          avatarColor:    'bg-green-500',
          avatarInitials: '✓',
        });
      }
      return prev.map((t) => (t.id === saved.id ? saved : t));
    });
  }, [addPoints, addNotification]);

  // ── Delete task ──────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (projectId: string, id: string) => {
    await taskService.deleteTask(projectId, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Move task (drag-and-drop) — optimistic update ────────────────────────
  const moveTask = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;

      // Block non-admins from moving to "done"
      if (newStatus === 'done' && !canApprove(task.projectId)) {
        toast.error('Only project admins can approve tasks. Move to In Review instead.');
        return prev;
      }

      // Award points if transitioning to done
      if (task.status !== 'done' && newStatus === 'done') {
        addPoints(POINTS.TASK_COMPLETE, `"${task.title}" completed`);
        addNotification({
          type:           'completed',
          title:          'Task Approved! 🎉',
          message:        `"${task.title}" has been marked as Done`,
          avatarColor:    'bg-green-500',
          avatarInitials: '✓',
        });
      }

      // Optimistic UI update
      const updated = { ...task, status: newStatus, progress: newStatus === 'done' ? 100 : task.progress };
      taskService
        .updateTask(task.projectId, id, { status: newStatus })
        .catch((err) => {
          // Rollback on failure
          setTasks((t) => t.map((x) => (x.id === id ? task : x)));
          const msg = err?.response?.data?.message ?? 'Failed to move task';
          toast.error(msg);
        });

      return prev.map((t) => (t.id === id ? updated : t));
    });
  }, [addPoints, addNotification, canApprove]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        refetch: fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        canApprove,
        addTaskOpen,
        openAddTask:  () => setAddTaskOpen(true),
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
