import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/features/auth/services/auth.services';

export default function ForgotPasswordPage() {
  const [email,       setEmail]       = useState('');
  const [sent,        setSent]        = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      // Always show success — don't reveal if email exists
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className='flex min-h-screen'>
      {/* Left blue panel — hidden on mobile */}
      <div className='hidden flex-col justify-between bg-blue-600 p-12 lg:flex lg:w-[45%]'>
        <div>
          <h1 className='text-3xl font-bold text-white'>TaskSync</h1>
          <p className='mt-1 text-sm tracking-widest text-blue-200'>WORKSPACE</p>
        </div>

        <div>
          <h2 className='text-4xl font-bold leading-tight text-white'>
            Reset your password
          </h2>
          <p className='mt-4 text-blue-200'>
            We'll send a secure link to your email so you can get back to your
            workspace in minutes.
          </p>
        </div>

        <div className='flex gap-8 text-sm text-blue-200'>
          <div>
            <p className='text-2xl font-bold text-white'>2,400+</p>
            <p>Teams using TaskSync</p>
          </div>
          <div>
            <p className='text-2xl font-bold text-white'>98%</p>
            <p>Uptime last quarter</p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className='flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-12'>
        <div className='w-full max-w-md'>
          {/* Mobile logo */}
          <h1 className='mb-8 text-2xl font-bold text-blue-600 lg:hidden'>
            TaskSync
          </h1>

          {!sent ? (
            <>
              <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100'>
                <Mail size={22} className='text-blue-600' />
              </div>
              <h2 className='mt-4 text-3xl font-bold text-slate-900'>
                Forgot password?
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Email address
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='you@company.com'
                    required
                    className='h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <button
                  type='submit'
                  disabled={isLoading}
                  className='h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60'
                >
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className='flex flex-col items-center text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <CheckCircle2 size={32} className='text-green-600' />
              </div>
              <h2 className='mt-5 text-2xl font-bold text-slate-900'>
                Check your inbox
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                We sent a password reset link to{' '}
                <span className='font-semibold text-slate-700'>{email}</span>
              </p>
              <p className='mt-4 text-xs text-slate-400'>
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSent(false)}
                className='mt-5 text-sm font-semibold text-blue-600 hover:underline'
              >
                Try a different email
              </button>
            </div>
          )}

          {/* Back to login */}
          <Link
            to='/login'
            className='mt-8 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600'
          >
            <ArrowLeft size={16} />
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
