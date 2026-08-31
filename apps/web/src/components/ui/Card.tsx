interface Props {
  children: React.ReactNode;
}

export default function Card({ children }: Props) {
  return (
    <div className='rounded-2xl border bg-white p-6 shadow-sm'>{children}</div>
  );
}
