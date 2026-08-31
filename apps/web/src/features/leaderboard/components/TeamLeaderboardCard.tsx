type Member = {
  rank: number;
  name: string;
  role: string;
  tasks: number;
  avatarColor: string;
  isYou: boolean;
};

const teamMembers: Member[] = [
  {
    rank: 1,
    name: 'Relentless Inivie',
    role: 'Product Designer',
    tasks: 24,
    avatarColor: 'bg-blue-500',
    isYou: true,
  },
  {
    rank: 2,
    name: 'Christal Jenkins',
    role: 'Graphics Designer',
    tasks: 22,
    avatarColor: 'bg-red-500',
    isYou: false,
  },
  {
    rank: 3,
    name: 'Chioma E.',
    role: 'Social Media Manager',
    tasks: 19,
    avatarColor: 'bg-green-500',
    isYou: false,
  },
  {
    rank: 4,
    name: 'Stevenson',
    role: 'Data Analytics',
    tasks: 17,
    avatarColor: 'bg-blue-400',
    isYou: false,
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function TeamLeaderboardCard() {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5'>
      {/* Header */}
      <h2 className='font-bold text-gray-900'>Team leaderboard</h2>
      <p className='mt-0.5 text-xs text-gray-500'>
        You're opted in — visible to Experience &amp; Interface Team only
      </p>

      {/* Member list */}
      <div className='mt-4 space-y-3'>
        {teamMembers.map((member) => (
          <div key={member.rank} className='flex items-center justify-between gap-3'>
            {/* Avatar + info */}
            <div className='flex min-w-0 items-center gap-3'>
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${member.avatarColor}`}
              >
                {getInitials(member.name)}
              </div>

              <div className='min-w-0'>
                <p
                  className={`truncate text-sm font-semibold ${
                    member.isYou ? 'text-blue-500' : 'text-gray-900'
                  }`}
                >
                  {member.name}
                  {member.isYou && (
                    <span className='ml-1 font-normal text-blue-400'>(You)</span>
                  )}
                </p>
                <p className='text-xs text-gray-400'>{member.role}</p>
              </div>
            </div>

            {/* Task count */}
            <span className='flex-shrink-0 text-sm font-semibold text-gray-700'>
              {member.tasks} tasks
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
