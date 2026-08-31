import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, ClipboardList, Zap, Flame, Trophy, MessageCircle } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';
import MessageModal from '../components/MessageModal';

type Status = 'online' | 'away' | 'offline';
type Role   = 'Owner' | 'Admin' | 'Member' | 'Viewer';

type MemberProfile = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  color: string;
  initials: string;
  title: string;
  bio: string;
  points: number;
  rank: number;
  streak: number;
  tasksCompleted: number;
  tasksAssigned: number;
  joinedAt: string;
  recentTasks: { id: number; title: string; status: string; priority: string; due: string }[];
  activity: { id: number; text: string; time: string }[];
};

const PROFILES: Record<number, MemberProfile> = {
  1: {
    id: 1, name: 'Relentless Inivie', email: 'inivie@tasksync.io',
    role: 'Owner', status: 'online', color: 'bg-blue-500', initials: 'RI',
    title: 'Product Designer', bio: 'Building TaskSync from the ground up. Obsessed with clean UI and great DX.',
    points: 2840, rank: 1, streak: 12, tasksCompleted: 34, tasksAssigned: 12, joinedAt: 'January 2026',
    recentTasks: [
      { id: 1, title: 'Redesign Dashboard UI',   status: 'completed', priority: 'High',   due: 'Jul 20' },
      { id: 2, title: 'Auth Flow Implementation', status: 'progress',  priority: 'High',   due: 'Jul 25' },
      { id: 3, title: 'Settings Page Polish',     status: 'todo',      priority: 'Medium', due: 'Jul 30' },
    ],
    activity: [
      { id: 1, text: 'Completed "Redesign Dashboard UI"',     time: '2h ago'    },
      { id: 2, text: 'Assigned "Auth Flow" to Dev Team',      time: '5h ago'    },
      { id: 3, text: 'Reached 12-day streak 🔥',              time: 'Yesterday' },
    ],
  },
  2: {
    id: 2, name: 'Sarah Miller', email: 'sarah@tasksync.io',
    role: 'Admin', status: 'online', color: 'bg-purple-500', initials: 'SM',
    title: 'Project Manager', bio: 'Keeping the team organised and shipping on time. Lover of good process.',
    points: 2210, rank: 2, streak: 7, tasksCompleted: 28, tasksAssigned: 9, joinedAt: 'February 2026',
    recentTasks: [
      { id: 4, title: 'Q4 Planning Deck',      status: 'progress',  priority: 'High',   due: 'Jul 28' },
      { id: 5, title: 'Client Feedback Sync',  status: 'todo',      priority: 'Medium', due: 'Aug 1'  },
    ],
    activity: [
      { id: 4, text: 'Assigned "Q4 Planning Deck" to Relentless I.', time: '1h ago'    },
      { id: 5, text: 'Completed "Team Standup Notes"',               time: '3h ago'    },
      { id: 6, text: 'Left a comment on "Auth Flow"',                time: 'Yesterday' },
    ],
  },
};

/* fallback profile for unknown ids */
const FALLBACK: MemberProfile = {
  id: 99, name: 'Team Member', email: 'member@tasksync.io',
  role: 'Member', status: 'offline', color: 'bg-slate-500', initials: 'TM',
  title: 'Team Member', bio: 'Part of the TaskSync team.',
  points: 500, rank: 5, streak: 2, tasksCompleted: 8, tasksAssigned: 3, joinedAt: 'June 2026',
  recentTasks: [],
  activity: [],
};

const statusDot: Record<Status, string>   = { online: 'bg-green-400', away: 'bg-yellow-400', offline: 'bg-slate-300' };
const statusText: Record<Status, string>  = { online: 'Online', away: 'Away', offline: 'Offline' };
const statusColor: Record<Status, string> = { online: 'text-green-500', away: 'text-yellow-500', offline: 'text-slate-400' };

const priorityColor: Record<string, string> = {
  High:   'bg-red-100 text-red-600',
  Medium: 'bg-orange-100 text-orange-500',
  Low:    'bg-slate-100 text-slate-500',
};

const statusPill: Record<string, string> = {
  completed: 'bg-green-100 text-green-600',
  progress:  'bg-blue-100 text-blue-600',
  todo:      'bg-slate-100 text-slate-500',
  review:    'bg-purple-100 text-purple-600',
};

