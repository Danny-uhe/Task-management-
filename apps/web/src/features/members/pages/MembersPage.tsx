import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, MoreVertical, ShieldCheck, Eye, UserX, UserCheck, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AppLayout from '@/layout/AppLayout';
import InviteModal from '../components/InviteModal';
import { useAuthStore } from '@/store/authStore';
import { membersService, type OrgUser } from '../services/members.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-red-500',   'bg-teal-500',
];

function avatarColor(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const navigate   = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin    = currentUser?.systemRole === 'admin';

  const [members,      setMembers]      = useState<OrgUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [inviteOpen,   setInviteOpen]   = useState(false);
  const [menuOpenId,   setMenuOpenId]   = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch members ──────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    try {
      const res = await membersService.listUsers();
      setMembers(res.data.users);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const visible = members.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchF =
      filterActive === 'all' ||
      (filterActive === 'active'   &&  m.isActive) ||
      (filterActive === 'inactive' && !m.isActive);
    return matchQ && matchF;
  });

  const activeCount = members.filter((m) => m.isActive).length;

  // ── Admin actions ──────────────────────────────────────────────────────────
  const handleMakeAdmin = async (userId: string) => {
    setActionLoading(userId);
    try {
      await membersService.makeAdmin(userId);
      toast.success('User promoted to admin');
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update role');
    } finally {
      setActionLoading(null);
      setMenuOpenId(null);
    }
  };

  const handleMakeMember = async (userId: string) => {
    setActionLoading(userId);
    try {
      await membersService.makeMember(userId);
      toast.success('User changed to member');
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update role');
    } finally {
      setActionLoading(null);
      setMenuOpenId(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    setActionLoading(userId);
    try {
      await membersService.deactivate(userId);
      toast.success('User deactivated');
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to deactivate');
    } finally {
      setActionLoading(null);
      setMenuOpenId(null);
    }
  };

  const handleActivate = async (userId: string) => {
    setActionLoading(userId);
    try {
      await membersService.activate(userId);
      toast.success('User activated');
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to activate');
    } finally {
      setActionLoading(null);
      setMenuOpenId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className='space-y-5'>

        {/* ── Top bar ── */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold text-slate-900 sm:text-2xl'>Team Members</h1>
            <p className='mt-0.5 text-sm text-slate-400'>
              {members.length} members · <span className='text-green-500 font-medium'>{activeCount} active</span>
            </p>
          </div>

          {/* Only admins can invite */}
          {isAdmin && (
            <button
              onClick={() => setInviteOpen(true)}
              className='flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
            >
              <UserPlus size={16} />
              Invite Member
            </button>
          )}
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

          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filterActive === f
                  ? 'bg-blue-500 text-white'
                  : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className='flex items-center justify-center py-20 text-slate-400 text-sm'>
            Loading members…
          </div>
        ) : visible.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400'>
            <p className='text-sm font-medium'>No members found</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {visible.map((m) => (
              <div
                key={m.id}
                className={`relative rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  !m.isActive ? 'border-slate-200 opacity-60' : 'border-slate-200'
                }`}
              >
                {/* Three-dot menu — admin only */}
                {isAdmin && (
                  <div className='absolute right-4 top-4'>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
                      className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'
                      disabled={actionLoading === m.id}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {menuOpenId === m.id && (
                      <div className='absolute right-0 top-8 z-10 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-xl'>
                        <button
                          onClick={() => { navigate(`/profile/${m.id}`); setMenuOpenId(null); }}
                          className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50'
                        >
                          <Eye size={14} /> View Profile
                        </button>

                        {/* Role toggle — don't show for self */}
                        {m.id !== currentUser?.id && (
                          m.systemRole === 'member' ? (
                            <button
                              onClick={() => handleMakeAdmin(m.id)}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50'
                            >
                              <ShieldCheck size={14} /> Make Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMakeMember(m.id)}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50'
                            >
                              <ShieldCheck size={14} /> Make Member
                            </button>
                          )
                        )}

                        {/* Activate / Deactivate — don't show for self */}
                        {m.id !== currentUser?.id && (
                          m.isActive ? (
                            <button
                              onClick={() => handleDeactivate(m.id)}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50'
                            >
                              <UserX size={14} /> Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(m.id)}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50'
                            >
                              <UserCheck size={14} /> Activate
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Avatar + name */}
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className='h-12 w-12 rounded-xl object-cover' />
                    ) : (
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white ${avatarColor(m.id)}`}>
                        {getInitials(m.name)}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${m.isActive ? 'bg-green-400' : 'bg-slate-300'}`} />
                  </div>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <p className='truncate font-semibold text-slate-900'>{m.name}</p>
                      {m.systemRole === 'admin' && <Crown size={13} className='flex-shrink-0 text-yellow-500' />}
                    </div>
                    <p className='truncate text-xs text-slate-400'>{m.email}</p>
                  </div>
                </div>

                {/* Role + status */}
                <div className='mt-3 flex items-center gap-2'>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    m.systemRole === 'admin'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {m.systemRole === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  <span className={`text-xs font-medium ${m.isActive ? 'text-green-500' : 'text-slate-400'}`}>
                    {m.isActive ? '● Active' : '● Inactive'}
                  </span>
                  {m.position && (
                    <span className='ml-auto truncate text-xs text-slate-400'>{m.position}</span>
                  )}
                </div>

                {/* Stats */}
                <div className='mt-4 grid grid-cols-2 divide-x divide-slate-100 rounded-xl bg-slate-50 py-2'>
                  <div className='flex flex-col items-center gap-0.5 px-2'>
                    <p className='text-sm font-bold text-blue-500'>{m.points.toLocaleString()}</p>
                    <p className='text-[10px] text-slate-400'>Points</p>
                  </div>
                  <div className='flex flex-col items-center gap-0.5 px-2'>
                    <p className='text-xs text-slate-500'>
                      {new Date(m.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className='text-[10px] text-slate-400'>Joined</p>
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

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInviteSent={fetchMembers}
      />
    </AppLayout>
  );
}
