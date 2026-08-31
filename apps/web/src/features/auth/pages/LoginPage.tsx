import AuthLayout from '@/shared/components/layout/AuthLayout';
import LoginForm from '../forms/LoginForm';
import { loginBranding } from '../config/authBranding';

export default function LoginPage() {
  return (
    <AuthLayout branding={loginBranding}>
      <LoginForm />
    </AuthLayout>
  );
}
