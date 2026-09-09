import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, CalendarDays, Upload, Trash2, FileText, ImageIcon, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTaskContext } from '@/app/Providers/TaskContext';
import { useAuthStore }   from '@/store/authStore';
import { projectService, type ApiProject } from '@/services/project.service';
import type { TaskStatus, TaskPriority } from '../types/types';

/* ── helpers ─────────────────────────────────────────────────────────────── */

const priorities: { value: TaskPriority; label: string; dot: string }[] = [
  { value: 'high',   label: 'High',   dot: 'bg-red-500'    },
  { value: 'medium', label: 'Medium', dot: 'bg-orange-400' },
  { value: 'low',    label: 'Low',    dot: 'bg-slate-400'  },
];

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review',   label: 'In Review'   },
  { value: 'done',        label: 'Done'        },
];

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

/* ── Component ───────────────────────────────────────────────────────────── */

export default function AddTaskModal() {
  const { addTaskOpen, closeAddTask, addTask } = useTaskContext();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin     = currentUser?.systemRole === 'admin';

  /* Form state */
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState<TaskPriority>('medium');
  const [status,      setStatus]      = useState<TaskStatus>('todo');
  const [dueDate,     setDueDate]     = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [dragging,    setDragging]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  /* Projects */
  const [projects,    setProjects]    = useState<ApiProject[]>([]);
  const [projectId,   setProjectId]   = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  /* Load projects when modal opens */
  useEffect(() => {
    if (!addTaskOpen) return;
    projectService.getProjects().then((res) => {
      setProjects(res.data.projects);
      if (res.data.projects.length > 0) setProjectId(res.data.projects[0].id);
    }).catch(() => toast.error('Could not load projects'));
  }, [addTaskOpen]);

  if (!addTaskOpen) return null;

  /* File handling */
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachments((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({
        name: f.name, size: fmt(f.size), type: guessType(f.name),
      })),
    ]);
  };

  const handleCreate = async () => {
    if (!title.trim() || !projectId) return;
    setSaving(true);
    try {
      await addTask(projectId, {
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate:     dueDate || undefined,
        points:      0,
      });
      toast.success('Task created');
      reset();
      closeAddTask();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to create task'
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setTitle(''); setDescription(''); setPriority('medium');
    setStatus('todo'); setDueDate(''); setAttachments([]); setDragging(false);
  };

  const handleClose = () => { reset(); closeAddTask(); };

  const inp = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4'>
      <div className='flex w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl'>

        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <h2 className='text-lg font-bold text-slate-900'>Add Task</h2>
          <button onClick={handleClose} className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className='max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5'>

          {/* Project selector */}
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-slate-700'>Project</label>
            {projects.length === 0 ? (
              <p className='text-sm text-slate-400'>No projects found. Ask an admin to create one.</p>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={inp}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
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
                    {p.label}
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
              <p className='text-xs text-slate-400'>PDF, PNG, JPG — up to 10 MB each</p>
            </button>
            <input ref={fileRef} type='file' multiple className='hidden' onChange={(e) => addFiles(e.target.files)} />

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

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4'>
          <button
            onClick={handleClose}
            className='rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50'
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || !projectId || saving}
            className='rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40'
          >
            {saving ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
