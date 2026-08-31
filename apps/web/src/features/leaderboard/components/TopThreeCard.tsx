import { Crown } from 'lucide-react';

export default function TopThreeCard() {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Top Performers</h2>

          <p className='text-sm text-slate-500'>This week's leaders</p>
        </div>

        <Crown className='text-yellow-500' />
      </div>

      <div className='grid grid-cols-3 gap-5'>
        {[
          {
            name: 'Daniel',
            points: 1240,
            place: '1st',
          },
          {
            name: 'Sarah',
            points: 1180,
            place: '2nd',
          },
          {
            name: 'David',
            points: 1100,
            place: '3rd',
          },
        ].map((user) => (
          <div
            key={user.name}
            className='rounded-xl border border-gray-200 bg-slate-50 p-5 text-center'
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}`}
              className='mx-auto h-16 w-16 rounded-full'
            />

            <h3 className='mt-3 font-semibold'>{user.name}</h3>

            <p className='text-sm text-slate-500'>{user.points} pts</p>

            <span className='mt-3 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs text-white'>
              {user.place}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
