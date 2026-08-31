import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Task } from '../types/types';

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updated: Task) => void;
};

const priorities = ['Low', 'Medium', 'High'] as const;

export default function EditTaskModal({ open, task, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');

  /* Pre-fill when task changes */
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority ?? 'Medium');
      setDueDate(task.dueDate ?? '');
      setAssignee(task.assignee ?? '');
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...task, title, description, priority, dueDate, assignee });
    onClose();
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  const labelClass =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <div className='w-full max-w-lg rounded-2xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <h2 className='text-lg font-bold text-slate-900'>Edit Task</h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='space-y-4 px-6 py-5'>
          <div>
            <label className={labelClass}>Task Title</label>
            <input
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
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className={inputClass}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
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

          <div>
            <label className={labelClass}>Assignee</label>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className={inputClass}
              placeholder='Name or team'
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
            className='rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
