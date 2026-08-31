import type { Task } from '../types/types';

export const todoTasks: Task[] = [
  {
    id: 1,
    title: 'Quarterly Budget Review',
    priority: 'High',
    progress: 0,
    dueDate: 'Oct 24',
    assignee: 'JR',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 2,
    title: 'Update onboarding checklist',
    priority: 'Low',
    progress: 0,
    dueDate: 'Oct 29',
    assignee: 'CJ',
    avatarColor: 'bg-teal-500',
  },
  {
    id: 3,
    title: 'Vendor contract renewal',
    priority: 'Medium',
    progress: 0,
    dueDate: 'Nov 2',
    assignee: 'ST',
    avatarColor: 'bg-orange-500',
  },
];

export const progressTasks: Task[] = [
  {
    id: 4,
    title: 'Redesign Task Dashboard UI',
    priority: 'High',
    progress: 65,
    dueDate: 'Oct 24',
    assignee: 'JR',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 5,
    title: 'Database migration strategy',
    priority: 'Medium',
    progress: 20,
    dueDate: 'Oct 28',
    assignee: 'RD',
    avatarColor: 'bg-purple-500',
  },
];

export const completedTasks: Task[] = [
  {
    id: 6,
    title: 'Draft team guidelines',
    priority: 'Low',
    progress: 100,
    dueDate: 'Jul 3',
    assignee: 'CE',
    avatarColor: 'bg-pink-400',
  },
  {
    id: 7,
    title: 'Client feedback sync',
    priority: 'Medium',
    progress: 100,
    dueDate: 'Jul 2',
    assignee: 'CJ',
    avatarColor: 'bg-cyan-400',
  },
  {
    id: 8,
    title: 'Audit spacing system',
    priority: 'High',
    progress: 100,
    dueDate: 'Jun 30',
    assignee: 'JR',
    avatarColor: 'bg-indigo-500',
  },
];
