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
            className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500'
          />
          <input
            id='task-search'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search tasks...'
            className='h-10 w-full min-w-[180px] max-w-xs rounded-xl border border-zinc-700 bg-zinc-800 pl-9 pr-8 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/20 sm:w-64'
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded text-zinc-500 hover:text-zinc-300'
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* List / Board toggle */}
        <div className='flex rounded-xl border border-zinc-700 bg-zinc-800 p-1'>
          <button
            id='view-list-btn'
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
              view === 'list'
                ? 'bg-zinc-600 text-white'
                : 'text-zinc-500 hover:bg-zinc-700'
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
                ? 'bg-zinc-600 text-white'
                : 'text-zinc-500 hover:bg-zinc-700'
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
            { initials: 'RE', color: 'bg-cyan-500' },
            { initials: 'CJ', color: 'bg-emerald-500' },
            { initials: 'RI', color: 'bg-purple-500' },
            { initials: 'ST', color: 'bg-amber-500' },
            { initials: '+3', color: 'bg-red-500' },
          ].map((a) => (
            <div
              key={a.initials}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-zinc-900 sm:h-8 sm:w-8 ${a.color}`}
            >
              {a.initials}
            </div>
          ))}
        </div>

        <button
          id='all-members-btn'
          className='rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 sm:px-4 sm:text-sm'
        >
          All members
        </button>
      </div>
    </div>
  );
}
