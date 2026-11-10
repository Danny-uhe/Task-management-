import { Award, CheckCircle2, Flame, Star, Target, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GamificationProfile } from '../services/leaderboard.service';

const icons: Record<string, LucideIcon> = {
  'five-day-streak': Flame,
  'task-master': CheckCircle2,
  'project-starter': Target,
  'completion-rate': Star,
  'speed-runner': Zap,
  'team-player': Award,
};

const colors: Record<string, { icon: string; background: string; border: string }> = {
  'five-day-streak': { icon: 'text-orange-500', background: 'bg-orange-50', border: 'border-orange-100' },
  'task-master': { icon: 'text-green-600', background: 'bg-green-50', border: 'border-green-100' },
  'project-starter': { icon: 'text-blue-500', background: 'bg-blue-50', border: 'border-blue-100' },
  'completion-rate': { icon: 'text-yellow-500', background: 'bg-yellow-50', border: 'border-yellow-100' },
  'speed-runner': { icon: 'text-purple-500', background: 'bg-purple-50', border: 'border-purple-100' },
  'team-player': { icon: 'text-teal-500', background: 'bg-teal-50', border: 'border-teal-100' },
};

export default function AchievementsSection({
  achievements,
}: {
  achievements: GamificationProfile['achievements'];
}) {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6'>
      <div className='mb-5'>
        <h2 className='text-xl font-bold text-gray-900'>Achievements</h2>
        <p className='mt-1 text-sm text-gray-500'>Milestones based on your saved task and activity data</p>
      </div>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {achievements.map((achievement) => {
          const Icon = icons[achievement.id] ?? Award;
          const color = colors[achievement.id] ?? colors['team-player'];
          return (
            <div
              key={achievement.id}
              className={`flex flex-col items-center rounded-xl border p-4 text-center transition-opacity ${
                achievement.unlocked
                  ? `${color.background} ${color.border}`
                  : 'border-gray-100 bg-gray-50 opacity-45'
              }`}
            >
              <div className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-full ${
                achievement.unlocked ? color.background : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${achievement.unlocked ? color.icon : 'text-gray-300'}`} />
              </div>
              <p className='text-sm font-semibold text-gray-900'>{achievement.label}</p>
              <p className='mt-0.5 text-xs text-gray-500'>{achievement.description}</p>
              {!achievement.unlocked && (
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
