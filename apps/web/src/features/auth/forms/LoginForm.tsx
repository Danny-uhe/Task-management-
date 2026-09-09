import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button, Input, PasswordInput } from '@/shared/components/ui';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import RememberMe    from '../components/RemenberMe';

import { authService } from '../services/auth.services';
import { useAuthStore } from '@/store/authStore';

export default function LoginForm() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login({
        email:    data.email,
        password: data.password,
      });

      const { user, accessToken, refreshToken } = res.data;

      setAuth(user, accessToken, refreshToken);

      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Invalid email or password';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full max-w-md'>
      <h1 className='text-3xl font-bold text-center'>Welcome back</h1>

      <p className='mt-2 mb-6 text-center text-sm text-[var(--color-text-secondary)]'>
        Log in to your TaskSync workspace
      </p>

      <div className='mt-6 space-y-4'>
        <Input
          label='Email'
          placeholder='you@company.com'
          {...register('email')}
          error={errors.email?.message}
        />

        <PasswordInput
          label='Password'
          placeholder='••••••••'
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className='mt-4 flex items-center justify-between'>
        <RememberMe
          checked={watch('remember') ?? false}
          onChange={() => setValue('remember', !watch('remember'))}
        />

        <Link to='/forgot-password' className='text-sm text-[var(--color-primary)] hover:underline'>
          Forgot password?
        </Link>
      </div>

      <Button type='submit' className='mt-6 w-full' loading={isSubmitting}>
        Log In
      </Button>
    </form>
  );
}
