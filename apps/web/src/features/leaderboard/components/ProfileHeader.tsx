import { Building2, Pencil } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <div className='flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-4'>
        {/* Avatar */}
        <div className='h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 sm:h-20 sm:w-20' />

        <div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Relentless Inivie
          </h1>

          <div className='mt-1.5 flex flex-wrap items-center gap-3'>
            <span className='rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-800'>
              Product Designer
            </span>

            <span className='flex items-center gap-1.5 text-xs text-gray-500'>
              <Building2 className='h-3.5 w-3.5' />
              Experience &amp; Interface Team
            </span>
          </div>
        </div>
      </div>

      <button
        id='edit-profile-btn'
        className='flex items-center gap-2 self-start rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 active:scale-95 sm:self-auto'
      >
        <Pencil className='h-4 w-4' />
        Edit Profile
      </button>
    </div>
  );
}
