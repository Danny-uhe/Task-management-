type Props = {
  rank: number;
  name: string;
  tasks: number;
};

export default function UserRankItem({ rank, name, tasks }: Props) {
  return (
    <div className='flex items-center justify-between border-b py-4 last:border-none'>
      <div className='flex items-center gap-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700'>
          {rank}
        </div>

        <div>
          <h3 className='font-semibold'>{name}</h3>
          <p className='text-sm text-gray-500'>Team Member</p>
        </div>
      </div>

      <span className='font-semibold'>{tasks} Tasks</span>
    </div>
  );
}
