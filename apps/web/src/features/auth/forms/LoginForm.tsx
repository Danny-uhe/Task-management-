import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button, Input, PasswordInput } from '@/shared/components/ui';

import { loginSchema, type LoginFormData } from '../schemas/login.schema';

import GoogleButton from '../components/GoogleButton/GoogleButton';
import AuthDivider from '../components/AuthDivider';
import FooterLink from '../components/FooterLink';
import RememberMe from '../components/RemenberMe';

export default function LoginForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log(data);

    toast.success('Welcome back!');

    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full max-w-md'>
      <h1 className='text-3xl font-bold text-center'>Welcome back</h1>

      <p className='mt-2 mb-6 text-center text-sm text-[var(--color-text-secondary)]'>
        Log in to your TaskSync workspace
      </p>

      <GoogleButton />

      <AuthDivider text='OR LOG IN WITH EMAIL' />

      <div className='space-y-4'>
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
          checked={watch('remember')}
          onChange={() => setValue('remember', !watch('remember'))}
        />

        <Link to='/forgot-password' className='text-sm text-[var(--color-primary)] hover:underline'>
          Forgot password?
        </Link>
      </div>

      <Button type='submit' className='mt-6 w-full' loading={isSubmitting}>
        Log In
      </Button>

      <div className='mt-8'>
        <FooterLink
          text="Don't have an account?"
          action='Sign up free'
          href='/register'
        />
      </div>
    </form>
  );
}
