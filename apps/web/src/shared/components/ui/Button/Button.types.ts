import { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;

  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

  size?: 'sm' | 'md' | 'lg';
}
