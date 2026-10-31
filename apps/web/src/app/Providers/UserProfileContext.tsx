import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';

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
  const authUser = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name,      setNameState]    = useState(() => authUser?.name || ls(LS_NAME_KEY,   DEFAULT_NAME));
  const [email,     setEmailState]   = useState(() => authUser?.email || ls(LS_EMAIL_KEY,  'inivie@tasksync.io'));
  const [role,      setRoleState]    = useState(() => authUser?.position || ls(LS_ROLE_KEY,   'Product Designer'));
  const [avatarUrl, setAvatarState]  = useState(() => authUser?.avatar || ls(LS_AVATAR_KEY, DEFAULT_AVATAR));
  const [points,    setPointsState]  = useState(() => lsNum(LS_POINTS_KEY, 2840));
  const [streak]   = useState(() => lsNum(LS_STREAK_KEY, 12));
  const [rank]     = useState(() => lsNum(LS_RANK_KEY, 1));
  const [lastEarned, setLastEarned]  = useState<{ amount: number; reason: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when authStore user becomes available or updates
  useEffect(() => {
    if (authUser) {
      if (authUser.name) {
        setNameState(authUser.name);
        lsSet(LS_NAME_KEY, authUser.name);
      }
      if (authUser.email) {
        setEmailState(authUser.email);
        lsSet(LS_EMAIL_KEY, authUser.email);
      }
      if (authUser.position !== undefined && authUser.position !== null) {
        setRoleState(authUser.position);
        lsSet(LS_ROLE_KEY, authUser.position);
      }
      if (authUser.avatar) {
        setAvatarState(authUser.avatar);
        lsSet(LS_AVATAR_KEY, authUser.avatar);
      }
    }
  }, [authUser]);

  // Fetch real user data on mount when accessToken exists
  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    userService
      .getMe()
      .then((res) => {
        if (!isMounted) return;
        const u = res.data.user;
        if (u) {
          if (u.name) {
            setNameState(u.name);
            lsSet(LS_NAME_KEY, u.name);
          }
          if (u.email) {
            setEmailState(u.email);
            lsSet(LS_EMAIL_KEY, u.email);
          }
          if (u.position !== undefined && u.position !== null) {
            setRoleState(u.position);
            lsSet(LS_ROLE_KEY, u.position);
          }
          if (u.avatar) {
            setAvatarState(u.avatar);
            lsSet(LS_AVATAR_KEY, u.avatar);
          }
          if (typeof u.points === 'number') {
            setPointsState(u.points);
            lsSet(LS_POINTS_KEY, u.points);
          }

          updateUser({
            name: u.name,
            email: u.email,
            position: u.position,
            avatar: u.avatar,
            bio: u.bio,
            systemRole: u.systemRole,
            isActive: u.isActive,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load user profile:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, updateUser]);

  /* Persisted setters that also update real API and authStore */
  const setName = (v: string) => {
    setNameState(v);
    lsSet(LS_NAME_KEY, v);
    updateUser({ name: v });
    userService.updateProfile({ name: v }).catch(console.error);
  };

  const setEmail = (v: string) => {
    setEmailState(v);
    lsSet(LS_EMAIL_KEY, v);
    updateUser({ email: v });
    userService.updateProfile({ email: v }).catch(console.error);
  };

  const setRole = (v: string) => {
    setRoleState(v);
    lsSet(LS_ROLE_KEY, v);
    updateUser({ position: v });
    userService.updateProfile({ position: v }).catch(console.error);
  };

  const setAvatarUrl = (v: string) => {
    setAvatarState(v);
    lsSet(LS_AVATAR_KEY, v);
    updateUser({ avatar: v });
    userService.updateProfile({ avatar: v }).catch(console.error);
  };

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
