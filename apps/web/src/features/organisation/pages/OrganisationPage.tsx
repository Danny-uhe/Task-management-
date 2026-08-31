import { useState } from 'react';
import { Building2, Camera, Globe, Users, ClipboardList, TrendingUp, Edit3, Check, Copy } from 'lucide-react';
import AppLayout from '@/layout/AppLayout';

const INDUSTRIES = ['Technology', 'Design', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Other'];

type Org = {
  name: string;
  handle: string;
  description: string;
  industry: string;
  website: string;
  logoColor: string;
  logoInitials: string;
};

const LOGO_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
];

export default function OrganisationPage() {
  const [org, setOrg] = useState<Org>({
    name: 'TaskSync HQ',
    handle: 'tasksync-hq',
    description: 'Building the future of collaborative task management. Fast, beautiful, and human.',
    industry: 'Technology',
    website: 'https://tasksync.io',
    logoColor: 'bg-blue-500',
    logoInitials: 'TS',
  });

  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState<Org>(org);
  const [copied,  setCopied]    = useState(false);
  const [saved,   setSaved]     = useState(false);

  const inviteLink = `https://tasksync.io/invite/${org.handle}`;

  const handleSave = () => {
    setOrg(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400';

  const stats = [
    { icon: Users,         label: 'Members',          value: '8'   },
    { icon: ClipboardList, label: 'Active Tasks',      value: '24'  },
    { icon: TrendingUp,    label: 'Completed (30d)',   value: '61'  },
    { icon: Globe,         label: 'Plan',              value: 'Pro' },
  ];

  return (
    <AppLayout>
      <div className='mx-auto max-w-3xl space-y-6'>

        {/* ── Header card ── */}
        <section className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg sm:p-8'>
          {/* Background orb */}
          <div className='pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10' />
          <div className='pointer-events-none absolute -bottom-8 left-20 h-32 w-32 rounded-full bg-white/5' />

          <div className='relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
            {/* Logo + info */}
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg ${org.logoColor}`}>
                  {org.logoInitials}
                </div>
                <button className='absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow'>
                  <Camera size={11} className='text-slate-600' />
                </button>
              </div>
              <div>
                <h1 className='text-xl font-bold sm:text-2xl'>{org.name}</h1>
                <p className='mt-0.5 text-sm text-blue-200'>@{org.handle}</p>
                <span className='mt-1.5 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium'>
                  {org.industry}
                </span>
              </div>
            </div>

            <button
              onClick={() => { setDraft(org); setEditing(true); }}
              className='flex w-fit items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30'
            >
              <Edit3 size={14} />
              Edit Organisation
            </button>
          </div>

          <p className='relative mt-4 text-sm text-blue-100'>{org.description}</p>
        </section>

        {/* ── Stats row ── */}
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {stats.map(({ icon: Icon, label: l, value }) => (
            <div key={l} className='flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50'>
                <Icon size={18} className='text-blue-500' />
              </div>
              <p className='text-xl font-bold text-slate-900'>{value}</p>
              <p className='text-xs text-slate-400'>{l}</p>
            </div>
          ))}
        </div>

        {/* ── Invite link ── */}
        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-1 text-base font-bold text-slate-900'>Organisation Invite Link</h2>
          <p className='mb-4 text-sm text-slate-400'>Anyone with this link can request to join your organisation.</p>

          <div className='flex gap-2'>
            <div className='flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 overflow-hidden'>
              <span className='truncate'>{inviteLink}</span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>

        {/* ── Logo colour picker ── */}
        <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-base font-bold text-slate-900'>Organisation Logo Colour</h2>
          <div className='flex flex-wrap gap-3'>
            {LOGO_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setOrg((o) => ({ ...o, logoColor: c }))}
                className={`h-10 w-10 rounded-xl ${c} transition-transform hover:scale-110 ${
                  org.logoColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                }`}
              />
            ))}
          </div>
        </section>

        {/* ── Edit modal overlay ── */}
        {editing && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-lg rounded-2xl bg-white shadow-2xl'>
              <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
                <h2 className='font-bold text-slate-900'>Edit Organisation</h2>
                <button onClick={() => setEditing(false)} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>✕</button>
              </div>

              <div className='space-y-4 px-6 py-5'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <label className={label}>Organisation Name</label>
                    <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className={label}>Handle</label>
                    <input value={draft.handle} onChange={(e) => setDraft({ ...draft, handle: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className={label}>Industry</label>
                    <select value={draft.industry} onChange={(e) => setDraft({ ...draft, industry: e.target.value })} className={inp}>
                      {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className='col-span-2'>
                    <label className={label}>Description</label>
                    <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${inp} resize-none`} />
                  </div>
                  <div className='col-span-2'>
                    <label className={label}>Website</label>
                    <input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} className={inp} placeholder='https://' />
                  </div>
                  <div className='col-span-2'>
                    <label className={label}>Logo Initials (2 chars)</label>
                    <input maxLength={2} value={draft.logoInitials} onChange={(e) => setDraft({ ...draft, logoInitials: e.target.value.toUpperCase() })} className={inp} />
                  </div>
                </div>
              </div>

              <div className='flex justify-end gap-3 border-t border-slate-100 px-6 py-4'>
                <button onClick={() => setEditing(false)} className='rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50'>Cancel</button>
                <button
                  onClick={handleSave}
                  className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors ${saved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-700'}`}
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
