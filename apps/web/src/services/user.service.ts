import api from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  position?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileResponse {
  success: boolean;
  user: AuthUser & {
    points?: number;
    isOnline?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

export const userService = {
  /** Get current authenticated user */
  getMe() {
    return api.get<UserProfileResponse>("/auth/me");
  },

  /** Update user profile */
  updateProfile(data: UpdateProfileData) {
    return api.patch<UserProfileResponse>("/users/me", data);
  },

  /** Change user password */
  changePassword(data: ChangePasswordData) {
    return api.patch<{ success: boolean; message: string }>(
      "/users/me/password",
      data
    );
  },
};
