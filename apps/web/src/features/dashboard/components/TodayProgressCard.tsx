export default function TodayProgressCard() {
  return (
    <div className='rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
          Today's Progress
        </h3>

        <span className='text-sm font-bold text-cyan-400'>60%</span>
      </div>

      {/* Progress Bar */}
      <div className='mt-5 h-2 overflow-hidden rounded-full bg-zinc-700'>
        <div className='h-full w-[60%] rounded-full bg-cyan-500'></div>
      </div>

      {/* Stats */}
      <div className='mt-8 grid grid-cols-2 gap-6'>
        <div>
          <p className='text-sm text-zinc-400'>Tasks</p>
          <h2 className='mt-1 text-3xl font-bold text-white'>3 / 5</h2>
        </div>

        <div>
          <p className='text-sm text-zinc-400'>Remaining</p>
          <h2 className='mt-1 text-3xl font-bold text-white'>2</h2>
        </div>
      </div>

      {/* Bottom */}
      <div className='mt-10 flex items-center justify-between'>
        <div className='text-sm font-medium text-green-400'>+120 Points</div>

        <div className='text-sm text-zinc-400'>5 Day Streak</div>
      </div>
    </div>
  );
}
