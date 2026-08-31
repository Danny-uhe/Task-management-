import { useState } from 'react';
import { Search, ArchiveRestore, Trash2, CalendarDays } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';

type ArchivedTask = {
  id: number;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  completedDate: string;
  originalDueDate: string;
  assignee: string;
  assigneeColor: string;
};

const INITIAL_TASKS: ArchivedTask[] = [
  {
    id: 1,
    title: 'Draft Team Guidelines',
    description: 'Finalized the team code-of-conduct guidelines document.',
    priority: 'Low',
    completedDate: 'Jul 3, 2026',
    originalDueDate: 'Jul 3, 2026',
    assignee: 'SE',
    assigneeColor: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Audit Spacing System',
    description: 'Full audit of the design system spacing tokens completed.',
    priority: 'High',
    completedDate: 'Jun 30, 2026',
    originalDueDate: 'Jun 30, 2026',
    assignee: 'DE',
    assigneeColor: 'bg-purple-500',
  },
  {
    id: 3,
    title: 'Review Typography Tokens',
    description: 'Reviewed and updated all typography tokens in the design system.',
    priority: 'Low',
    completedDate: 'Jun 28, 2026',
    originalDueDate: 'Jun 28, 2026',
    assignee: 'DE',
    assigneeColor: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Authentication UI',
    description: 'Login and register pages fully completed and handed off.',
    priority: 'Medium',
    completedDate: 'Jun 20, 2026',
    originalDueDate: 'Jun 20, 2026',
    assignee: 'SE',
    assigneeColor: 'bg-blue-500',
  },
  {
    id: 5,
    title: 'Q3 Roadmap Planning',
    description: 'Planned all features and priorities for Q3 with the product team.',
    priority: 'High',
    completedDate: 'Jun 15, 2026',
    originalDueDate: 'Jun 14, 2026',
    assignee: 'RI',
    assigneeColor: 'bg-emerald-500',
  },
];

const priorityStyles: Record<string, string> = {
  High: 'bg-red-50 text-red-600',
  Medium: 'bg-orange-50 text-orange-500',
  Low: 'bg-slate-100 text-slate-500',
};

export default function ArchivedPage() {
  const [tasks, setTasks] = useState<ArchivedTask[]>(INITIAL_TASKS);
  const [search, setSearch] = useState('');

  const visible = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: number) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const handleRestore = (id: number) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <AppLayout>
      <div className='space-y-5'>
        {/* Search + stats bar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative w-full sm:w-72'>
            <Search
              size={15}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search archived tasks...'
              className='h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            />
          </div>
          <p className='text-sm text-slate-400'>
            {visible.length} archived task{visible.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Task list */}
        {visible.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-20 text-slate-400'>
            <p className='text-sm font-medium'>No archived tasks found</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {visible.map((task) => (
              <div
                key={task.id}
                className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-start sm:justify-between'
              >
                {/* Left: content */}
                <div className='flex items-start gap-3 min-w-0'>
                  <div
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${task.assigneeColor}`}
                  >
                    {task.assignee}
                  </div>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='font-semibold text-slate-700 line-through'>
                        {task.title}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className='mt-0.5 text-sm text-slate-400 line-clamp-1'>
                      {task.description}
                    </p>
                    <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400'>
                      <span className='flex items-center gap-1'>
                        <CalendarDays size={12} />
                        Due: {task.originalDueDate}
                      </span>
                      <span>✓ Completed: {task.completedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className='flex flex-shrink-0 items-center gap-2 self-start sm:self-center'>
                  <button
                    onClick={() => handleRestore(task.id)}
                    className='flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50'
                  >
                    <ArchiveRestore size={13} />
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className='flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50'
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
