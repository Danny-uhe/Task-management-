import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, MoreVertical } from 'lucide-react';
import type { Task } from '../types/types';

type Props = {
  task: Task;
  onClick: (task: Task) => void;
};

export default function TaskBoardCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-orange-100 text-orange-500',
    Low: 'bg-slate-100 text-slate-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      className='cursor-grab rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing'
    >
      <div className='flex items-start justify-between gap-2'>
        <h3 className='font-semibold text-slate-800'>{task.title}</h3>
        <button type='button' onClick={(e) => e.stopPropagation()}>
          <MoreVertical size={16} className='text-gray-400' />
        </button>
      </div>

      {task.description && (
        <p className='mt-1.5 line-clamp-2 text-xs text-slate-500'>
          {task.description}
        </p>
      )}

      <div className='mt-4 flex items-center justify-between'>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityColors[task.priority ?? 'Low']}`}
        >
          {task.priority}
        </span>

        <div className='flex items-center gap-1 text-xs text-slate-400'>
          <CalendarDays size={13} />
          {task.dueDate}
        </div>
      </div>
    </div>
  );
}
