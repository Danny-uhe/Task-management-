import { useEffect, useState } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invitationService, type InvitationDetails } from '@/features/auth/services/invitation.services';
import { useAuthStore } from '@/store/authStore';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [invitation,      setInvitation]      = useState<InvitationDetails | null>(null);
  const [loadError,       setLoadError]       = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  useEffect(() => {
    if (!token) return;
    invitationService
      .getByToken(token)
      .then((res) => setInvitation(res.data.invitation))
      .catch((err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'This invitation link is invalid.';
        setLoadError(message);
      })
      .finally(() => setIsLoadingInvite(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await invitationService.accept(token, { password });
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome to TaskSync, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Could not accept this invitation.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
            You've been invited
          </h2>
          <p className='mt-4 text-blue-200'>
            Set a password to activate your account and start collaborating with your team.
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

          {!token || loadError ? (
            <div className='flex flex-col items-center text-center'>
              <h2 className='mt-4 text-2xl font-bold text-slate-900'>
                Invalid invitation
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                {loadError ?? 'This invitation link is missing its token.'}
              </p>
            </div>
          ) : isLoadingInvite ? (
            <p className='text-sm text-slate-400'>Loading invitation…</p>
          ) : (
            <>
              <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100'>
                <Lock size={22} className='text-blue-600' />
              </div>
              <h2 className='mt-4 text-3xl font-bold text-slate-900'>
                Join {invitation?.organization.name}
              </h2>
              <p className='mt-2 text-sm text-slate-500'>
                <span className='font-semibold text-slate-700'>{invitation?.invitedBy.name}</span>{' '}
                invited you as a{' '}
                <span className='font-semibold text-slate-700'>{invitation?.systemRole}</span>.
                Set a password to activate your account.
              </p>

              <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={invitation?.email ?? ''}
                    disabled
                    className='h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Password
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  disabled={isSubmitting}
                  className='h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60'
                >
                  {isSubmitting ? 'Activating…' : 'Activate Account'}
                </button>
              </form>
            </>
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
