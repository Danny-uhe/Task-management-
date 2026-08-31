import { useState } from 'react';
import { X, Send, Mail, Trash2, Clock, CheckCircle2, Link2 } from 'lucide-react';
import { useNotifications } from '@/app/Providers/NotificationContext';

type Role = 'Admin' | 'Member' | 'Viewer';

type PendingInvite = {
  id: number;
  email: string;
  role: Role;
  sentAt: string;
};

const SEED_INVITES: PendingInvite[] = [
  { id: 1, email: 'alex.jones@email.com',  role: 'Member', sentAt: '2h ago'      },
  { id: 2, email: 'maya.chen@design.io',   role: 'Admin',  sentAt: 'Yesterday'   },
];

let nextId = 10;

type Props = { open: boolean; onClose: () => void };

export default function InviteModal({ open, onClose }: Props) {
  const { addNotification } = useNotifications();

  const [email,   setEmail]   = useState('');
  const [role,    setRole]    = useState<Role>('Member');
  const [message, setMessage] = useState('');
  const [invites, setInvites] = useState<PendingInvite[]>(SEED_INVITES);
  const [sent,    setSent]    = useState<string[]>([]);

  if (!open) return null;

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) return;
    const newInvite: PendingInvite = {
      id: nextId++,
      email: email.trim(),
      role,
      sentAt: 'Just now',
    };
    setInvites((prev) => [newInvite, ...prev]);
    setSent((prev) => [email.trim(), ...prev]);
    addNotification({
      type: 'invite',
      title: 'Invite Sent',
      message: `Invitation sent to ${email.trim()} as ${role}`,
      avatarColor: 'bg-purple-500',
      avatarInitials: email.slice(0, 2).toUpperCase(),
    });
    setEmail('');
    setMessage('');
  };

  const handleRevoke = (id: number) =>
    setInvites((prev) => prev.filter((i) => i.id !== id));

  const roleBadge: Record<Role, string> = {
    Admin:  'bg-red-100 text-red-600',
    Member: 'bg-blue-100 text-blue-600',
    Viewer: 'bg-slate-100 text-slate-500',
  };

  const inp = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4'>
      <div className='w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl'>

        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <div>
            <h2 className='font-bold text-slate-900'>Invite Team Members</h2>
            <p className='text-xs text-slate-400'>Invite people to join your organisation</p>
          </div>
          <button onClick={onClose} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='max-h-[70vh] overflow-y-auto px-6 py-5'>

          {/* Email + Role row */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Mail size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder='colleague@company.com'
                className={`${inp} pl-9`}
                autoFocus
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className='rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500'
            >
              <option>Admin</option>
              <option>Member</option>
              <option>Viewer</option>
            </select>
          </div>

          {/* Role descriptions */}
          <div className='mt-2 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400'>
            <span>Admin — full access</span>
            <span>Member — create & edit</span>
            <span>Viewer — read only</span>
          </div>

          {/* Optional message */}
          <div className='mt-4'>
            <label className='mb-1.5 block text-xs font-semibold text-slate-500'>Personal message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! I'd like you to join our team on TaskSync..."
              rows={2}
              className={`${inp} resize-none`}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!email.trim() || !email.includes('@')}
            className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40'
          >
            <Send size={15} />
            Send Invite
          </button>

          {/* Divider */}
          <div className='my-5 flex items-center gap-3'>
            <div className='h-px flex-1 bg-slate-100' />
            <span className='text-xs text-slate-400'>Pending Invitations</span>
            <div className='h-px flex-1 bg-slate-100' />
          </div>

          {/* Invite list */}
          {invites.length === 0 ? (
            <p className='py-4 text-center text-sm text-slate-400'>No pending invitations</p>
          ) : (
            <div className='space-y-2'>
              {invites.map((inv) => (
                <div key={inv.id} className='flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600'>
                      {inv.email.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-slate-700'>{inv.email}</p>
                      <div className='mt-0.5 flex items-center gap-2'>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadge[inv.role]}`}>
                          {inv.role}
                        </span>
                        <span className='flex items-center gap-1 text-[10px] text-slate-400'>
                          {sent.includes(inv.email)
                            ? <><CheckCircle2 size={10} className='text-green-500' /> Sent</>
                            : <><Clock size={10} /> {inv.sentAt}</>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <button
                      title='Copy invite link'
                      className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'
                      onClick={() => navigator.clipboard.writeText(`https://tasksync.io/invite/${inv.id}`).catch(()=>{})}
                    >
                      <Link2 size={13} />
                    </button>
                    <button
                      title='Revoke invite'
                      onClick={() => handleRevoke(inv.id)}
                      className='rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500'
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
