import { X, Calendar, User, Flag } from 'lucide-react';
import type { Task } from '../types/types';

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
};

export default function TaskDetailsDrawer({ open, task, onClose }: Props) {
  if (!open || !task) return null;

  return (
    <>
      <div onClick={onClose} className='fixed inset-0 z-40 bg-black/40' />

      <div className='fixed right-0 top-0 z-50 flex h-screen w-[420px] flex-col bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b p-6'>
          <h2 className='text-xl font-bold'>Task Details</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className='space-y-6 overflow-y-auto p-6'>
          <div>
            <h3 className='text-2xl font-bold'>{task.title}</h3>

            <p className='mt-2 text-slate-500'>{task.description}</p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Flag size={18} />
              <span>{task.priority}</span>
            </div>

            <div className='flex items-center gap-3'>
              <Calendar size={18} />
              <span>{task.dueDate}</span>
            </div>

            <div className='flex items-center gap-3'>
              <User size={18} />
              <span>{task.assignee}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
