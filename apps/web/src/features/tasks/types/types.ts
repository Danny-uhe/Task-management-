// ── API-aligned Task type ─────────────────────────────────────────────────────

export type TaskStatus   = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id:           string;          // string cuid from DB
  title:        string;
  description?: string | null;
  status:       TaskStatus;
  priority:     TaskPriority;
  dueDate?:     string | null;
  points:       number;
  projectId:    string;

  assignedToId?: string | null;
  assignedTo?:   { id: string; name: string; avatar?: string | null } | null;
  createdById?:  string | null;

  // UI-only fields (populated locally, not from API)
  progress?:     number;
  comments?:     number;
  filter?:       "Today" | "Upcoming" | "Completed" | "Assigned";
  actionItems?:  { label: string; done: boolean }[];
  attachments?:  { name: string; size: string; type: "pdf" | "image" | "file" }[];
};

// ── Status label maps ─────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo:        "To Do",
  in_progress: "In Progress",
  in_review:   "In Review",
  done:        "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low:    "Low",
  medium: "Medium",
  high:   "High",
};