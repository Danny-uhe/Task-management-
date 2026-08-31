interface Props {
  strength: number;
}

function getStrengthConfig(strength: number) {
  if (strength <= 25)
    return { label: 'Weak', color: '#EF4444', hint: 'add more characters' };
  if (strength <= 50)
    return { label: 'Fair', color: '#F59E0B', hint: 'try adding numbers or symbols' };
  if (strength <= 75)
    return { label: 'Good', color: '#22C55E', hint: 'at least 8 characters, 1 number' };
  return { label: 'Strong', color: '#06B6D4', hint: 'at least 8 characters, 1 number' };
}

export default function PasswordStrength({ strength }: Props) {
  const { label, color, hint } = getStrengthConfig(strength);

  return (
    <div className='mt-2'>
      <div className='h-1.5 overflow-hidden rounded-full bg-slate-200'>
        <div
          style={{
            width: `${strength}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
          className='h-full rounded-full'
        />
      </div>

      <p className='mt-1.5 text-xs text-[var(--color-text-secondary)]'>
        <span style={{ color }} className='font-medium'>
          {label}
        </span>
        {' \u2014 '}
        {hint}
      </p>
    </div>
  );
}
