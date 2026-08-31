import { CalendarDays } from 'lucide-react';
import type { Task } from '../types/types';

type Props = {
  task: Task;
  selected: boolean;
  onClick: () => void;
};

const priorityStyles: Record<string, string> = {
  High: 'bg-red-50 text-red-600',
  Medium: 'bg-orange-50 text-orange-500',
  Low: 'bg-slate-100 text-slate-500',
};

export default function ListViewTask({ task, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-sm ${
        selected
          ? 'border-blue-300 bg-blue-50/40'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Checkbox */}
      <input
        type='checkbox'
        onClick={(e) => e.stopPropagation()}
        className='mt-1 h-4 w-4 flex-shrink-0 cursor-pointer accent-blue-500'
      />

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <h3 className='font-semibold text-slate-800'>{task.title}</h3>
          <span
            className={`flex-shrink-0 rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              priorityStyles[task.priority ?? 'Low']
            }`}
          >
            {task.priority} Priority
          </span>
        </div>

        {task.description && (
          <p className='mt-1 line-clamp-2 text-sm text-slate-500'>
            {task.description}
          </p>
        )}

        {/* Footer row */}
        <div className='mt-3 flex items-center gap-4'>
          {/* Assignee */}
          {task.assignee && (
            <div className='flex items-center gap-1.5'>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${task.assigneeColor ?? 'bg-blue-500'}`}
              >
                {task.assignee.slice(0, 2).toUpperCase()}
              </div>
              <span className='text-xs text-slate-500'>{task.assignee}</span>
            </div>
          )}

          {/* Due date */}
          <div className='flex items-center gap-1 text-xs text-slate-400'>
            <CalendarDays size={13} />
            <span>{task.dueDate}</span>
          </div>

          {/* Progress */}
          {task.progress !== undefined && task.progress > 0 && (
            <div className='flex flex-1 items-center gap-2'>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full bg-blue-500 transition-all'
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className='text-xs font-semibold text-blue-500'>
                {task.progress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
