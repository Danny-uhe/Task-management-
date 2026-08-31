import { useState, useRef, useEffect } from 'react';
import { X, Send, Smile } from 'lucide-react';

type Message = {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  name: string;
  initials: string;
  color: string;
  status: 'online' | 'away' | 'offline';
};

const statusDot: Record<string, string> = {
  online: 'bg-green-400',
  away:   'bg-yellow-400',
  offline:'bg-slate-300',
};

const statusText: Record<string, string> = {
  online: 'Online',
  away:   'Away',
  offline:'Offline',
};

const SEED_MESSAGES: Message[] = [
  { id: 1, from: 'them', text: 'Hey! Just checking in on the dashboard redesign.', time: '10:12 AM' },
  { id: 2, from: 'me',   text: "Almost done! Should have it ready by EOD.",        time: '10:14 AM' },
  { id: 3, from: 'them', text: 'Perfect, let me know if you need any assets 👍',   time: '10:15 AM' },
];

let nextId = 10;

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageModal({ open, onClose, name, initials, color, status }: Props) {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [input,    setInput]    = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!open) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId++, from: 'me', text, time: now() },
    ]);
    setInput('');

    /* Simulate a reply after 1.2s */
    setTimeout(() => {
      const replies = [
        'Got it, thanks!',
        'Will do 👌',
        "Sure, I'll take a look.",
        'On it! Give me a few minutes.',
        'Noted, will update you shortly.',
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          from: 'them',
          text: replies[Math.floor(Math.random() * replies.length)],
          time: now(),
        },
      ]);
    }, 1200);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4'>
      <div className='flex w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl' style={{ height: '520px' }}>

        {/* ── Header ── */}
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
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Messages ── */}
        <div className='flex-1 space-y-3 overflow-y-auto px-5 py-4'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.from === 'me'
                      ? 'rounded-br-sm bg-blue-500 text-white'
                      : 'rounded-bl-sm bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
                <span className='text-[10px] text-slate-400'>{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className='flex-shrink-0 border-t border-slate-100 p-4'>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'>
            <button className='text-slate-400 hover:text-slate-600'>
              <Smile size={18} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={`Message ${name.split(' ')[0]}...`}
              className='flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400'
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-700 disabled:opacity-40'
            >
              <Send size={14} />
            </button>
          </div>
          <p className='mt-1.5 text-center text-[10px] text-slate-400'>Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}
