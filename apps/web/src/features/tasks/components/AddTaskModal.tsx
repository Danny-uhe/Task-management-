import { useState, useRef } from 'react';
import { X, ChevronDown, CalendarDays, Upload, Trash2, FileText, ImageIcon, File } from 'lucide-react';
import { useTaskContext } from '@/app/Providers/TaskContext';
import { useNotifications } from '@/app/Providers/NotificationContext';
import type { Task } from '../types/types';

/* ── helpers ── */
const priorities: { value: Task['priority']; color: string; dot: string }[] = [
  { value: 'High',   color: 'border-blue-500 bg-blue-50',   dot: 'bg-red-500'    },
  { value: 'Medium', color: 'border-blue-500 bg-blue-50',   dot: 'bg-orange-400' },
  { value: 'Low',    color: 'border-slate-200 bg-white',    dot: 'bg-slate-400'  },
];

const statuses: { value: Task['status']; label: string }[] = [
  { value: 'todo',      label: 'To do'       },
  { value: 'progress',  label: 'In progress' },
  { value: 'review',    label: 'In review'   },
  { value: 'completed', label: 'Done'        },
];

const filterFromStatus = (s: Task['status']): Task['filter'] => {
  if (s === 'completed') return 'Completed';
  return 'Today';
};

type AttachedFile = { name: string; size: string; type: 'pdf' | 'image' | 'file' };

function fileIcon(type: AttachedFile['type']) {
  if (type === 'pdf')   return <FileText  size={16} className='text-red-500'  />;
  if (type === 'image') return <ImageIcon size={16} className='text-blue-500' />;
  return                       <File      size={16} className='text-slate-400' />;
}

function guessType(name: string): AttachedFile['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'file';
}

function fmt(bytes: number) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── ASSIGNEE DROPDOWN ── */
const ASSIGNEES = [
  { initials: 'RI', name: 'Rowland I.', color: 'bg-blue-500'    },
  { initials: 'SM', name: 'Sarah M.',   color: 'bg-purple-500'  },
  { initials: 'DT', name: 'Dev Team',   color: 'bg-emerald-500' },
];

export default function AddTaskModal() {
  const { addTaskOpen, closeAddTask, addTask } = useTaskContext();
  const { addNotification } = useNotifications();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState<Task['priority']>('Medium');
  const [status,      setStatus]      = useState<Task['status']>('todo');
  const [dueDate,     setDueDate]     = useState('');
  const [assigneeIdx, setAssigneeIdx] = useState(0);
  const [showAssignee, setShowAssignee] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [dragging,    setDragging]    = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  if (!addTaskOpen) return null;

  /* ── file handling ── */
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: AttachedFile[] = Array.from(files).map((f) => ({
      name: f.name,
      size: fmt(f.size),
      type: guessType(f.name),
    }));
    setAttachments((prev) => [...prev, ...next]);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const assignee = ASSIGNEES[assigneeIdx];
    addTask({
      title,
      description,
      priority,
      status,
      filter: filterFromStatus(status),
      dueDate: dueDate || 'Today',
      assignee: assignee.name,
      assigneeColor: assignee.color,
      progress: 0,
      comments: 0,
      actionItems: [],
      attachments,
    });
    /* Fire notification if assigning to someone else */
    if (assigneeIdx !== 0) {
      addNotification({
        type: 'assignment',
        title: 'Task Assigned',
        message: `You assigned "${title}" to ${assignee.name}`,
        avatarColor: assignee.color,
        avatarInitials: assignee.initials,
      });
    }
    reset();
    closeAddTask();
  };

  const reset = () => {
    setTitle(''); setDescription(''); setPriority('Medium');
    setStatus('todo'); setDueDate(''); setAssigneeIdx(0);
    setAttachments([]); setDragging(false);
  };

  const handleClose = () => { reset(); closeAddTask(); };

  const inp = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4'>
      <div className='flex w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl'>

        {/* ── Header ── */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <h2 className='text-lg font-bold text-slate-900'>Add task</h2>
          <button onClick={handleClose} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className='max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5'>

          {/* Task title */}
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-slate-700'>Task title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. Redesign onboarding flow'
              className={inp}
            />
          </div>

          {/* Description */}
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-slate-700'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='What needs to happen here?'
              rows={3}
              className={`${inp} resize-none`}
            />
          </div>

          {/* Assignee + Due date */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Assignee */}
            <div>
              <label className='mb-1.5 block text-sm font-semibold text-slate-700'>Assignee</label>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setShowAssignee(!showAssignee)}
                  className={`${inp} flex items-center justify-between gap-2 text-left`}
                >
                  <div className='flex items-center gap-2'>
                    <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${ASSIGNEES[assigneeIdx].color}`}>
                      {ASSIGNEES[assigneeIdx].initials}
                    </span>
                    <span className='text-slate-700'>{ASSIGNEES[assigneeIdx].name.split(' ')[0]}</span>
                  </div>
                  <ChevronDown size={14} className='text-slate-400' />
                </button>

                {showAssignee && (
                  <div className='absolute left-0 top-full z-10 mt-1 w-full rounded-xl border border-slate-100 bg-white py-1 shadow-lg'>
                    {ASSIGNEES.map((a, i) => (
                      <button
                        key={a.name}
                        onClick={() => { setAssigneeIdx(i); setShowAssignee(false); }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50'
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${a.color}`}>
                          {a.initials}
                        </span>
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className='mb-1.5 block text-sm font-semibold text-slate-700'>Due date</label>
              <div className='relative'>
                <CalendarDays size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  type='date'
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`${inp} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className='mb-2 block text-sm font-semibold text-slate-700'>Priority</label>
            <div className='grid grid-cols-3 gap-2'>
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type='button'
                  onClick={() => setPriority(p.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 py-3 transition-all ${
                    priority === p.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${p.dot}`} />
                  <span className={`text-sm font-semibold ${priority === p.value ? 'text-slate-900' : 'text-slate-500'}`}>
                    {p.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className='mb-2 block text-sm font-semibold text-slate-700'>Status</label>
            <div className='flex flex-wrap gap-2'>
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type='button'
                  onClick={() => setStatus(s.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    status === s.value
                      ? 'bg-blue-500 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className='mb-2 block text-sm font-semibold text-slate-700'>Attachments</label>

            {/* Drop zone */}
            <button
              type='button'
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors ${
                dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <Upload size={22} className='text-blue-400' />
              <p className='text-sm'>
                <span className='font-semibold text-blue-500'>Click to upload</span>
                <span className='text-slate-400'> or drag and drop</span>
              </p>
              <p className='text-xs text-slate-400'>PDF, PNG, JPG, or DOCX — up to 10MB each</p>
            </button>
            <input ref={fileRef} type='file' multiple className='hidden' onChange={(e) => addFiles(e.target.files)} />

            {/* File list */}
            {attachments.length > 0 && (
              <div className='mt-2 space-y-2'>
                {attachments.map((f, i) => (
                  <div key={i} className='flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5'>
                    <div className='flex items-center gap-2'>
                      {fileIcon(f.type)}
                      <div>
                        <p className='text-xs font-semibold text-slate-700'>{f.name}</p>
                        <p className='text-[10px] text-slate-400'>{f.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                      className='rounded p-1 text-slate-300 hover:text-red-500'
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className='flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4'>
          <button
            onClick={handleClose}
            className='rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50'
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className='rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40'
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
