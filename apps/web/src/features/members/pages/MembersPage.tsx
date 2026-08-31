import { useState } from 'react';
import { Search, UserPlus, MoreVertical, ShieldCheck, Eye, Trash2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/layout/AppLayout';
import InviteModal from '../components/InviteModal';

type Role = 'Owner' | 'Admin' | 'Member' | 'Viewer';
type Status = 'online' | 'away' | 'offline';

type Member = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  color: string;
  initials: string;
  tasksCompleted: number;
  tasksAssigned: number;
  points: number;
  joinedAt: string;
};

const MEMBERS: Member[] = [
  { id: 1, name: 'Relentless Inivie', email: 'inivie@tasksync.io', role: 'Owner',  status: 'online',  color: 'bg-blue-500',    initials: 'RI', tasksCompleted: 34, tasksAssigned: 12, points: 2840, joinedAt: 'Jan 2026'  },
  { id: 2, name: 'Sarah Miller',      email: 'sarah@tasksync.io',  role: 'Admin',   status: 'online',  color: 'bg-purple-500',  initials: 'SM', tasksCompleted: 28, tasksAssigned: 9,  points: 2210, joinedAt: 'Feb 2026'  },
  { id: 3, name: 'Dev Team',          email: 'dev@tasksync.io',    role: 'Member',  status: 'away',    color: 'bg-emerald-500', initials: 'DT', tasksCompleted: 19, tasksAssigned: 6,  points: 1540, joinedAt: 'Mar 2026'  },
  { id: 4, name: 'Clara Johnson',     email: 'clara@tasksync.io',  role: 'Member',  status: 'offline', color: 'bg-amber-500',   initials: 'CJ', tasksCompleted: 15, tasksAssigned: 4,  points: 1200, joinedAt: 'Apr 2026'  },
  { id: 5, name: 'Ryan Thompson',     email: 'ryan@tasksync.io',   role: 'Member',  status: 'online',  color: 'bg-red-500',     initials: 'RT', tasksCompleted: 12, tasksAssigned: 7,  points: 980,  joinedAt: 'Apr 2026'  },
  { id: 6, name: 'Amara Osei',        email: 'amara@tasksync.io',  role: 'Viewer',  status: 'offline', color: 'bg-teal-500',    initials: 'AO', tasksCompleted: 6,  tasksAssigned: 2,  points: 450,  joinedAt: 'May 2026'  },
];

const statusDot: Record<Status, string> = {
  online:  'bg-green-400',
  away:    'bg-yellow-400',
  offline: 'bg-slate-300',
};

const statusLabel: Record<Status, string> = {
  online:  'Online',
  away:    'Away',
  offline: 'Offline',
};

const roleBadge: Record<Role, string> = {
  Owner:  'bg-yellow-100 text-yellow-700',
  Admin:  'bg-red-100 text-red-600',
  Member: 'bg-blue-100 text-blue-600',
  Viewer: 'bg-slate-100 text-slate-500',
};

export default function MembersPage() {
  const navigate = useNavigate();
  const [members,       setMembers]       = useState<Member[]>(MEMBERS);
  const [search,        setSearch]        = useState('');
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [menuOpenId,    setMenuOpenId]    = useState<number | null>(null);
  const [filterStatus,  setFilterStatus]  = useState<Status | 'all'>('all');

  const visible = members.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchS = filterStatus === 'all' || m.status === filterStatus;
    return matchQ && matchS;
  });

  const onlineCount  = members.filter((m) => m.status === 'online').length;
  const awayCount    = members.filter((m) => m.status === 'away').length;

  const handleRemove = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMenuOpenId(null);
  };

  return (
    <AppLayout>
      <div className='space-y-5'>

        {/* ── Top bar ── */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold text-slate-900 sm:text-2xl'>Team Members</h1>
            <p className='mt-0.5 text-sm text-slate-400'>
              {members.length} members · <span className='text-green-500 font-medium'>{onlineCount} online</span>
              {awayCount > 0 && <> · <span className='text-yellow-500 font-medium'>{awayCount} away</span></>}
            </p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className='flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>

        {/* ── Filter bar ── */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative flex-1 min-w-[200px] max-w-xs'>
            <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search members...'
              className='h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            />
          </div>

          {(['all', 'online', 'away', 'offline'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filterStatus === s
                  ? 'bg-blue-500 text-white'
                  : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {s !== 'all' && (
                <span className={`h-2 w-2 rounded-full ${statusDot[s as Status]}`} />
              )}
              {s === 'all' ? 'All' : statusLabel[s as Status]}
            </button>
          ))}
        </div>

        {/* ── Members grid ── */}
        {visible.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400'>
            <p className='text-sm font-medium'>No members found</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {visible.map((m) => (
              <div
                key={m.id}
                className='relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md'
              >
                {/* Three-dot menu */}
                <div className='absolute right-4 top-4'>
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
                    className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpenId === m.id && (
                    <div className='absolute right-0 top-8 z-10 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-xl'>
                      <button
                        onClick={() => { navigate(`/profile/${m.id}`); setMenuOpenId(null); }}
                        className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50'
                      >
                        <Eye size={14} /> View Profile
                      </button>
                      {m.role !== 'Admin' && m.role !== 'Owner' && (
                        <button
                          className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50'
                          onClick={() => setMenuOpenId(null)}
                        >
                          <ShieldCheck size={14} /> Make Admin
                        </button>
                      )}
                      {m.role !== 'Owner' && (
                        <button
                          onClick={() => handleRemove(m.id)}
                          className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50'
                        >
                          <Trash2 size={14} /> Remove Member
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Avatar + status */}
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white ${m.color}`}>
                      {m.initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${statusDot[m.status]}`} />
                  </div>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <p className='truncate font-semibold text-slate-900'>{m.name}</p>
                      {m.role === 'Owner' && <Crown size={13} className='flex-shrink-0 text-yellow-500' />}
                    </div>
                    <p className='truncate text-xs text-slate-400'>{m.email}</p>
                  </div>
                </div>

                {/* Role + status */}
                <div className='mt-3 flex items-center gap-2'>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[m.role]}`}>
                    {m.role}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    m.status === 'online' ? 'text-green-500' : m.status === 'away' ? 'text-yellow-500' : 'text-slate-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[m.status]}`} />
                    {statusLabel[m.status]}
                  </span>
                  <span className='ml-auto text-xs text-slate-400'>Since {m.joinedAt}</span>
                </div>

                {/* Stats */}
                <div className='mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-2'>
                  <div className='flex flex-col items-center gap-0.5 px-2'>
                    <p className='text-sm font-bold text-slate-900'>{m.tasksCompleted}</p>
                    <p className='text-[10px] text-slate-400'>Done</p>
                  </div>
                  <div className='flex flex-col items-center gap-0.5 px-2'>
                    <p className='text-sm font-bold text-slate-900'>{m.tasksAssigned}</p>
                    <p className='text-[10px] text-slate-400'>Assigned</p>
                  </div>
                  <div className='flex flex-col items-center gap-0.5 px-2'>
                    <p className='text-sm font-bold text-blue-500'>{m.points.toLocaleString()}</p>
                    <p className='text-[10px] text-slate-400'>Points</p>
                  </div>
                </div>

                {/* View Profile CTA */}
                <button
                  onClick={() => navigate(`/profile/${m.id}`)}
                  className='mt-3 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50'
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </AppLayout>
  );
}
