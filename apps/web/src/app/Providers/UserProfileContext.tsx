import { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';

const LS_AVATAR_KEY  = 'ts_avatar_url';
const LS_NAME_KEY    = 'ts_user_name';
const LS_EMAIL_KEY   = 'ts_user_email';
const LS_ROLE_KEY    = 'ts_user_role';
const LS_POINTS_KEY  = 'ts_user_points';
const LS_STREAK_KEY  = 'ts_user_streak';
const LS_RANK_KEY    = 'ts_user_rank';

const DEFAULT_NAME   = 'Relentless Inivie';
const DEFAULT_AVATAR = `https://ui-avatars.com/api/?name=Relentless+Inivie&size=128&background=3B82F6&color=fff`;

function ls(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function lsNum(key: string, fallback: number) {
  try { return Number(localStorage.getItem(key) ?? fallback); } catch { return fallback; }
}
function lsSet(key: string, value: string | number) {
  try { localStorage.setItem(key, String(value)); } catch {}
}

/* Points awarded per action */
export const POINTS = {
  TASK_COMPLETE:  50,
  TASK_REVIEW:    20,
  TASK_CREATE:    10,
  LOGIN_STREAK:   15,
} as const;

type UserProfile = {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  points: number;
  streak: number;
  rank: number;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setRole: (v: string) => void;
  setAvatarUrl: (v: string) => void;
  addPoints: (amount: number, reason?: string) => void;
  openAvatarPicker: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** Last points-earned event for toast display */
  lastEarned: { amount: number; reason: string } | null;
  clearLastEarned: () => void;
};

const UserProfileContext = createContext<UserProfile | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [name,      setNameState]    = useState(() => ls(LS_NAME_KEY,   DEFAULT_NAME));
  const [email,     setEmailState]   = useState(() => ls(LS_EMAIL_KEY,  'inivie@tasksync.io'));
  const [role,      setRoleState]    = useState(() => ls(LS_ROLE_KEY,   'Product Designer'));
  const [avatarUrl, setAvatarState]  = useState(() => ls(LS_AVATAR_KEY, DEFAULT_AVATAR));
  const [points,    setPointsState]  = useState(() => lsNum(LS_POINTS_KEY, 2840));
  const [streak,    setStreakState]   = useState(() => lsNum(LS_STREAK_KEY, 12));
  const [rank,      setRankState]    = useState(() => lsNum(LS_RANK_KEY, 1));
  const [lastEarned, setLastEarned]  = useState<{ amount: number; reason: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Persisted setters */
  const setName      = (v: string) => { setNameState(v);    lsSet(LS_NAME_KEY,   v); };
  const setEmail     = (v: string) => { setEmailState(v);   lsSet(LS_EMAIL_KEY,  v); };
  const setRole      = (v: string) => { setRoleState(v);    lsSet(LS_ROLE_KEY,   v); };
  const setAvatarUrl = (v: string) => { setAvatarState(v);  lsSet(LS_AVATAR_KEY, v); };

  const addPoints = useCallback((amount: number, reason = 'Task completed') => {
    setPointsState((prev) => {
      const next = prev + amount;
      lsSet(LS_POINTS_KEY, next);
      return next;
    });
    setLastEarned({ amount, reason });
  }, []);

  const clearLastEarned = () => setLastEarned(null);

  const openAvatarPicker = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <UserProfileContext.Provider
      value={{
        name, email, role, avatarUrl, points, streak, rank,
        setName, setEmail, setRole, setAvatarUrl,
        addPoints, openAvatarPicker, fileInputRef,
        lastEarned, clearLastEarned,
      }}
    >
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used inside UserProfileProvider');
  return ctx;
}
