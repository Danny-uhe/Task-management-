import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center'>
      <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100'>
        <span className='text-5xl font-black text-blue-500'>4</span>
        <span className='text-5xl font-black text-slate-300'>0</span>
        <span className='text-5xl font-black text-blue-500'>4</span>
      </div>
      <h1 className='mt-6 text-2xl font-bold text-slate-900'>Page not found</h1>
      <p className='mt-2 text-sm text-slate-500'>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to='/dashboard'
        className='mt-6 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700'
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
