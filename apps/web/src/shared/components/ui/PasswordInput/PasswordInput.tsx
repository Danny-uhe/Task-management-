import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import Input from '../Input';
import type { PasswordInputProps } from './PasswordInput.types';

export default function PasswordInput({ ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type='button'
          onClick={() => setShowPassword((prev) => !prev)}
          className='text-slate-500 hover:text-slate-700 transition-colors'
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
