import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  CalendarDays,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import type { Task, TaskStatus } from '../types/types';
import { STATUS_LABELS } from '../types/types';
import { useTaskContext } from '@/app/Providers/TaskContext';
import toast from 'react-hot-toast';

type Props = {
  task: Task;
  onClick: (task: Task) => void;
  onEdit?: (task: Task) => void;
};

const OTHER_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];

export default function TaskBoardCard({ task, onClick, onEdit }: Props) {
  const { moveTask, deleteTask } = useTaskContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors: Record<string, string> = {
    high:   'bg-red-100 text-red-600',
    medium: 'bg-orange-100 text-orange-500',
    low:    'bg-slate-100 text-slate-500',
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Delete "${task.title}"?`)) {
      deleteTask(task.projectId, task.id).catch(() =>
        toast.error('Failed to delete task'),
      );
    }
  }

  function handleMoveTo(e: React.MouseEvent, status: TaskStatus) {
    e.stopPropagation();
    setMenuOpen(false);
    moveTask(task.id, status);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.(task);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      className='relative cursor-grab rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing'
    >
      <div className='flex items-start justify-between gap-2'>
        <h3 className='font-semibold text-slate-800'>{task.title}</h3>

        {/* Three-dot menu trigger */}
        <div ref={menuRef} className='relative shrink-0'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className='rounded p-0.5 text-gray-400 hover:bg-slate-100 hover:text-slate-600'
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className='absolute right-0 top-6 z-50 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg'>
              {/* Edit */}
              {onEdit && (
                <button
                  type='button'
                  onClick={handleEdit}
                  className='flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'
                >
                  <Pencil size={14} />
                  Edit task
                </button>
              )}

              {/* Move to */}
              {OTHER_STATUSES.filter((s) => s !== task.status).map((s) => (
                <button
                  key={s}
                  type='button'
                  onClick={(e) => handleMoveTo(e, s)}
                  className='flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'
                >
                  <ArrowRight size={14} />
                  Move to {STATUS_LABELS[s]}
                </button>
              ))}

              <div className='my-1 border-t border-gray-100' />

              {/* Delete */}
              <button
                type='button'
                onClick={handleDelete}
                className='flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50'
              >
                <Trash2 size={14} />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className='mt-1.5 line-clamp-2 text-xs text-slate-500'>
          {task.description}
        </p>
      )}

      <div className='mt-4 flex items-center justify-between'>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityColors[task.priority ?? 'low']}`}
        >
          {task.priority}
        </span>

        <div className='flex items-center gap-1 text-xs text-slate-400'>
          <CalendarDays size={13} />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
        </div>
      </div>
    </div>
  );
}
