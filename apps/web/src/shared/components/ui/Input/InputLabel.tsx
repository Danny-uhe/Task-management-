interface Props {
  htmlFor: string;
  children: React.ReactNode;
}

export default function InputLabel({ htmlFor, children }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className='mb-2 block text-sm font-medium text-[var(--color-text-primary)]'
    >
      {children}
    </label>
  );
}
