interface Props {
  message?: string;
}

export default function InputError({ message }: Props) {
  if (!message) return null;

  return <p className='mt-1 text-sm text-[var(--color-danger)]'>{message}</p>;
}
