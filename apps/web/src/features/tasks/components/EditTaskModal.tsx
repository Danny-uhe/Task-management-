import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task, TaskStatus, TaskPriority } from '../types/types';
import { useTaskContext } from '@/app/Providers/TaskContext';

type Props = {
  open:    boolean;
  task:    Task | null;
  onClose: () => void;
};

const priorities: { value: TaskPriority; label: string; dot: string }[] = [
  { value: 'high',   label: 'High',   dot: 'bg-red-500'    },
  { value: 'medium', label: 'Medium', dot: 'bg-orange-400' },
  { value: 'low',    label: 'Low',    dot: 'bg-slate-400'  },
];

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review',   label: 'In Review'   },
  { value: 'done',        label: 'Done'        },
];

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400';

export default function EditTaskModal({ open, task, onClose }: Props) {
  const { updateTask } = useTaskContext();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState<TaskPriority>('medium');
  const [status,      setStatus]      = useState<TaskStatus>('todo');
  const [dueDate,     setDueDate]     = useState('');
  const [saving,      setSaving]      = useState(false);

  /* Pre-fill when task changes */
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority ?? 'medium');
      setStatus(task.status  ?? 'todo');
      // dueDate from API is ISO string — extract date part for the input
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateTask({
        ...task,
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate:     dueDate || undefined,
      });
      toast.success('Task updated');
      onClose();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to save task'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <div className='w-full max-w-lg rounded-2xl bg-white shadow-2xl'>

        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <h2 className='text-lg font-bold text-slate-900'>Edit Task</h2>
          <button onClick={onClose} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='space-y-4 px-6 py-5'>
          <div>
            <label className={labelClass}>Task Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder='Task title'
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder='Describe the task...'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            {/* Priority */}
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={inputClass}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={inputClass}
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Due Date</label>
            <input
              type='date'
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 border-t border-slate-100 px-6 py-4'>
          <button
            onClick={onClose}
            className='rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className='rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40'
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
