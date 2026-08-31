import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/shared/components/ui';
import type { GoogleButtonProps } from './GoogleButton.types';

export default function GoogleButton({ loading, onClick }: GoogleButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      loading={loading}
      onClick={onClick}
      className='w-full gap-3'
    >
      <FcGoogle size={18} />
      Continue with Google
    </Button>
  );
}
