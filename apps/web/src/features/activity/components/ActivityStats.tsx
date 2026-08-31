import { CheckCircle2, Clock3, Trophy } from 'lucide-react';

const stats = [
  {
    title: 'Completed Today',
    value: '12',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: 'Hours Worked',
    value: '6.5',
    icon: Clock3,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Points Earned',
    value: '250',
    icon: Trophy,
    color: 'bg-yellow-100 text-yellow-600',
  },
];

export default function ActivityStats() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6'>
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{item.title}</p>
                <h2 className='mt-2 text-3xl font-bold'>{item.value}</h2>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} sm:h-12 sm:w-12`}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
