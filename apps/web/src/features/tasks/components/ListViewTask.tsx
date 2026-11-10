import { Archive, CalendarDays } from 'lucide-react';
import type { Task } from '../types/types';
import { useTaskContext } from '@/app/Providers/TaskContext';
import toast from 'react-hot-toast';

type Props = {
  task: Task;
  selected: boolean;
  onClick: () => void;
};

const priorityStyles: Record<string, string> = {
  High:   'bg-red-500/10 text-red-400',
  Medium: 'bg-amber-500/10 text-amber-400',
  Low:    'bg-zinc-700 text-zinc-400',
};

export default function ListViewTask({ task, selected, onClick }: Props) {
  const { archiveTask } = useTaskContext();

  function handleArchive(event: React.MouseEvent) {
    event.stopPropagation();
    archiveTask(task.id)
      .then(() => toast.success('Task archived'))
      .catch((error) => toast.error(error?.response?.data?.message ?? 'Failed to archive task'));
  }

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-sm ${
        selected
          ? 'border-cyan-500/50 bg-cyan-500/5'
          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
      }`}
    >
      {/* Checkbox */}
      <input
        type='checkbox'
        onClick={(e) => e.stopPropagation()}
        className='mt-1 h-4 w-4 flex-shrink-0 cursor-pointer accent-cyan-500'
      />

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <h3 className='font-semibold text-zinc-100'>{task.title}</h3>
            {task.status === 'done' && (
              <button
                type='button'
                onClick={handleArchive}
                aria-label={`Archive ${task.title}`}
                className='flex-shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
              >
                <Archive size={15} />
              </button>
            )}
          </div>
          <span className={`flex-shrink-0 rounded-md px-2.5 py-0.5 text-xs font-semibold ${
            priorityStyles[task.priority ?? 'Low']
          }`}>
            {task.priority} Priority
          </span>
        </div>

        {task.description && (
          <p className='mt-1 line-clamp-2 text-sm text-zinc-500'>
            {task.description}
          </p>
        )}

        {/* Footer row */}
        <div className='mt-3 flex items-center gap-4'>
          {/* Assignee */}
          {task.assignedTo && (
            <div className='flex items-center gap-1.5'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white'>
                {task.assignedTo.name.slice(0, 2).toUpperCase()}
              </div>
              <span className='text-xs text-zinc-500'>{task.assignedTo.name}</span>
            </div>
          )}

          {/* Due date */}
          <div className='flex items-center gap-1 text-xs text-zinc-500'>
            <CalendarDays size={13} />
            <span>{task.dueDate}</span>
          </div>

          {/* Progress */}
          {task.progress !== undefined && task.progress > 0 && (
            <div className='flex flex-1 items-center gap-2'>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-700'>
                <div
                  className='h-full rounded-full bg-cyan-500 transition-all'
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className='text-xs font-semibold text-cyan-400'>
                {task.progress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
