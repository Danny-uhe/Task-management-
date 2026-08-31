export default function TeamStats() {
  return (
    <div className='rounded-2xl border bg-white p-6 shadow-sm'>
      <h2 className='text-lg font-semibold'>Team Statistics</h2>

      <div className='mt-6 space-y-5'>
        <div>
          <div className='flex justify-between'>
            <span>Total Tasks</span>
            <span>148</span>
          </div>

          <div className='mt-2 h-2 rounded-full bg-gray-200'>
            <div className='h-full w-[80%] rounded-full bg-blue-600'></div>
          </div>
        </div>

        <div>
          <div className='flex justify-between'>
            <span>Completed</span>
            <span>124</span>
          </div>

          <div className='mt-2 h-2 rounded-full bg-gray-200'>
            <div className='h-full w-[84%] rounded-full bg-green-500'></div>
          </div>
        </div>

        <div>
          <div className='flex justify-between'>
            <span>Pending</span>
            <span>24</span>
          </div>

          <div className='mt-2 h-2 rounded-full bg-gray-200'>
            <div className='h-full w-[20%] rounded-full bg-orange-500'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
