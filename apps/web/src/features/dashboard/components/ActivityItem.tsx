import { CheckCircle2, Coins, UserPlus } from 'lucide-react';

type ActivityItemProps = {
  type: 'completed' | 'points' | 'member';
  title: string;
  time: string;
};

export default function ActivityItem({ type, title, time }: ActivityItemProps) {
  const icon =
    type === 'completed' ? (
      <CheckCircle2 className='h-5 w-5 text-green-500' />
    ) : type === 'points' ? (
      <Coins className='h-5 w-5 text-blue-500' />
    ) : (
      <UserPlus className='h-5 w-5 text-orange-500' />
    );

  return (
    <div className='flex items-center justify-between py-3'>
      <div className='flex items-center gap-3'>
        {icon}

        <p className='text-sm text-slate-700'>{title}</p>
      </div>

      <span className='text-sm text-slate-400'>{time}</span>
    </div>
  );
}
