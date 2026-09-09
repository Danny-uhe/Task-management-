import { useState } from 'react';
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/features/auth/services/auth.services';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [done,            setDone]            = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setDone(true);
      toast.success('Password updated — please log in');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'This reset link is invalid or has expired.';
      toast.error(message);
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
            Set a new password
          </h2>
          <p className='mt-4 text-blue-200'>
            Choose a strong password to keep your workspace secure.
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

          {!token ? (
            <div className='flex flex-col items-center text-center'>
              <h2 className='mt-4 text-2xl font-bold text-slate-900'>
                Invalid reset link
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                This password reset link is missing its token.
              </p>
            </div>
          ) : !done ? (
            <>
              <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100'>
                <Lock size={22} className='text-blue-600' />
              </div>
              <h2 className='mt-4 text-3xl font-bold text-slate-900'>
                Set a new password
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                Choose a new password for your account.
              </p>

              <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    New password
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder='••••••••'
                      required
                      minLength={8}
                      className='h-11 w-full rounded-xl border border-slate-200 px-4 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((v) => !v)}
                      className='absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600'
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='••••••••'
                    required
                    minLength={8}
                    className='h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  />
                </div>

                <button
                  type='submit'
                  disabled={isLoading}
                  className='h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60'
                >
                  {isLoading ? 'Updating…' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className='flex flex-col items-center text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <CheckCircle2 size={32} className='text-green-600' />
              </div>
              <h2 className='mt-5 text-2xl font-bold text-slate-900'>
                Password updated
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className='mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700'
              >
                Go to Log In
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
