export default function TodayProgressCard() {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
          Today's Progress
        </h3>

        <span className='text-sm font-bold text-blue-600'>60%</span>
      </div>

      {/* Progress Bar */}
      <div className='mt-5 h-2 overflow-hidden rounded-full bg-gray-200'>
        <div className='h-full w-[60%] rounded-full bg-blue-600'></div>
      </div>

      {/* Stats */}
      <div className='mt-8 grid grid-cols-2 gap-6'>
        <div>
          <p className='text-sm text-gray-500'>Tasks</p>
          <h2 className='mt-1 text-3xl font-bold'>3 / 5</h2>
        </div>

        <div>
          <p className='text-sm text-gray-500'>Remaining</p>
          <h2 className='mt-1 text-3xl font-bold'>2</h2>
        </div>
      </div>

      {/* Bottom */}
      <div className='mt-10 flex items-center justify-between'>
        <div className='text-sm font-medium text-green-600'>+120 Points</div>

        <div className='text-sm text-gray-500'>5 Day Streak</div>
      </div>
    </div>
  );
}
