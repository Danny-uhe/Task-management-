import { useState, useEffect } from 'react';
import { X, Send, Mail, User, Trash2, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { membersService, type Invitation } from '../services/members.service';

type Props = {
  open:        boolean;
  onClose:     () => void;
  onInviteSent?: () => void;
};

const roleBadge = {
  admin:  'bg-red-100 text-red-600',
  member: 'bg-blue-100 text-blue-600',
};

const inp = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function InviteModal({ open, onClose, onInviteSent }: Props) {
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [role,       setRole]       = useState<'admin' | 'member'>('member');
  const [sending,    setSending]    = useState(false);
  const [invites,    setInvites]    = useState<Invitation[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [resendingId,  setResendingId]  = useState<string | null>(null);

  // ── Load pending invitations when modal opens ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    setLoadingList(true);
    membersService
      .listInvitations()
      .then((res) =>
        setInvites(
          res.data.invitations.filter((i) => i.status === 'PENDING')
        )
      )
      .catch(() => toast.error('Could not load pending invitations'))
      .finally(() => setLoadingList(false));
  }, [open]);

  if (!open) return null;

  // ── Send invite ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !email.includes('@')) return;

    setSending(true);
    try {
      const res = await membersService.sendInvite({
        name:       name.trim(),
        email:      email.trim(),
        systemRole: role,
      });
      setInvites((prev) => [res.data.invitation, ...prev]);
      toast.success(`Invite sent to ${email.trim()}`);
      setName('');
      setEmail('');
      setRole('member');
      onInviteSent?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to send invitation';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // ── Cancel invite ──────────────────────────────────────────────────────────
  const handleCancel = async (inviteId: string) => {
    setCancellingId(inviteId);
    try {
      await membersService.cancelInvite(inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success('Invitation cancelled');
    } catch {
      toast.error('Failed to cancel invitation');
    } finally {
      setCancellingId(null);
    }
  };

  // ── Resend invite ──────────────────────────────────────────────────────────
  const handleResend = async (inviteId: string) => {
    setResendingId(inviteId);
    try {
      await membersService.resendInvite(inviteId);
      toast.success('Invitation resent');
    } catch {
      toast.error('Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  const canSend = name.trim().length > 0 && email.trim().includes('@') && !sending;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4'>
      <div className='w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl'>

        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <div>
            <h2 className='font-bold text-slate-900'>Invite Team Member</h2>
            <p className='text-xs text-slate-400'>An email with a sign-up link will be sent</p>
          </div>
          <button onClick={onClose} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4'>

          {/* Name */}
          <div className='relative'>
            <User size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name (e.g. Sarah Miller)"
              className={`${inp} pl-9`}
              autoFocus
            />
          </div>

          {/* Email + Role */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Mail size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSend && handleSend()}
                placeholder='colleague@company.com'
                className={`${inp} pl-9`}
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
              className='rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500'
            >
              <option value='member'>Member</option>
              <option value='admin'>Admin</option>
            </select>
          </div>

          {/* Role descriptions */}
          <div className='grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400'>
            <span>Member — can view &amp; work on tasks</span>
            <span>Admin — full access including invites</span>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40'
          >
            <Send size={15} />
            {sending ? 'Sending…' : 'Send Invite'}
          </button>

          {/* Divider */}
          <div className='flex items-center gap-3 pt-1'>
            <div className='h-px flex-1 bg-slate-100' />
            <span className='text-xs text-slate-400'>Pending Invitations</span>
            <div className='h-px flex-1 bg-slate-100' />
          </div>

          {/* Invite list */}
          {loadingList ? (
            <p className='py-4 text-center text-sm text-slate-400'>Loading…</p>
          ) : invites.length === 0 ? (
            <p className='py-4 text-center text-sm text-slate-400'>No pending invitations</p>
          ) : (
            <div className='space-y-2'>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className='flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600'>
                      {inv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium text-slate-700'>{inv.name}</p>
                      <div className='mt-0.5 flex items-center gap-2'>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadge[inv.systemRole]}`}>
                          {inv.systemRole}
                        </span>
                        <span className='flex items-center gap-1 text-[10px] text-slate-400'>
                          <Clock size={10} />
                          {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-shrink-0 items-center gap-1'>
                    {/* Resend */}
                    <button
                      title='Resend invite'
                      disabled={resendingId === inv.id}
                      onClick={() => handleResend(inv.id)}
                      className='rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500 disabled:opacity-40'
                    >
                      <RefreshCw size={13} className={resendingId === inv.id ? 'animate-spin' : ''} />
                    </button>
                    {/* Cancel */}
                    <button
                      title='Cancel invite'
                      disabled={cancellingId === inv.id}
                      onClick={() => handleCancel(inv.id)}
                      className='rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40'
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
