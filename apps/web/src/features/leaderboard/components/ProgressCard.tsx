import { Lock } from 'lucide-react';
import { useTaskContext } from '@/app/Providers/TaskContext';
import { useUserProfile } from '@/app/Providers/UserProfileContext';
import { useAuthStore } from '@/store/authStore';

export default function ProgressCard() {
  const { tasks }    = useTaskContext();
  const { streak }   = useUserProfile();
  const currentUser  = useAuthStore((s) => s.user);

  const myTasks      = tasks.filter((t) => t.assignedToId === currentUser?.id);
  const done         = myTasks.filter((t) => t.status === 'done').length;
  const total        = myTasks.length;
  const rate         = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>Your progress</h2>
        <p className='mt-1 text-sm text-gray-500'>
          Personal — only visible to you unless you choose to share it
        </p>
      </div>

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>Tasks Done</p>
          <p className='mt-1.5 text-2xl font-extrabold text-gray-900'>{done} / {total} assigned</p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>Completion Rate</p>
          <p className='mt-1.5 text-2xl font-extrabold text-gray-900'>{rate}%</p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>Current Streak</p>
          <p className='mt-1.5 text-2xl font-extrabold text-orange-500'>{streak} days</p>
        </div>
      </div>

      <div className='mt-6 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4'>
        <Lock className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
        <p className='text-sm text-gray-500'>
          Streaks and completion rate are private by default. Turn on sharing
          below if you want your team to see them.
        </p>
      </div>
    </div>
  );
}

