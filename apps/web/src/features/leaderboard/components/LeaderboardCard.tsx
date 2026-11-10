type Props = {
  position: number;
  name: string;
  tasks: number;
  points: number;
  color: string;
};

export default function LeaderboardCard({
  position,
  name,
  tasks,
  points,
  color,
}: Props) {
  return (
    <div className='rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${color} text-xl font-bold text-white`}
        >
          {position}
        </div>

        <div className='text-right'>
          <p className='text-sm text-zinc-400'>Completed</p>
          <h3 className='text-2xl font-bold text-white'>{tasks}</h3>
        </div>
      </div>

      <div className='mt-5'>
        <h2 className='text-lg font-semibold text-white'>{name}</h2>

        <p className='mt-2 text-cyan-400 font-semibold'>{points} pts</p>
      </div>
    </div>
  );
}
