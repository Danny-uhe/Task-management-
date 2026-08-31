type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  return (
    <div className='mt-4'>
      <div className='h-2 rounded-full bg-slate-200'>
        <div
          className='h-2 rounded-full bg-blue-600 transition-all'
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}
