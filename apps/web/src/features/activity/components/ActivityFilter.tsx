import { useState } from 'react';
import { Search } from 'lucide-react';

type Period = 'Today' | 'This Week' | 'This Month';

/* ── All activity items tagged by period ── */
type ActivityItem = {
  id: number;
  type: 'task' | 'reward' | 'project' | 'move';
  title: string;
  description: string;
  time: string;
  period: Period;
};

const ALL_ACTIVITY: ActivityItem[] = [
  /* Today */
  {
    id: 1,
    type: 'task',
    title: 'Completed Dashboard UI',
    description: 'You successfully completed the dashboard redesign.',
    time: '10 mins ago',
    period: 'Today',
  },
  {
    id: 2,
    type: 'reward',
    title: 'Earned 120 Points',
    description: "Points awarded for completing today's goals.",
    time: '35 mins ago',
    period: 'Today',
  },
  {
    id: 3,
    type: 'project',
    title: 'Created New Project',
    description: 'TaskSync SaaS project was created.',
    time: '2 hours ago',
    period: 'Today',
  },
  {
    id: 4,
    type: 'move',
    title: 'Moved Task to Completed',
    description: 'Authentication UI finished.',
    time: '4 hours ago',
    period: 'Today',
  },
  /* This Week */
  {
    id: 5,
    type: 'task',
    title: 'Completed Client Feedback Sync',
    description: 'Synced with the product team on client feedback.',
    time: 'Yesterday',
    period: 'This Week',
  },
  {
    id: 6,
    type: 'reward',
    title: 'Earned 80 Points',
    description: 'Points awarded for the onboarding checklist update.',
    time: 'Yesterday',
    period: 'This Week',
  },
  {
    id: 7,
    type: 'project',
    title: 'Added to Q4 Planning Project',
    description: 'Sarah Miller added you to the Q4 Planning project.',
    time: '2 days ago',
    period: 'This Week',
  },
  /* This Month */
  {
    id: 8,
    type: 'task',
    title: 'Completed Audit Spacing System',
    description: 'Full design system spacing audit completed.',
    time: 'Jun 30',
    period: 'This Month',
  },
  {
    id: 9,
    type: 'reward',
    title: 'Earned 200 Points',
    description: 'Monthly milestone bonus points awarded.',
    time: 'Jun 28',
    period: 'This Month',
  },
  {
    id: 10,
    type: 'move',
    title: 'Moved Task to In Review',
    description: 'Database migration strategy sent for review.',
    time: 'Jun 25',
    period: 'This Month',
  },
];

const periods: Period[] = ['Today', 'This Week', 'This Month'];

export default function ActivityFilter() {
  const [active, setActive] = useState<Period>('Today');
  const [search, setSearch] = useState('');

  /* Count per period */
  const counts = periods.reduce<Record<Period, number>>(
    (acc, p) => {
      acc[p] = ALL_ACTIVITY.filter((a) => a.period === p).length;
      return acc;
    },
    { Today: 0, 'This Week': 0, 'This Month': 0 },
  );

  /* Filter by active period + search */
  const visible = ALL_ACTIVITY.filter(
    (a) =>
      a.period === active &&
      (search === '' ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <>
      <div className='flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {periods.map((p) => (
            <button
              key={p}
              id={`activity-filter-${p.toLowerCase().replace(' ', '-')}-btn`}
              onClick={() => setActive(p)}
              className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                active === p
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
              {/* Red count badge */}
              <span
                className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  active === p
                    ? 'bg-white/30 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {counts[p]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className='relative w-full sm:w-64'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            size={16}
          />
          <input
            id='activity-search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search activity...'
            className='w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          />
        </div>
      </div>

      {/* Timeline for the active period */}
      <div className='space-y-4'>
        {visible.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-gray-400'>
            <p className='text-sm font-medium'>No activity in this period</p>
          </div>
        ) : (
          visible.map((item) => <ActivityRow key={item.id} item={item} />)
        )}
      </div>
    </>
  );
}

/* ── Individual activity row ── */
import {
  CheckCircle2,
  Trophy,
  FolderPlus,
  ArrowRightCircle,
} from 'lucide-react';

function ActivityRow({ item }: { item: ActivityItem }) {
  const iconMap = {
    task: { icon: CheckCircle2, bg: 'bg-green-100', color: 'text-green-600' },
    reward: { icon: Trophy, bg: 'bg-yellow-100', color: 'text-yellow-600' },
    project: { icon: FolderPlus, bg: 'bg-blue-100', color: 'text-blue-600' },
    move: {
      icon: ArrowRightCircle,
      bg: 'bg-slate-100',
      color: 'text-slate-600',
    },
  };

  const { icon: Icon, bg, color } = iconMap[item.type];

  return (
    <div className='flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md'>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}
      >
        <Icon size={18} className={color} />
      </div>

      <div className='flex-1'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h3 className='font-semibold text-slate-800'>{item.title}</h3>
            <p className='mt-0.5 text-sm text-gray-500'>{item.description}</p>
          </div>
          <span className='flex-shrink-0 text-sm text-gray-400'>{item.time}</span>
        </div>
      </div>
    </div>
  );
}