import { useState, useEffect } from 'react';
import { Users, FolderOpen, CheckSquare, TrendingUp, Mail, Crown, Loader2, Search, Trash2, Send, X } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface OrgStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

interface OrgMember {
  id: string;
  name: string;
  email: string;
  systemRole: 'admin' | 'member';
  isActive: boolean;
  avatar?: string | null;
  position?: string | null;
  points: number;
  isOnline: boolean;
}

const COLORS = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500'];
function avatarColor(id: string) {
  const s = id.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  return COLORS[s % COLORS.length];
}
function getInitials(name: string) {
  return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
}

export default function OrganisationPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin     = currentUser?.systemRole === 'admin';

  const [stats,    setStats]    = useState<OrgStats | null>(null);
  const [members,  setMembers]  = useState<OrgMember[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  // Invite modal
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName,  setInviteName]  = useState('');
  const [inviteRole,  setInviteRole]  = useState<'member'|'admin'>('member');
  const [inviting,    setInviting]    = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<{ success: boolean; stats: OrgStats }>('/organisation/stats'),
      api.get<{ success: boolean; members: OrgMember[] }>('/organisation/members'),
    ]).then(([s, m]) => {
      setStats(s.data.stats);
      setMembers(m.data.members);
    }).catch(() => toast.error('Failed to load organisation data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from the organisation?`)) return;
    try {
      await api.delete(`/organisation/members/${userId}`);
      toast.success(`${name} removed`);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to remove member');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setInviting(true);
    try {
      await api.post('/invitations', { email: inviteEmail.trim(), name: inviteName.trim(), systemRole: inviteRole });
      toast.success(`Invite sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail(''); setInviteName(''); setInviteRole('member');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const inp = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <AppLayout>
      <div className='space-y-6'>

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-bold text-slate-900 sm:text-2xl'>Organisation</h1>
            <p className='mt-0.5 text-sm text-slate-400'>Manage members and organisation settings</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              className='flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
            >
              <Send size={15} />
              Invite Member
            </button>
          )}
        </div>

        {/* Stats */}
        {loading ? (
          <div className='flex justify-center py-10'><Loader2 size={24} className='animate-spin text-blue-500' /></div>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              {[
                { icon: Users,       label: 'Members',     value: stats?.totalUsers ?? 0,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
                { icon: FolderOpen,  label: 'Projects',    value: stats?.totalProjects ?? 0,    color: 'text-purple-600', bg: 'bg-purple-50' },
                { icon: CheckSquare, label: 'Tasks Done',  value: stats?.completedTasks ?? 0,   color: 'text-green-600',  bg: 'bg-green-50'  },
                { icon: TrendingUp,  label: 'Completion',  value: `${stats?.completionRate ?? 0}%`, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className='mt-0.5 text-sm text-slate-500'>{label}</p>
                </div>
              ))}
            </div>

            {/* Members list */}
            <div className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
              <div className='border-b border-slate-100 px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='relative flex-1'>
                    <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Search members…'
                      className='w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                  </div>
                </div>
              </div>

              <div className='divide-y divide-slate-100'>
                {filtered.length === 0 ? (
                  <div className='flex flex-col items-center py-12 text-slate-400'>
                    <Users size={32} className='mb-3 opacity-30' />
                    <p className='text-sm font-medium'>No members found</p>
                  </div>
                ) : (
                  filtered.map((m) => (
                    <div key={m.id} className='flex items-center gap-4 px-6 py-4'>
                      {/* Avatar */}
                      <div className='relative'>
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(m.id)}`}>
                          {getInitials(m.name)}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${m.isOnline ? 'bg-green-400' : 'bg-slate-300'}`} />
                      </div>

                      {/* Info */}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <p className='truncate text-sm font-semibold text-slate-900'>
                            {m.name}
                            {m.id === currentUser?.id && (
                              <span className='ml-1.5 text-xs font-normal text-slate-400'>(You)</span>
                            )}
                          </p>
                          {m.systemRole === 'admin' && (
                            <span className='flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold text-yellow-700'>
                              <Crown size={9} /> Admin
                            </span>
                          )}
                        </div>
                        <div className='mt-0.5 flex items-center gap-1 text-xs text-slate-400'>
                          <Mail size={11} />
                          <span className='truncate'>{m.email}</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className='hidden text-right sm:block'>
                        <p className='text-sm font-bold text-purple-600'>{m.points.toLocaleString()}</p>
                        <p className='text-xs text-slate-400'>points</p>
                      </div>

                      {/* Status */}
                      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${
                        m.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>

                      {/* Remove */}
                      {isAdmin && m.id !== currentUser?.id && (
                        <button
                          onClick={() => handleRemove(m.id, m.name)}
                          className='rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500'
                          title='Remove member'
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl'>
            <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
              <div>
                <h2 className='text-base font-bold text-slate-900'>Invite Team Member</h2>
                <p className='text-xs text-slate-400'>An email with a sign-up link will be sent</p>
              </div>
              <button onClick={() => setShowInvite(false)} className='rounded-lg p-1 text-slate-400 hover:bg-slate-100'>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className='space-y-4 px-6 py-5'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>Full Name</label>
                <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder='Danny' className={inp} required />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>Email address</label>
                <input type='email' value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder='danny@example.com' className={inp} required />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>Role</label>
                <div className='grid grid-cols-2 gap-2'>
                  {(['member','admin'] as const).map((r) => (
                    <button key={r} type='button' onClick={() => setInviteRole(r)}
                      className={`rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                        inviteRole === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                      {r === 'admin' ? 'Admin — full access' : 'Member — can view & work on tasks'}
                    </button>
                  ))}
                </div>
              </div>

              <button type='submit' disabled={inviting || !inviteEmail.trim() || !inviteName.trim()}
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50'>
                {inviting ? <Loader2 size={15} className='animate-spin' /> : <Send size={15} />}
                Send Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
