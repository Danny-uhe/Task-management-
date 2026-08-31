import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useUserProfile } from '@/app/Providers/UserProfileContext';

export default function PointsToast() {
  const { lastEarned, clearLastEarned, points } = useUserProfile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastEarned) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(clearLastEarned, 300); /* clear after fade */
    }, 2500);
    return () => clearTimeout(t);
  }, [lastEarned]);

  if (!lastEarned) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 shadow-2xl transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400'>
        <Zap size={16} className='text-slate-900' fill='currentColor' />
      </div>
      <div>
        <p className='text-sm font-bold text-white'>
          +{lastEarned.amount} points earned!
        </p>
        <p className='text-xs text-slate-400'>{lastEarned.reason}</p>
      </div>
      <div className='ml-2 text-right'>
        <p className='text-xs font-semibold text-yellow-400'>{points.toLocaleString()} total</p>
      </div>
    </div>
  );
}
