import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Clock, Eye, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

type TaskCardProps = {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const priorityStyles: Record<string, string> = {
  High:   'bg-red-500/10 text-red-400',
  Medium: 'bg-amber-500/10 text-amber-400',
  Low:    'bg-zinc-700 text-zinc-400',
};

export default function TaskCard({ title, priority, time, onView, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [done,     setDone]       = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    { icon: Eye,          label: 'View task',    action: onView,              style: 'text-zinc-300' },
    { icon: Pencil,       label: 'Edit task',    action: onEdit,              style: 'text-zinc-300' },
    { icon: CheckCircle2, label: 'Mark as done', action: () => setDone(true), style: 'text-green-400' },
    { icon: Trash2,       label: 'Delete',       action: onDelete,            style: 'text-red-400'  },
  ];

  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm ${
      done ? 'border-zinc-700 bg-zinc-800 opacity-60' : 'border-zinc-700 bg-zinc-800'
    }`}>
      {/* Left: checkbox + text */}
      <div className='flex items-start gap-3'>
        <button
          onClick={() => setDone(!done)}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
            done ? 'border-cyan-500 bg-cyan-500' : 'border-zinc-600 bg-zinc-700'
          }`}
        >
          {done && (
            <svg className='h-3 w-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
          )}
        </button>

        <div>
          <h3 className={`font-medium ${done ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
            {title}
          </h3>
          <div className='mt-1.5 flex items-center gap-3'>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityStyles[priority]}`}>
              {priority}
            </span>
            <div className='flex items-center gap-1 text-xs text-zinc-500'>
              <Clock size={12} />
              {time}
            </div>
          </div>
        </div>
      </div>

      {/* Three-dot menu */}
      <div className='relative' ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className='rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && (
          <div className='absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-zinc-700 bg-zinc-800 py-1 shadow-xl'>
            {menuItems.map(({ icon: Icon, label, action, style }) => (
              <button
                key={label}
                onClick={() => {
                  setMenuOpen(false);
                  action?.();
                }}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-700 ${style}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
