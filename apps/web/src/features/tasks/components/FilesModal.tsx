import { useRef, useState } from 'react';
import { X, FileText, ImageIcon, Download, Upload, Trash2 } from 'lucide-react';

type FileItem = {
  id: number;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'file';
};

const SEED_FILES: FileItem[] = [
  { id: 1, name: 'Audit_Report.pdf', size: '1.2 MB', type: 'pdf' },
  { id: 2, name: 'New_Styles.png', size: '4.5 MB', type: 'image' },
  { id: 3, name: 'Spacing_System.pdf', size: '800 KB', type: 'pdf' },
];

type Props = {
  open: boolean;
  taskTitle: string;
  onClose: () => void;
};

const iconMap = {
  pdf: { icon: FileText, bg: 'bg-red-100', color: 'text-red-600' },
  image: { icon: ImageIcon, bg: 'bg-blue-100', color: 'text-blue-600' },
  file: { icon: FileText, bg: 'bg-slate-100', color: 'text-slate-600' },
};

export default function FilesModal({ open, taskTitle, onClose }: Props) {
  const [files, setFiles] = useState<FileItem[]>(SEED_FILES);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const newFiles: FileItem[] = picked.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      type: f.type.startsWith('image') ? 'image' : f.name.endsWith('.pdf') ? 'pdf' : 'file',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDelete = (id: number) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 sm:items-center sm:p-4'>
      <div className='flex h-[75vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[80vh] sm:rounded-2xl'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-slate-100 px-6 py-4'>
          <div>
            <h2 className='font-bold text-slate-900'>Files</h2>
            <p className='mt-0.5 truncate text-xs text-slate-400'>{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'
          >
            <X size={18} />
          </button>
        </div>

        {/* File grid */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {files.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-slate-400'>
              <p className='text-sm'>No files attached yet</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {files.map((f) => {
                const { icon: Icon, bg, color } = iconMap[f.type];
                return (
                  <div
                    key={f.id}
                    className='group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-300'
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}
                    >
                      <Icon size={18} className={color} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs font-semibold text-slate-700'>
                        {f.name}
                      </p>
                      <p className='text-[10px] text-slate-400'>{f.size}</p>
                    </div>
                    <div className='flex gap-1 opacity-0 transition group-hover:opacity-100'>
                      <button className='rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-blue-600'>
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className='rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-500'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className='border-t border-slate-100 px-6 py-4'>
          <input
            ref={inputRef}
            type='file'
            multiple
            className='hidden'
            onChange={handleFileChange}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-300 hover:text-blue-600'
          >
            <Upload size={16} />
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
}
