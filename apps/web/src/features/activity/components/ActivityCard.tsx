import { CheckCircle2, Trophy, FolderPlus } from 'lucide-react';

type Props = {
  type: 'task' | 'reward' | 'project';
  title: string;
  description: string;
  time: string;
};

export default function ActivityCard({
  type,
  title,
  description,
  time,
}: Props) {
  const icon =
    type === 'task' ? (
      <CheckCircle2 className='text-green-500' />
    ) : type === 'reward' ? (
      <Trophy className='text-yellow-500' />
    ) : (
      <FolderPlus className='text-blue-500' />
    );

  return (
    <div className='flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
      <div className='mt-1'>{icon}</div>

      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold'>{title}</h3>

          <span className='text-sm text-gray-400'>{time}</span>
        </div>

        <p className='mt-2 text-sm text-gray-500'>{description}</p>
      </div>
    </div>
  );
}
