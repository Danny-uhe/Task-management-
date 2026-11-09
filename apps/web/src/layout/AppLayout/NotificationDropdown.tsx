import { CheckCheck, X, Bell, UserPlus, CheckCircle2, AtSign, Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/app/Providers/NotificationContext';
import type { AppNotification } from '@/app/Providers/NotificationContext';

const typeIcon: Record<AppNotification['type'], { icon: React.ElementType; bg: string; color: string }> = {
  assignment: { icon: Bell,         bg: 'bg-blue-100',   color: 'text-blue-600'   },
  invite:     { icon: UserPlus,     bg: 'bg-purple-100', color: 'text-purple-600' },
  completed:  { icon: CheckCircle2, bg: 'bg-green-100',  color: 'text-green-600'  },
  mention:    { icon: AtSign,       bg: 'bg-orange-100', color: 'text-orange-500' },
  message:    { icon: MessageCircle, bg: 'bg-blue-100', color: 'text-blue-600' },
  general:    { icon: Users,        bg: 'bg-slate-100',  color: 'text-slate-500'  },
};

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, markAllRead, markRead, dismiss } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className='absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-100 bg-white shadow-2xl sm:top-14'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold text-slate-900'>Notifications</h3>
          {unread > 0 && (
            <span className='flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
              {unread}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className='flex items-center gap-1 text-xs font-medium text-blue-500 hover:underline disabled:opacity-40'
        >
          <CheckCheck size={13} />
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className='max-h-80 overflow-y-auto'>
        {notifications.length === 0 ? (
          <p className='py-8 text-center text-sm text-slate-400'>All caught up 🎉</p>
        ) : (
          notifications.map((n) => {
            const { icon: Icon, bg, color } = typeIcon[n.type];
            return (
              <div
                key={n.id}
                className={`group flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50 ${
                  n.read ? '' : 'bg-blue-50/40'
                }`}
              >
                {/* Icon or avatar */}
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
                  {n.avatarInitials && n.avatarInitials.length <= 2 ? (
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${n.avatarColor ?? bg}`}>
                      {n.avatarInitials}
                    </span>
                  ) : (
                    <Icon size={16} className={color} />
                  )}
                </div>

                <button
                  type='button'
                  onClick={() => {
                    markRead(n.id);
                    if (n.type === 'message' && n.relatedId) {
                      navigate(`/profile/${n.relatedId}?message=1`);
                    }
                  }}
                  className='min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                >
                  <p className='text-xs font-semibold text-slate-700'>{n.title}</p>
                  <p className='mt-0.5 text-xs leading-snug text-slate-500'>{n.message}</p>
                  <p className='mt-1 text-[10px] text-slate-400'>{n.time}</p>
                </button>

                <div className='flex flex-shrink-0 flex-col items-end gap-1'>
                  {!n.read && <span className='h-2 w-2 rounded-full bg-blue-500' />}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className='rounded p-0.5 text-slate-300 opacity-0 hover:text-red-400 group-hover:opacity-100'
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}