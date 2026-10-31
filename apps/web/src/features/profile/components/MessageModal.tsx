import { useState, useRef, useEffect } from 'react';
import { X, Send, Smile, Loader2, MessageCircle } from 'lucide-react';
import { useMessages, useSendMessage, useDeleteMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  name: string;
  initials: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  targetUserId: string;
};

const statusDot: Record<string, string> = {
  online: 'bg-green-400', away: 'bg-yellow-400', offline: 'bg-slate-300',
};
const statusText: Record<string, string> = {
  online: 'Online', away: 'Away', offline: 'Offline',
};

const AVATAR_COLORS = [
  'bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500',
];
function avatarColor(id: string) {
  const s = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[s % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

/** Find the first project that both users share, or null if none */
async function findSharedProject(targetUserId: string): Promise<{ id: string; name: string } | null> {
  try {
    const res = await api.get<{ success: boolean; projects: { id: string; name: string }[] }>('/projects');
    const projects = res.data.projects ?? [];
    for (const p of projects) {
      const membersRes = await api.get<{ success: boolean; members: { user: { id: string } }[] }>(
        `/projects/${p.id}/members`
      );
      const ids = membersRes.data.members.map((m) => m.user.id);
      if (ids.includes(targetUserId)) return p;
    }
    return null;
  } catch {
    return null;
  }
}

export default function MessageModal({ open, onClose, name, initials, color, status, targetUserId }: Props) {
  const [input, setInput] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);

  const { data: messages = [], isLoading: msgsLoading } = useMessages(projectId ?? '');
  const send = useSendMessage(projectId ?? '');
  const del  = useDeleteMessage(projectId ?? '');

  // Find the shared project when modal opens
  useEffect(() => {
    if (!open || !targetUserId) return;
    setLoading(true);
    findSharedProject(targetUserId).then((proj) => {
      if (proj) { setProjectId(proj.id); setProjectName(proj.name); }
      else       { setProjectId(null); }
      setLoading(false);
    });
  }, [open, targetUserId]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  if (!open) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || !projectId || send.isPending) return;
    send.mutate(text, {
      onError: () => toast.error('Failed to send message'),
    });
    setInput('');
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4'>
      <div className='flex w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl' style={{ height: '520px' }}>

        {/* Header */}
        <div className='flex flex-shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4'>
          <div className='relative'>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${color}`}>
              {initials}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusDot[status]}`} />
          </div>
          <div className='flex-1'>
            <p className='font-semibold text-slate-900'>{name}</p>
            <p className={`text-xs font-medium ${status === 'online' ? 'text-green-500' : status === 'away' ? 'text-yellow-500' : 'text-slate-400'}`}>
              {statusText[status]}
              {projectName && <span className='ml-2 text-slate-400'>· {projectName}</span>}
            </p>
          </div>
          <button onClick={onClose} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className='flex-1 space-y-3 overflow-y-auto px-5 py-4'>
          {loading || msgsLoading ? (
            <div className='flex h-full items-center justify-center'>
              <Loader2 size={22} className='animate-spin text-blue-500' />
            </div>
          ) : !projectId ? (
            <div className='flex h-full flex-col items-center justify-center text-center'>
              <MessageCircle size={32} className='mb-3 text-slate-300' />
              <p className='text-sm font-medium text-slate-600'>No shared project</p>
              <p className='mt-1 text-xs text-slate-400'>
                You and {name.split(' ')[0]} need to be in the same project to message each other.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className='flex h-full flex-col items-center justify-center text-center'>
              <MessageCircle size={32} className='mb-3 text-slate-300' />
              <p className='text-sm font-medium text-slate-600'>No messages yet</p>
              <p className='mt-1 text-xs text-slate-400'>Send the first message!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {!isOwn && (
                    <div className={`h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarColor(msg.userId)}`}>
                      {getInitials(msg.user?.name ?? '?')}
                    </div>
                  )}
                  <div className={`group max-w-[75%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn ? 'rounded-br-sm bg-blue-500 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-800'
                    }`}>
                      {msg.content}
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] text-slate-400'>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && (
                        <button
                          onClick={() => del.mutate(msg.id)}
                          className='hidden group-hover:block text-[10px] text-slate-300 hover:text-red-400'
                        >
                          delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className='flex-shrink-0 border-t border-slate-100 p-4'>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'>
            <button className='text-slate-400 hover:text-slate-600'><Smile size={18} /></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={projectId ? `Message ${name.split(' ')[0]}...` : 'No shared project'}
              disabled={!projectId}
              className='flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed'
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !projectId || send.isPending}
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-700 disabled:opacity-40'
            >
              {send.isPending ? <Loader2 size={14} className='animate-spin' /> : <Send size={14} />}
            </button>
          </div>
          <p className='mt-1.5 text-center text-[10px] text-slate-400'>Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}
