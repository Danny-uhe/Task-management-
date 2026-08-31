import { Flame, CheckCircle2, Target, Star, Zap, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Achievement = {
  id: number;
  icon: LucideIcon;
  label: string;
  description: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  unlocked: boolean;
};

const achievements: Achievement[] = [
  {
    id: 1,
    icon: Flame,
    label: '5-Day Streak',
    description: 'Consistent daily activity',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100',
    unlocked: true,
  },
  {
    id: 2,
    icon: CheckCircle2,
    label: 'Task Master',
    description: '20 tasks completed',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    unlocked: true,
  },
  {
    id: 3,
    icon: Target,
    label: 'Goal Setter',
    description: 'Set your first monthly goal',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    unlocked: true,
  },
  {
    id: 4,
    icon: Star,
    label: '92% Rate',
    description: 'Outstanding completion',
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-100',
    unlocked: true,
  },
  {
    id: 5,
    icon: Zap,
    label: 'Speed Runner',
    description: '5 tasks in one day',
    iconColor: 'text-gray-300',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-100',
    unlocked: false,
  },
  {
    id: 6,
    icon: Award,
    label: 'Team Player',
    description: 'Collaborate on 10 tasks',
    iconColor: 'text-gray-300',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-100',
    unlocked: false,
  },
];

export default function AchievementsSection() {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6'>
      {/* Header */}
      <div className='mb-5'>
        <h2 className='text-xl font-bold text-gray-900'>Achievements</h2>
        <p className='mt-1 text-sm text-gray-500'>
          Personal milestones — never tied to task points
        </p>
      </div>

      {/* Badge grid */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className={`flex flex-col items-center rounded-xl border p-4 text-center transition-opacity ${
                a.unlocked
                  ? `${a.bgColor} ${a.borderColor}`
                  : 'border-gray-100 bg-gray-50 opacity-45'
              }`}
            >
              <div
                className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-full ${
                  a.unlocked ? a.bgColor : 'bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${a.iconColor}`} />
              </div>
              <p className='text-sm font-semibold text-gray-900'>{a.label}</p>
              <p className='mt-0.5 text-xs text-gray-500'>{a.description}</p>
              {!a.unlocked && (
                <span className='mt-2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-400'>
                  Locked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
