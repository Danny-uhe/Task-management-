import { Lock } from 'lucide-react';

export default function PeerViewCard() {
  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5'>
      {/* Header */}
      <h2 className='font-bold text-gray-900'>Peer view — opted out</h2>
      <p className='mt-0.5 text-xs text-gray-500'>
        Example of how a teammate who hasn't opted in appears to others
      </p>

      {/* Content */}
      <div className='mt-4 flex flex-col items-center py-2 text-center'>
        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-100'>
          <Lock className='h-6 w-6 text-gray-400' />
        </div>

        <p className='mt-3 text-sm leading-relaxed text-gray-500'>
          This teammate keeps their task activity private. No rank, no streak,
          no points shown to the team.
        </p>
      </div>
    </div>
  );
}
