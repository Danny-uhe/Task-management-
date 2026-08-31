import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/register.schema';

import { Button, Input, PasswordInput } from '@/shared/components/ui';
import GoogleButton from '../components/GoogleButton/GoogleButton';
import AuthDivider from '../components/AuthDivider';
import PasswordStrength from '../components/PasswordStrength';
import TermsCheckBox from '../components/TermsCheckBox';
import FooterLink from '../components/FooterLink';

function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 4) score += 10;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;

  return Math.min(score, 100);
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agree: false,
    },
  });

  const password = watch('password', '');
  const agreed = watch('agree', false);
  const strength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    // TODO: wire up to auth service
    console.log('Register:', data);
    toast.success('Account created successfully!');
    navigate('/login');

    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className='w-full max-w-md'>
      {/* Header */}
      <h1 className='text-3xl font-bold'>Create your account</h1>

      <p className='mt-2 mb-8 text-sm text-[var(--color-text-secondary)]'>
        Start managing your team&apos;s work in minutes
      </p>

      {/* Google OAuth */}
      <GoogleButton />

      {/* Divider */}
      <AuthDivider text='or sign up with email' />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <Input
          label='Full name'
          placeholder='Your name'
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label='Work email'
          type='email'
          placeholder='you@company.com'
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <PasswordInput
            label='Password'
            placeholder='Create a password'
            error={errors.password?.message}
            {...register('password')}
          />

          {password && <PasswordStrength strength={strength} />}
        </div>

        {/* Terms checkbox */}
        <div>
          <TermsCheckBox
            checked={agreed}
            onChange={() => setValue('agree', !agreed, { shouldValidate: true })}
            label={
              <>
                I agree to the{' '}
                <a
                  href='/terms'
                  className='text-[var(--color-primary)] underline'
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms
                </a>{' '}
                &amp;{' '}
                <a
                  href='/privacy'
                  className='text-[var(--color-primary)] underline'
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </>
            }
          />

          {errors.agree && (
            <p className='mt-1 text-sm text-[var(--color-danger)]'>
              {errors.agree.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type='submit' loading={isSubmitting} className='w-full'>
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <div className='mt-8'>
        <FooterLink
          text='Already have an account?'
          action='Log in'
          href='/login'
        />
      </div>
    </div>
  );
}