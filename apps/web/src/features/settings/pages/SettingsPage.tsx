import { useState, useEffect } from 'react';
import {
  Camera, Eye, EyeOff, Trash2, AlertTriangle,
  Zap, Flame, Trophy, Bell, Shield, Palette, Moon, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '@/layout/AppLayout';
import ConfirmModal from '../components/ConfirmModal';
import { useUserProfile } from '@/app/Providers/UserProfileContext';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';

type Tab = 'profile' | 'account' | 'notifications' | 'appearance';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: Camera   },
  { id: 'account',       label: 'Account',       icon: Shield   },
  { id: 'notifications', label: 'Notifications', icon: Bell     },
  { id: 'appearance',    label: 'Appearance',    icon: Palette  },
];

export default function SettingsPage() {
  const {
    name, email, role, avatarUrl, points, streak, rank,
    setName, setEmail, setRole, openAvatarPicker,
  } = useUserProfile();
  const authUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  /* Local copies so edits don't fire until Save */
  const [localName,  setLocalName]  = useState(name);
  const [localEmail, setLocalEmail] = useState(email);
  const [localRole,  setLocalRole]  = useState(role);
  const [bio, setBio] = useState(
    authUser?.bio || 'Building beautiful, functional interfaces for teams that move fast.',
  );

  useEffect(() => {
    if (name) setLocalName(name);
  }, [name]);

  useEffect(() => {
    if (email) setLocalEmail(email);
  }, [email]);

  useEffect(() => {
    if (role) setLocalRole(role);
  }, [role]);

  useEffect(() => {
    if (authUser?.bio) setBio(authUser.bio);
  }, [authUser?.bio]);

  /* Password fields */
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError,     setPwError]     = useState('');

  /* Notification prefs */
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned:  true,
    taskCompleted: true,
    mentions:      true,
    invites:       true,
    weeklyDigest:  false,
    emailAlerts:   true,
  });

  /* Appearance */
  const [darkMode,  setDarkMode]  = useState(false);
  const [language,  setLanguage]  = useState('English');
  const [timezone,  setTimezone]  = useState('UTC+1 (Lagos)');

  /* UI state */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [saving,          setSaving]          = useState(false);

  const handleSave = async () => {
    if (activeTab === 'profile') {
      try {
        setSaving(true);
        const res = await userService.updateProfile({
          name: localName,
          bio,
          position: localRole,
        });

        setName(localName);
        setEmail(localEmail);
        setRole(localRole);
        if (res.data?.user) {
          useAuthStore.getState().updateUser(res.data.user);
        }

        setSaved(true);
        toast.success('Profile updated successfully');
        setTimeout(() => setSaved(false), 2000);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to update profile';
        toast.error(errorMsg);
      } finally {
        setSaving(false);
      }
    } else if (activeTab === 'account') {
      if (!currentPw) {
        setPwError('Current password is required');
        toast.error('Current password is required');
        return;
      }
      if (!newPw) {
        setPwError('New password is required');
        toast.error('New password is required');
        return;
      }
      if (newPw.length < 6) {
        setPwError('New password must be at least 6 characters');
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (newPw !== confirmPw) {
        setPwError('Passwords do not match');
        toast.error('Passwords do not match');
        return;
      }

      setPwError('');
      try {
        setSaving(true);
        const res = await userService.changePassword({
          currentPassword: currentPw,
          newPassword: newPw,
        });

        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        setSaved(true);
        toast.success(res.data?.message || 'Password changed successfully');
        setTimeout(() => setSaved(false), 2000);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to change password';
        setPwError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setSaving(false);
      }
    }
  };

  const inp = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  const lbl = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400';

  /* ── Toggle helper ── */
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role='switch'
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <AppLayout>
      <div className='mx-auto max-w-3xl space-y-6'>

        {/* ── Page title ── */}
        <div>
          <h1 className='text-xl font-bold text-slate-900 sm:text-2xl'>Settings</h1>
          <p className='mt-0.5 text-sm text-slate-400'>Manage your account and preferences</p>
        </div>

        <div className='flex flex-col gap-6 lg:flex-row'>

          {/* ── Sidebar tabs ── */}
          <nav className='flex flex-row gap-1 overflow-x-auto lg:w-48 lg:flex-shrink-0 lg:flex-col'>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* ── Tab content ── */}
          <div className='flex-1 space-y-5'>

            {/* ════ PROFILE TAB ════ */}
            {activeTab === 'profile' && (
              <>
                {/* Stats banner */}
                <section className='rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-sm'>
                  <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-blue-200'>Your Progress</p>
                  <div className='grid grid-cols-3 gap-3'>
                    <div className='flex flex-col items-center gap-1 rounded-xl bg-white/15 py-3'>
                      <Zap size={18} className='text-yellow-300' fill='currentColor' />
                      <p className='text-lg font-bold'>{points.toLocaleString()}</p>
                      <p className='text-[10px] text-blue-200'>Points</p>
                    </div>
                    <div className='flex flex-col items-center gap-1 rounded-xl bg-white/15 py-3'>
                      <Flame size={18} className='text-orange-300' />
                      <p className='text-lg font-bold'>{streak}</p>
                      <p className='text-[10px] text-blue-200'>Day Streak</p>
                    </div>
                    <div className='flex flex-col items-center gap-1 rounded-xl bg-white/15 py-3'>
                      <Trophy size={18} className='text-yellow-300' />
                      <p className='text-lg font-bold'>#{rank}</p>
                      <p className='text-[10px] text-blue-200'>Rank</p>
                    </div>
                  </div>
                </section>

                {/* Avatar + basic info */}
                <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                  <h2 className='mb-5 text-base font-bold text-slate-900'>Basic Info</h2>

                  <div className='mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start'>
                    <div className='relative'>
                      <img
                        src={avatarUrl}
                        alt='Profile avatar'
                        className='h-20 w-20 rounded-full object-cover ring-4 ring-blue-100'
                      />
                      <button
                        type='button'
                        onClick={openAvatarPicker}
                        className='absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-700'
                      >
                        <Camera size={13} />
                      </button>
                    </div>
                    <div className='text-center sm:text-left'>
                      <p className='font-semibold text-slate-800'>{localName}</p>
                      <p className='text-sm text-slate-400'>{localRole}</p>
                      <button
                        type='button'
                        onClick={openAvatarPicker}
                        className='mt-2 text-xs font-medium text-blue-500 hover:underline'
                      >
                        Change profile photo
                      </button>
                      <p className='mt-0.5 text-xs text-slate-400'>JPG, GIF or PNG — max 2 MB</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className={lbl}>Full Name</label>
                      <input value={localName} onChange={(e) => setLocalName(e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Work Email</label>
                      <input type='email' value={localEmail} onChange={(e) => setLocalEmail(e.target.value)} className={inp} />
                    </div>
                    <div className='sm:col-span-2'>
                      <label className={lbl}>Role / Title</label>
                      <input value={localRole} onChange={(e) => setLocalRole(e.target.value)} className={inp} />
                    </div>
                    <div className='sm:col-span-2'>
                      <label className={lbl}>Bio</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inp} resize-none`} />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ════ ACCOUNT TAB ════ */}
            {activeTab === 'account' && (
              <>
                <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                  <h2 className='mb-5 text-base font-bold text-slate-900'>Change Password</h2>
                  <div className='space-y-4'>
                    {[
                      { label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                      { label: 'New Password',     val: newPw,     set: setNewPw,     show: showNew,     toggle: () => setShowNew(!showNew)         },
                      { label: 'Confirm Password', val: confirmPw, set: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                    ].map(({ label, val, set, show, toggle }) => (
                      <div key={label}>
                        <label className={lbl}>{label}</label>
                        <div className='relative'>
                          <input
                            type={show ? 'text' : 'password'}
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            placeholder='••••••••'
                            className={`${inp} pr-10`}
                          />
                          <button type='button' onClick={toggle} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'>
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {pwError && <p className='text-sm font-medium text-red-500'>{pwError}</p>}
                  </div>
                </section>

                <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                  <h2 className='mb-2 text-base font-bold text-slate-900'>Connected Accounts</h2>
                  <p className='mb-4 text-sm text-slate-400'>Link external accounts for easier login</p>
                  {[
                    { name: 'Google',   icon: '🟢', connected: false },
                    { name: 'GitHub',   icon: '⚫', connected: false },
                    { name: 'Slack',    icon: '🟣', connected: false },
                  ].map((acc) => (
                    <div key={acc.name} className='flex items-center justify-between border-b border-slate-100 py-3 last:border-0'>
                      <div className='flex items-center gap-3'>
                        <span className='text-xl'>{acc.icon}</span>
                        <span className='text-sm font-medium text-slate-700'>{acc.name}</span>
                      </div>
                      <button className='rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50'>
                        {acc.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </section>

                {/* Danger Zone */}
                <section className='rounded-2xl border border-red-200 bg-red-50 p-6'>
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-start gap-3'>
                      <AlertTriangle size={20} className='mt-0.5 flex-shrink-0 text-red-500' />
                      <div>
                        <h2 className='font-bold text-red-700'>Danger Zone</h2>
                        <p className='mt-0.5 text-sm text-red-500'>
                          Permanently delete your account and all associated data.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className='flex w-fit items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
                    >
                      <Trash2 size={15} />
                      Delete Account
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* ════ NOTIFICATIONS TAB ════ */}
            {activeTab === 'notifications' && (
              <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                <h2 className='mb-5 text-base font-bold text-slate-900'>Notification Preferences</h2>
                <div className='space-y-4'>
                  {(Object.keys(notifPrefs) as (keyof typeof notifPrefs)[]).map((key) => {
                    const labels: Record<keyof typeof notifPrefs, { title: string; desc: string }> = {
                      taskAssigned:  { title: 'Task Assigned',        desc: 'When a task is assigned to you'           },
                      taskCompleted: { title: 'Task Completed',       desc: 'When someone completes a task you assigned' },
                      mentions:      { title: 'Mentions',             desc: 'When someone @mentions you in a comment'   },
                      invites:       { title: 'Organisation Invites', desc: 'When you receive a team invitation'         },
                      weeklyDigest:  { title: 'Weekly Digest',        desc: 'A summary of your week every Monday'        },
                      emailAlerts:   { title: 'Email Alerts',         desc: 'Receive notifications via email'            },
                    };
                    const { title, desc } = labels[key];
                    return (
                      <div key={key} className='flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3'>
                        <div>
                          <p className='text-sm font-semibold text-slate-800'>{title}</p>
                          <p className='text-xs text-slate-400'>{desc}</p>
                        </div>
                        <Toggle
                          checked={notifPrefs[key]}
                          onChange={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ════ APPEARANCE TAB ════ */}
            {activeTab === 'appearance' && (
              <>
                <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                  <h2 className='mb-5 text-base font-bold text-slate-900'>Theme</h2>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {[
                      { label: 'Light',  preview: 'bg-white border-2 border-blue-500'  },
                      { label: 'Dark',   preview: 'bg-slate-900'                       },
                      { label: 'System', preview: 'bg-gradient-to-r from-white to-slate-900' },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        onClick={() => setDarkMode(theme.label === 'Dark')}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          (darkMode ? 'Dark' : 'Light') === theme.label
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-8 w-full rounded-lg ${theme.preview}`} />
                        <span className='text-xs font-semibold text-slate-600'>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                  <h2 className='mb-5 text-base font-bold text-slate-900'>Regional</h2>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className={lbl}><Globe size={12} className='mr-1 inline' />Language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inp}>
                        {['English', 'French', 'Spanish', 'German', 'Yoruba'].map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}><Moon size={12} className='mr-1 inline' />Timezone</label>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inp}>
                        {['UTC+0 (London)', 'UTC+1 (Lagos)', 'UTC+2 (Cairo)', 'UTC-5 (New York)', 'UTC-8 (LA)'].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ── Save button (Profile + Account tabs) ── */}
            {(activeTab === 'profile' || activeTab === 'account') && (
              <div className='flex justify-end'>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`rounded-xl px-8 py-3 text-sm font-semibold text-white transition-colors ${
                    saved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-700'
                  } ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title='Delete Account'
        message='Are you sure you want to permanently delete your account? All your data will be removed and this cannot be undone.'
        confirmLabel='Delete Account'
        onConfirm={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
      />
    </AppLayout>
  );
}
