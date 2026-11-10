import { useLocation } from 'react-router-dom';
import { Bell, Building2, Menu, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';

import NotificationDropdown from './NotificationDropdown';
import { useUserProfile } from '@/app/Providers/UserProfileContext';
import { useTaskContext } from '@/app/Providers/TaskContext';
import { useNotifications } from '@/app/Providers/NotificationContext';

type Props = {
  onMenuClick: () => void;
};

/* ─── Leaderboard profile banner ─── */
function LeaderboardProfileBanner() {
  const { avatarUrl, name, role, openAvatarPicker } = useUserProfile();

  return (
    <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-3 sm:gap-4'>
        <button
          type='button'
          onClick={openAvatarPicker}
          title='Change profile photo'
          className='relative flex-shrink-0'
        >
          <img
            src={avatarUrl}
            alt={name}
            className='h-12 w-12 rounded-full object-cover ring-2 ring-cyan-400/40 sm:h-14 sm:w-14'
          />
          <span className='absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[8px] text-white ring-1 ring-white'>
            ✎
          </span>
        </button>

        <div>
          <h1 className='text-lg font-bold text-gray-900 sm:text-2xl'>{name}</h1>
          <div className='mt-1 flex flex-wrap items-center gap-2 sm:gap-3'>
            <span className='rounded-full bg-cyan-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-cyan-800'>
              {role}
            </span>
            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <Building2 className='h-3.5 w-3.5' />
              Experience &amp; Interface Team
            </span>
          </div>
        </div>
      </div>

      <button
        id='edit-profile-btn'
        className='flex w-fit items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-600 active:scale-95 sm:px-5 sm:py-2.5'
      >
        <Pencil className='h-4 w-4' />
        Edit Profile
      </button>
    </div>
  );
}

/* ─── Main header ─── */
export default function AppHeader({ onMenuClick }: Props) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { avatarUrl, name } = useUserProfile();
  const { openAddTask } = useTaskContext();
  const { unreadCount } = useNotifications();

  const isLeaderboard = location.pathname === '/leaderboard';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const pages: Record<string, { title: string; subtitle: string; action: string }> = {
    '/dashboard': {
      title: `Good morning, ${name.split(' ')[0]} 👋`,
      subtitle: today,
      action: 'profile',
    },
    '/tasks': {
      title: 'Tasks',
      subtitle: 'Manage your daily flow and team assignments',
      action: 'task',
    },
    '/leaderboard': { title: '', subtitle: '', action: 'leaderboard-profile' },
    '/activity': {
      title: 'Activity',
      subtitle: 'Workspace activity',
      action: 'profile',
    },
    '/archived': {
      title: 'Archived',
      subtitle: 'Completed tasks',
      action: 'profile',
    },
    '/settings': {
      title: 'Settings',
      subtitle: 'Manage your account',
      action: 'edit',
    },
  };

  const current = pages[location.pathname];

  /* Leaderboard: full-width profile banner */
  if (isLeaderboard) {
    return (
      <header className='fixed left-0 right-0 top-0 z-30 flex min-h-16 items-center border-b border-zinc-200 bg-white px-4 sm:px-6 lg:left-64 lg:min-h-20 lg:px-8'>
        <button
          onClick={onMenuClick}
          className='mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden'
        >
          <Menu size={20} />
        </button>
        <LeaderboardProfileBanner />
      </header>
    );
  }

  return (
    <header className='fixed left-0 right-0 top-0 z-30 flex min-h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm sm:px-6 lg:left-64 lg:min-h-20 lg:px-8'>
      {/* Left: hamburger (mobile) + title */}
      <div className='flex items-center gap-3'>
        <button
          onClick={onMenuClick}
          id='sidebar-hamburger-btn'
          className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden'
        >
          <Menu size={20} />
        </button>

        <div className='min-w-0'>
          <h1 className='truncate text-lg font-bold text-zinc-900 sm:text-2xl lg:text-3xl'>
            {current?.title}
          </h1>
          <p className='hidden text-xs text-zinc-400 sm:block sm:text-sm'>
            {current?.subtitle}
          </p>
        </div>
      </div>

      {/* Right: contextual actions */}
      <div className='flex flex-shrink-0 items-center gap-3 sm:gap-4'>
        {/* Notification bell */}
        <div className='relative'>
          <button
            id='notification-bell-btn'
            onClick={() => setNotifOpen(!notifOpen)}
            className='relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:border-cyan-400 hover:text-cyan-500 sm:h-10 sm:w-10'
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white sm:h-5 sm:w-5 sm:text-xs'>
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationDropdown />}
        </div>

        {/* Profile avatar */}
        {(current?.action === 'profile' || current?.action === 'edit') && (
          <img
            src={avatarUrl}
            alt={name}
            className='h-9 w-9 rounded-full object-cover ring-2 ring-cyan-400/40 sm:h-10 sm:w-10'
          />
        )}

        {/* Add Task button */}
        {current?.action === 'task' && (
          <button
            id='add-task-btn'
            onClick={openAddTask}
            className='flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-600 active:scale-95 sm:gap-2 sm:px-4 sm:py-2.5'
          >
            <Plus size={16} />
            <span className='hidden sm:inline'>Add Task</span>
            <span className='sm:hidden'>Add</span>
          </button>
        )}
      </div>
    </header>
  );
}
