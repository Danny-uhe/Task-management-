import { useState } from 'react';
import { X, FileText, ImageIcon, Paperclip, Plus, MessageCircle } from 'lucide-react';
import type { Task } from '../types/types';
import CommentsModal from './CommentsModal';
import FilesModal from './FilesModal';

type Props = {
  task: Task;
  onClose: () => void;
  onEdit?: () => void;
};

type Tab = 'Notes' | 'Comments' | 'Files';

export default function TaskDetailPanel({ task, onClose, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Notes');
  const [showComments, setShowComments] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  const actionItems = task.actionItems ?? [
    { label: 'Review typography tokens', done: true },
    { label: 'Audit spacing system', done: true },
    { label: 'Implement dark mode classes', done: false },
  ];

  const attachments = task.attachments ?? [
    { name: 'Audit_Report.pdf', size: '1.2 MB', type: 'pdf' as const },
    { name: 'New_Styles.png', size: '4.5 MB', type: 'image' as const },
  ];

  const doneCount = actionItems.filter((a) => a.done).length;
  const tabs: Tab[] = ['Notes', 'Comments', 'Files'];

  const handleTabClick = (tab: Tab) => {
    if (tab === 'Comments') {
      setShowComments(true);
      return;
    }
    if (tab === 'Files') {
      setShowFiles(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <>
      <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900'>

        {/* ── Header ─────────────────────────────────── */}
        <div className='flex items-start justify-between border-b border-zinc-700 p-4 sm:p-5'>
          <h2 className='pr-3 text-sm font-bold leading-snug text-white sm:text-base'>
            {task.title}
          </h2>
          <div className='flex flex-shrink-0 items-center gap-1'>
            {onEdit && (
              <button
                onClick={onEdit}
                className='rounded-lg px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10'
              >
                Edit
              </button>
            )}
            <button
              id='close-detail-panel-btn'
              onClick={onClose}
              className='rounded-lg p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Assignee + Due Date ─────────────────────── */}
        <div className='grid grid-cols-2 gap-3 border-b border-zinc-700 px-4 py-3 sm:px-5 sm:py-4'>
          <div>
            <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500'>
              Assignee
            </p>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white'>
                {(task.assignedTo?.name ?? 'RI').slice(0, 2).toUpperCase()}
              </div>
              <span className='text-sm font-medium text-zinc-300'>
                {task.assignedTo?.name ?? 'Rowland'}
              </span>
            </div>
          </div>

          <div>
            <p className='mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500'>
              Due Date
            </p>
            <p className='text-sm font-medium text-zinc-300'>{task.dueDate}</p>
          </div>
        </div>

        {/* ── Description ──────────────────────────────── */}
        <div className='border-b border-zinc-700 px-4 py-3 sm:px-5 sm:py-4'>
          <div className='mb-2 flex items-center gap-2'>
            <FileText size={13} className='text-zinc-500' />
            <p className='text-xs font-semibold text-zinc-300'>Description</p>
          </div>
          <p className='rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-xs leading-relaxed text-zinc-400 sm:text-sm'>
            {task.description ??
              'Modernize the task experience with focus on visual clarity and user momentum.'}
          </p>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className='flex border-b border-zinc-700 px-4 sm:px-5'>
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`detail-tab-${tab.toLowerCase()}-btn`}
              onClick={() => handleTabClick(tab)}
              className={`mr-3 border-b-2 py-2.5 text-xs font-medium transition-colors sm:mr-4 sm:text-sm ${
                activeTab === tab && tab === 'Notes'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
              {tab === 'Comments' && task.comments !== undefined && (
                <span className='ml-1 text-zinc-500'>({task.comments})</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notes content ────────────────────────────── */}
        <div className='flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4'>
          {/* Action items */}
          <div className='flex items-center justify-between'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-zinc-500'>
              Action Items
            </p>
            <span className='text-xs font-semibold text-cyan-400'>
              {doneCount}/{actionItems.length} Done
            </span>
          </div>

          <div className='mt-2 space-y-2'>
            {actionItems.map((item, i) => (
              <div
                key={i}
                className='flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 sm:px-4 sm:py-3'
              >
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${
                    item.done
                      ? 'bg-cyan-500'
                      : 'border-2 border-zinc-600 bg-zinc-700'
                  }`}
                >
                  {item.done && (
                    <svg
                      className='h-3 w-3 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm ${
                    item.done
                      ? 'text-zinc-500 line-through'
                      : 'text-zinc-300'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div className='mt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Paperclip size={12} className='text-zinc-500' />
                <p className='text-[10px] font-semibold uppercase tracking-widest text-zinc-500'>
                  Attachments
                </p>
              </div>
              <button
                id='add-attachment-btn'
                onClick={() => setShowFiles(true)}
                className='flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300'
              >
                <Plus size={12} /> Add New
              </button>
            </div>

            <div className='mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className='flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 p-2.5 sm:p-3'
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      file.type === 'pdf'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {file.type === 'pdf' ? (
                      <FileText size={14} />
                    ) : (
                      <ImageIcon size={14} />
                    )}
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-xs font-semibold text-zinc-300'>
                      {file.name}
                    </p>
                    <p className='text-[10px] text-zinc-500'>{file.size}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Open full files view */}
            <button
              onClick={() => setShowFiles(true)}
              className='mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-700 py-2 text-xs font-medium text-zinc-500 hover:border-cyan-500/50 hover:text-cyan-400'
            >
              <MessageCircle size={12} />
              View all files
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CommentsModal
        open={showComments}
        taskTitle={task.title}
        onClose={() => setShowComments(false)}
      />
      <FilesModal
        open={showFiles}
        taskTitle={task.title}
        onClose={() => setShowFiles(false)}
      />
    </>
  );
}
