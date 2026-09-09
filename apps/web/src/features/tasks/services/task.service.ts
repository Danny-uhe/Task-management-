import api from "@/lib/axios";

// ── Types matching the backend schema ────────────────────────────────────────

export type TaskStatus   = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ApiTask {
  id:           string;
  title:        string;
  description?: string | null;
  status:       TaskStatus;
  priority:     TaskPriority;
  dueDate?:     string | null;
  points:       number;
  projectId:    string;
  assignedToId?: string | null;
  assignedTo?:  { id: string; name: string; avatar?: string | null } | null;
  createdById?: string | null;
  createdBy?:   { id: string; name: string } | null;
  createdAt:    string;
  updatedAt:    string;
  _count?:      { comments: number; attachments: number };
}

export interface CreateTaskPayload {
  title:        string;
  description?: string;
  status?:      TaskStatus;
  priority?:    TaskPriority;
  dueDate?:     string;
  points?:      number;
  assignedToId?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

// ── Project tasks ─────────────────────────────────────────────────────────────

export const taskService = {
  /** Get all tasks for a project */
  getProjectTasks(projectId: string) {
    return api.get<{ success: boolean; tasks: ApiTask[] }>(
      `/projects/${projectId}/tasks`
    );
  },

  /** Get a single task */
  getTask(projectId: string, taskId: string) {
    return api.get<{ success: boolean; task: ApiTask }>(
      `/projects/${projectId}/tasks/${taskId}`
    );
  },

  /** Create a task */
  createTask(projectId: string, payload: CreateTaskPayload) {
    return api.post<{ success: boolean; task: ApiTask }>(
      `/projects/${projectId}/tasks`,
      payload
    );
  },

  /** Update a task (status change, edit, etc.) */
  updateTask(projectId: string, taskId: string, payload: Partial<CreateTaskPayload>) {
    return api.patch<{ success: boolean; task: ApiTask }>(
      `/projects/${projectId}/tasks/${taskId}`,
      payload
    );
  },

  /** Delete a task */
  deleteTask(projectId: string, taskId: string) {
    return api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};
