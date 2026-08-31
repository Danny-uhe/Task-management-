import { Search, List, LayoutGrid, X } from 'lucide-react';

type Props = {
  view: 'list' | 'board';
  onViewChange: (v: 'list' | 'board') => void;
  search: string;
  onSearchChange: (v: string) => void;
};

export default function TaskToolbar({ view, onViewChange, search, onSearchChange }: Props) {
  return (
    <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>

      {/* Left: search + view toggle */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Search */}
        <div className='relative'>
          <Search
            size={15}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            id='task-search'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search tasks...'
            className='h-10 w-full min-w-[180px] max-w-xs rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64'
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-600'
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* List / Board toggle */}
        <div className='flex rounded-xl border border-slate-200 bg-white p-1'>
          <button
            id='view-list-btn'
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
              view === 'list'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <List size={15} />
            List
          </button>

          <button
            id='view-board-btn'
            onClick={() => onViewChange('board')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
              view === 'board'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid size={15} />
            Board
          </button>
        </div>
      </div>

      {/* Right: assignee avatars + all members */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center -space-x-2'>
          {[
            { initials: 'RE', color: 'bg-blue-500' },
            { initials: 'CJ', color: 'bg-emerald-500' },
            { initials: 'RI', color: 'bg-purple-500' },
            { initials: 'ST', color: 'bg-amber-500' },
            { initials: '+3', color: 'bg-red-500' },
          ].map((a) => (
            <div
              key={a.initials}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white sm:h-8 sm:w-8 ${a.color}`}
            >
              {a.initials}
            </div>
          ))}
        </div>

        <button
          id='all-members-btn'
          className='rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 sm:px-4 sm:text-sm'
        >
          All members
        </button>
      </div>
    </div>
  );
}