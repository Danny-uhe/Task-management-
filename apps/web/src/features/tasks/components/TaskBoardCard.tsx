import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  CalendarDays,
  Archive,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
  CheckCircle2,
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

const ALL_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];

export default function TaskBoardCard({ task, onClick, onEdit }: Props) {
  const { moveTask, deleteTask, archiveTask, canApprove } = useTaskContext();
  const isApprover = canApprove(task.projectId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors: Record<string, string> = {
    high:   'bg-red-500/10 text-red-400',
    medium: 'bg-amber-500/10 text-amber-400',
    low:    'bg-zinc-700 text-zinc-400',
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

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    archiveTask(task.id)
      .then(() => toast.success('Task archived'))
      .catch((error) => toast.error(error?.response?.data?.message ?? 'Failed to archive task'));
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

  // Statuses this user can move to (non-admins can't move to "done")
  const movableStatuses = ALL_STATUSES.filter(
    (s) => s !== task.status && (s !== 'done' || isApprover),
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      className='relative cursor-grab rounded-xl border border-zinc-700 bg-zinc-800 p-4 shadow-sm transition hover:border-zinc-600 hover:shadow-md active:cursor-grabbing'
    >
      <div className='flex items-start justify-between gap-2'>
        <h3 className='font-semibold text-zinc-100'>{task.title}</h3>

        {/* Three-dot menu trigger */}
        <div ref={menuRef} className='relative shrink-0'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className='rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className='absolute right-0 top-6 z-50 w-48 rounded-xl border border-zinc-700 bg-zinc-800 py-1 shadow-lg'>
              {/* Edit */}
              {onEdit && (
                <button
                  type='button'
                  onClick={handleEdit}
                  className='flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700'
                >
                  <Pencil size={14} />
                  Edit task
                </button>
              )}

              {/* Move to */}
              {movableStatuses.map((s) => (
                <button
                  key={s}
                  type='button'
                  onClick={(e) => handleMoveTo(e, s)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700 ${
                    s === 'done' ? 'text-green-400' : 'text-zinc-300'
                  }`}
                >
                  {s === 'done' ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
                  {s === 'done' ? 'Approve (Mark Done)' : `Move to ${STATUS_LABELS[s]}`}
                </button>
              ))}

              {/* Hint for non-admins when task is in_review */}
              {!isApprover && task.status === 'in_review' && (
                <p className='px-3 py-2 text-xs text-amber-400'>
                  Waiting for admin approval
                </p>
              )}

              {/* Hint to submit for review */}
              {!isApprover && task.status !== 'in_review' && task.status !== 'done' && (
                <button
                  type='button'
                  onClick={(e) => handleMoveTo(e, 'in_review')}
                  className='flex w-full items-center gap-2 border-t border-zinc-700 px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10'
                >
                  <CheckCircle2 size={14} />
                  Submit for review
                </button>
              )}

              <div className='my-1 border-t border-zinc-700' />

              {task.status === 'done' && (
                <button
                  type='button'
                  onClick={handleArchive}
                  className='flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700'
                >
                  <Archive size={14} />
                  Archive task
                </button>
              )}

              {/* Delete */}
              <button
                type='button'
                onClick={handleDelete}
                className='flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10'
              >
                <Trash2 size={14} />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className='mt-1.5 line-clamp-2 text-xs text-zinc-500'>
          {task.description}
        </p>
      )}

      <div className='mt-4 flex items-center justify-between'>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityColors[task.priority ?? 'low']}`}
        >
          {task.priority}
        </span>

        <div className='flex items-center gap-1 text-xs text-zinc-500'>
          <CalendarDays size={13} />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
        </div>
      </div>
    </div>
  );
}
