interface Props {
  text?: string;
}

export default function AuthDivider({
  text = 'OR CONTINUE WITH EMAIL',
}: Props) {
  return (
    <div className='flex items-center gap-4 my-6'>
      <div className='h-px flex-1 bg-[var(--color-border)]' />

      <span className='text-xs text-[var(--color-text-muted)] uppercase'>
        {text}
      </span>

      <div className='h-px flex-1 bg-[var(--color-border)]' />
    </div>
  );
}
