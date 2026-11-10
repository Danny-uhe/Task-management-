import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X, LayoutDashboard, ClipboardList, Trophy, Activity,
  Archive, Settings, LogOut, CircleHelp, Users, Building2,
} from 'lucide-react';

import type { AppLayoutProps } from './AppLayout.types';
import AppHeader   from './AppHeader';
import AddTaskModal from '@/features/tasks/components/AddTaskModal';
import PointsToast  from '@/features/shared/PointsToast';
import { useAuthStore }    from '@/store/authStore';
import { authService }     from '@/features/auth/services/auth.services';
import { useProjectStore } from '@/store/projectStore';
import ProjectSwitcher     from '@/features/projects/components/ProjectSwitcher';

const allNavItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    adminOnly: false },
  { to: '/tasks',        icon: ClipboardList,   label: 'All Tasks',    adminOnly: false },
  { to: '/members',      icon: Users,           label: 'Members',      adminOnly: false },
  { to: '/leaderboard',  icon: Trophy,          label: 'Leaderboard',  adminOnly: false },
  { to: '/activity',     icon: Activity,        label: 'Activity',     adminOnly: false },
  { to: '/organisation', icon: Building2,       label: 'Organisation', adminOnly: true  },
  { to: '/archived',     icon: Archive,         label: 'Archived',     adminOnly: false },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate  = useNavigate();
  const { user, refreshToken, clearAuth } = useAuthStore();
  const isAdmin   = user?.systemRole === 'admin';
  const fetchProjects = useProjectStore((s) => s.fetchProjects);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // If API fails, still clear locally
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/10'
        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className='flex h-full flex-col bg-zinc-900'>
      {/* Logo */}
      <div className='flex h-20 flex-shrink-0 items-center justify-between border-b border-white/5 px-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>
            Task<span className='text-cyan-400'>Sync</span>
          </h1>
          <span className='text-[10px] uppercase tracking-[3px] text-zinc-500'>
            Workspace
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 lg:hidden'
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Project Switcher */}
      <div className='border-b border-white/5 py-3'>
        <ProjectSwitcher />
      </div>

      {/* Nav */}
      <nav className='flex-1 space-y-0.5 px-3 py-5'>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className='space-y-0.5 border-t border-white/5 px-3 py-4'>
        <NavLink to='/settings' className={linkClass} onClick={onClose}>
          <Settings size={18} />
          Settings
        </NavLink>

        <button className='flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white'>
          <CircleHelp size={18} />
          Support
        </button>

        <button
          onClick={handleLogout}
          className='flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300'
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-slate-100'>

      {/* ── DESKTOP SIDEBAR ─── */}
      <aside className='fixed left-0 top-0 hidden h-screen w-64 flex-col lg:flex'>
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY ─── */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ─── */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── MAIN ─── */}
      <div className='flex flex-1 flex-col lg:ml-64'>
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className='mt-16 flex-1 overflow-y-auto p-4 sm:p-6 lg:mt-20 lg:p-8'>
          {children}
        </main>
      </div>

      {/* ── GLOBAL MODALS & TOASTS ── */}
      <AddTaskModal />
      <PointsToast />
    </div>
  );
}
