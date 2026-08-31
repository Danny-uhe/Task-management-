export type Task = {
  id: number;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  description?: string;
  assignee?: string;
  assigneeColor?: string;
  progress?: number;
  status?: 'todo' | 'progress' | 'completed' | 'review';
  filter?: 'Today' | 'Upcoming' | 'Completed' | 'Assigned';
  actionItems?: { label: string; done: boolean }[];
  attachments?: { name: string; size: string; type: 'pdf' | 'image' | 'file' }[];
  comments?: number;
};