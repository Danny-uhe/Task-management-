import axios from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * Central axios instance for all API calls.
 *
 * - Automatically attaches the Authorization header from the auth store
 * - On 401: silently tries to refresh the access token once, then retries
 * - On refresh failure: clears auth and redirects to /login
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — silent token refresh on 401 ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown)  => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only handle 401 errors that haven't been retried yet
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, setToken, clearAuth } = useAuthStore.getState();

    // No refresh token — force logout
    if (!refreshToken) {
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue subsequent 401s while a refresh is already in flight
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry   = true;
    isRefreshing      = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      );

      const newToken = data.accessToken as string;
      setToken(newToken);
      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
