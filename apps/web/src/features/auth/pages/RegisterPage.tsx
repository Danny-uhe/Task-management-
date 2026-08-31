import AuthLayout from '@/shared/components/layout/AuthLayout';
import RegisterForm from '../forms/RegisterForm';
import { registerBranding } from '../config/authBranding';

export default function RegisterPage() {
  return (
    <AuthLayout branding={registerBranding}>
      <RegisterForm />
    </AuthLayout>
  );
}
