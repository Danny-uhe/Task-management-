import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, CheckCircle2, ClipboardList,
  Zap, Flame, Trophy, MessageCircle, Loader2,
} from 'lucide-react';
import AppLayout from '@/layout/AppLayout';
import MessageModal from '../components/MessageModal';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  systemRole: 'admin' | 'member';
  isActive: boolean;
  isOnline: boolean;
  avatar?: string | null;
  position?: string | null;
  bio?: string | null;
  points: number;
  streak: number;
  taskCount: number;
  projectCount: number;
  createdAt: string;
  _count?: {
    assignedTasks: number;
    projects: number;
  };
}

const AVATAR_COLORS = [
  'bg-blue-500','bg-purple-500','bg-emerald-500',
  'bg-amber-500','bg-rose-500','bg-teal-500',
];
function avatarColor(id: string) {
  const s = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[s % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function UserProfilePage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [msgOpen,  setMsgOpen]  = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Try to fetch all org members and find the one with matching id
    api.get<{ success: boolean; members: UserProfile[] }>('/organisation/members')
      .then((res) => {
        const found = res.data.members.find((m) => m.id === id) ?? null;
        setProfile(found);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className='flex items-center justify-center py-32'>
          <Loader2 size={28} className='animate-spin text-blue-500' />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className='flex flex-col items-center justify-center py-32 text-slate-400'>
          <p className='text-lg font-semibold'>User not found</p>
          <button onClick={() => navigate(-1)} className='mt-4 text-sm text-blue-500 hover:underline'>
            Go back
          </button>
        </div>
      </AppLayout>
    );
  }

  const isOnline = profile.isOnline;
  const isSelf   = currentUser?.id === profile.id;
  const color    = avatarColor(profile.id);
  const initials = getInitials(profile.name);
  const tasksCompleted = 0;
  const tasksAssigned  = profile.taskCount ?? 0;
  const points         = profile.points    ?? 0;
  const streak         = profile.streak    ?? 0;

  const stats = [
    { icon: CheckCircle2,  label: 'Tasks Done',  value: tasksCompleted, color: 'text-green-500',  bg: 'bg-green-50'  },
    { icon: ClipboardList, label: 'Assigned',     value: tasksAssigned,  color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { icon: Zap,           label: 'Points',       value: points,         color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Flame,         label: 'Day Streak',   value: streak,         color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const joinedAt = new Date(profile.createdAt).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  });

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

        {/* Profile hero */}
        <section className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8'>
          <div className='pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5' />
          <div className='pointer-events-none absolute bottom-0 left-24 h-24 w-24 rounded-full bg-white/5' />

          <div className='relative flex flex-col gap-5 sm:flex-row sm:items-start'>
            {/* Avatar */}
            <div className='relative flex-shrink-0'>
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className='h-20 w-20 rounded-2xl object-cover' />
              ) : (
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ${color}`}>
                  {initials}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-800 ${isOnline ? 'bg-green-400' : 'bg-slate-400'}`} />
            </div>

            {/* Info */}
            <div className='flex-1'>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-xl font-bold sm:text-2xl'>{profile.name}</h1>
                {profile.systemRole === 'admin' && (
                  <span className='rounded-full bg-yellow-400/20 px-2.5 py-0.5 text-xs font-semibold text-yellow-300'>
                    Admin
                  </span>
                )}
                <span className={`flex items-center gap-1.5 text-sm font-medium ${isOnline ? 'text-green-400' : 'text-slate-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-400'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {profile.position && (
                <p className='mt-1 text-sm text-slate-400'>{profile.position}</p>
              )}
              <div className='mt-1 flex items-center gap-2 text-sm text-slate-400'>
                <Mail size={13} />
                {profile.email}
              </div>
              {profile.bio && (
                <p className='mt-3 text-sm leading-relaxed text-slate-300'>{profile.bio}</p>
              )}
            </div>

            {/* Message button — hide for own profile */}
            {!isSelf && (
              <button
                onClick={() => setMsgOpen(true)}
                className='flex w-fit items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30'
              >
                <MessageCircle size={15} />
                Message
              </button>
            )}
          </div>

          <div className='relative mt-5 flex items-center gap-2 text-sm text-slate-400'>
            <Trophy size={14} className='text-yellow-400' />
            <span>{profile.points.toLocaleString()} points</span>
            <span className='mx-2'>·</span>
            <span>Member since {joinedAt}</span>
          </div>
        </section>

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {stats.map(({ icon: Icon, label, value, color: c, bg }) => (
            <div key={label} className='flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={c} />
              </div>
              <p className={`text-xl font-bold ${c}`}>{value.toLocaleString()}</p>
              <p className='text-xs text-slate-400'>{label}</p>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h2 className='mb-3 font-bold text-slate-900'>About</h2>
          <div className='space-y-2 text-sm text-slate-500'>
            <p><span className='font-medium text-slate-700'>Role:</span> {profile.systemRole === 'admin' ? 'Admin' : 'Member'}</p>
            <p><span className='font-medium text-slate-700'>Status:</span> {profile.isActive ? 'Active' : 'Inactive'}</p>
            <p><span className='font-medium text-slate-700'>Joined:</span> {joinedAt}</p>
            {profile.position && <p><span className='font-medium text-slate-700'>Position:</span> {profile.position}</p>}
          </div>
        </div>

      </div>

      {!isSelf && id && (
        <MessageModal
          open={msgOpen}
          onClose={() => setMsgOpen(false)}
          name={profile.name}
          initials={initials}
          color={color}
          status={isOnline ? 'online' : 'offline'}
          targetUserId={id}
        />
      )}
    </AppLayout>
  );
}
