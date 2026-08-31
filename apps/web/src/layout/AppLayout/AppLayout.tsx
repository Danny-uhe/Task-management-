import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, ClipboardList, Trophy, Activity, Archive, Settings, LogOut, CircleHelp, Users, Building2 } from 'lucide-react';

import type { AppLayoutProps } from './AppLayout.types';
import AppHeader from './AppHeader';
import AddTaskModal from '@/features/tasks/components/AddTaskModal';
import PointsToast from '@/features/shared/PointsToast';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/tasks',        icon: ClipboardList,   label: 'All Tasks'    },
  { to: '/members',      icon: Users,           label: 'Members'      },
  { to: '/leaderboard',  icon: Trophy,          label: 'Leaderboard'  },
  { to: '/activity',     icon: Activity,        label: 'Activity'     },
  { to: '/organisation', icon: Building2,       label: 'Organisation' },
  { to: '/archived',     icon: Archive,         label: 'Archived'     },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <div className='flex h-full flex-col'>
      {/* Logo */}
      <div className='flex h-20 flex-shrink-0 items-center justify-between border-b border-gray-200 px-6'>
        <div>
          <h1 className='text-2xl font-bold text-blue-600'>TaskSync</h1>
          <span className='text-[10px] uppercase tracking-[3px] text-gray-400'>
            Workspace
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden'
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className='flex-1 space-y-1 px-4 py-5'>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className='space-y-1 border-t border-gray-200 px-4 py-4'>
        <NavLink to='/settings' className={linkClass} onClick={onClose}>
          <Settings size={20} />
          Settings
        </NavLink>

        <button className='flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100'>
          <CircleHelp size={20} />
          Support
        </button>

        <button
          onClick={handleLogout}
          className='flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50'
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-slate-50'>

      {/* ── DESKTOP SIDEBAR ─── */}
      <aside className='fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-gray-200 bg-white lg:flex'>
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY ─── */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ─── */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── MAIN ─── */}
      <div className='flex flex-1 flex-col lg:ml-72'>
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className='mt-16 flex-1 overflow-y-auto p-4 sm:p-6 lg:mt-24 lg:p-8'>
          {children}
        </main>
      </div>

      {/* ── GLOBAL MODALS & TOASTS ── */}
      <AddTaskModal />
      <PointsToast />
    </div>
  );
}
