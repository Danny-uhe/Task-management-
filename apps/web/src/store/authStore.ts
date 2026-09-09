import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  systemRole: "admin" | "member";
  isActive: boolean;
  avatar?: string | null;
  bio?: string | null;
  position?: string | null;
}

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;

  // True once the persisted state has been read back from localStorage.
  // Route guards must wait for this before deciding to redirect —
  // otherwise they see the pre-hydration `null` values and bounce a
  // logged-in user to /login on every hard refresh.
  hasHydrated: boolean;

  // Actions
  setAuth:        (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setToken:       (accessToken: string) => void;
  clearAuth:      () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      hasHydrated:  false,

      setAuth(user, accessToken, refreshToken) {
        set({ user, accessToken, refreshToken });
      },

      setToken(accessToken) {
        set({ accessToken });
      },

      clearAuth() {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setHasHydrated(v) {
        set({ hasHydrated: v });
      },
    }),
    {
      name:    "tasksync-auth",    // localStorage key
      partialize: (state) => ({    // only persist tokens + user, not computed
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
