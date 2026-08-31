import { useState } from 'react';

/* ─── Toggle Switch ──────────────────────────────────────────── */
function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      id={id}
      role='switch'
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        checked ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function SharingVisibilityCard() {
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [shareStreak, setShareStreak] = useState(false);
  const [notifyAchievement, setNotifyAchievement] = useState(true);

  const items = [
    {
      id: 'toggle-show-leaderboard',
      label: 'Show me on the team leaderboard',
      description: 'Off by default. Ranking is based on tasks completed, not points.',
      checked: showOnLeaderboard,
      onChange: () => setShowOnLeaderboard((v) => !v),
    },
    {
      id: 'toggle-share-streak',
      label: 'Share my streak with my team',
      description: 'Keeps your daily streak visible only to you until enabled',
      checked: shareStreak,
      onChange: () => setShareStreak((v) => !v),
    },
    {
      id: 'toggle-notify-achievement',
      label: 'Notify teammates when I unlock an achievement',
      description: 'Posts a low-key note in team activity, not a popup',
      checked: notifyAchievement,
      onChange: () => setNotifyAchievement((v) => !v),
    },
  ];

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6'>
      {/* Header */}
      <div className='mb-5'>
        <h2 className='text-xl font-bold text-gray-900'>Sharing &amp; visibility</h2>
        <p className='mt-1 text-sm text-gray-500'>
          You control what teammates can see about your activity
        </p>
      </div>

      {/* Toggle rows */}
      <div className='space-y-3'>
        {items.map((item) => (
          <div
            key={item.id}
            className='flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4'
          >
            <div className='min-w-0'>
              <p className='font-semibold text-gray-900'>{item.label}</p>
              <p className='mt-0.5 text-sm text-gray-400'>{item.description}</p>
            </div>
            <Toggle
              id={item.id}
              checked={item.checked}
              onChange={item.onChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