export default function UserProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [msgOpen, setMsgOpen] = useState(false);

  const profile = PROFILES[Number(id)] ?? FALLBACK;

  const stats = [
    { icon: CheckCircle2,  label: 'Tasks Done',    value: profile.tasksCompleted, color: 'text-green-500',  bg: 'bg-green-50'  },
    { icon: ClipboardList, label: 'Assigned',       value: profile.tasksAssigned,  color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { icon: Zap,           label: 'Points',         value: profile.points,         color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Flame,         label: 'Day Streak',     value: profile.streak,         color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <AppLayout>
      <div className='mx-auto max-w-3xl space-y-5'>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900'
        >
          <ArrowLeft size={16} />
          Back to Members
        </button>

        {/* ── Profile hero ── */}
        <section className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8'>
          <div className='pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5' />
          <div className='pointer-events-none absolute bottom-0 left-24 h-24 w-24 rounded-full bg-white/5' />

          <div className='relative flex flex-col gap-5 sm:flex-row sm:items-start'>
            {/* Avatar */}
            <div className='relative flex-shrink-0'>
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ${profile.color}`}>
                {profile.initials}
              </div>
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-800 ${statusDot[profile.status]}`} />
            </div>

            {/* Info */}
            <div className='flex-1'>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-xl font-bold sm:text-2xl'>{profile.name}</h1>
                {profile.rank === 1 && <Trophy size={18} className='text-yellow-400' />}
                <span className={`flex items-center gap-1.5 text-sm font-medium ${statusColor[profile.status]}`}>
                  <span className={`h-2 w-2 rounded-full ${statusDot[profile.status]}`} />
                  {statusText[profile.status]}
                </span>
              </div>
              <p className='mt-1 text-sm text-slate-400'>{profile.title}</p>
              <div className='mt-1 flex items-center gap-2 text-sm text-slate-400'>
                <Mail size={13} />
                {profile.email}
              </div>
              <p className='mt-3 text-sm leading-relaxed text-slate-300'>{profile.bio}</p>
            </div>

            {/* Message button */}
            <button
              onClick={() => setMsgOpen(true)}
              className='flex w-fit items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30'
            >
              <MessageCircle size={15} />
              Message
            </button>
          </div>

          {/* Rank badge */}
          <div className='relative mt-5 flex items-center gap-2 text-sm text-slate-400'>
            <Trophy size={14} className='text-yellow-400' />
            <span>Rank #{profile.rank} in organisation</span>
            <span className='mx-2'>·</span>
            <span>Member since {profile.joinedAt}</span>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className='flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`text-xl font-bold ${color}`}>{value.toLocaleString()}</p>
              <p className='text-xs text-slate-400'>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Two-column: Tasks + Activity ── */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>

          {/* Recent tasks */}
          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <h2 className='mb-4 font-bold text-slate-900'>Recent Tasks</h2>
            {profile.recentTasks.length === 0 ? (
              <p className='text-sm text-slate-400'>No tasks yet.</p>
            ) : (
              <div className='space-y-3'>
                {profile.recentTasks.map((t) => (
                  <div key={t.id} className='flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5'>
                    <div>
                      <p className='text-sm font-medium text-slate-800'>{t.title}</p>
                      <p className='mt-0.5 text-xs text-slate-400'>Due {t.due}</p>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColor[t.priority]}`}>
                        {t.priority}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill[t.status]}`}>
                        {t.status === 'progress' ? 'In progress' : t.status === 'todo' ? 'To do' : t.status === 'completed' ? 'Done' : 'In review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent activity */}
          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <h2 className='mb-4 font-bold text-slate-900'>Recent Activity</h2>
            {profile.activity.length === 0 ? (
              <p className='text-sm text-slate-400'>No activity yet.</p>
            ) : (
              <div className='space-y-3'>
                {profile.activity.map((a) => (
                  <div key={a.id} className='flex gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3'>
                    <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${profile.color}`}>
                      {profile.initials}
                    </div>
                    <div>
                      <p className='text-sm text-slate-700'>{a.text}</p>
                      <p className='mt-0.5 text-xs text-slate-400'>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <MessageModal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        name={profile.name}
        initials={profile.initials}
        color={profile.color}
        status={profile.status}
      />
    </AppLayout>
  );
}
