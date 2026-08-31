type Props = {
  initials: string;
  color: string;
};

export default function MemberAvatar({ initials, color }: Props) {
  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ${color}`}
    >
      {initials}
    </div>
  );
}
