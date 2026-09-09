import api from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface LoginResponse {
  success:      boolean;
  user:         AuthUser;
  accessToken:  string;
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token:       string;
  newPassword: string;
}

// ── Auth API calls ────────────────────────────────────────────────────────────

export const authService = {
  login(payload: LoginPayload) {
    return api.post<LoginResponse>("/auth/login", payload);
  },

  logout(refreshToken: string) {
    return api.post("/auth/logout", { refreshToken });
  },

  logoutAll() {
    return api.post("/auth/logout-all");
  },

  me() {
    return api.get<{ success: boolean; user: AuthUser }>("/auth/me");
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return api.post<{ success: boolean; message: string }>(
      "/auth/forgot-password",
      payload
    );
  },

  resetPassword(payload: ResetPasswordPayload) {
    return api.post<{ success: boolean; message: string }>(
      "/auth/reset-password",
      payload
    );
  },
};
