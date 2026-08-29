import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BACKEND_URL } from "./constants";

// Create an Axios instance with base config
const api = axios.create({
  baseURL: BACKEND_URL, // Change as needed
  withCredentials: true, // Send cookies with requests
});

const REFRESH_URL = "/auth/refresh";

// One in-flight refresh shared by every 401 that arrives while it runs.
// The backend ROTATES the refresh token on each call, so two concurrent
// refreshes would race: the second one presents an already-replaced token,
// gets 401, and logs the user out for no reason.
let refreshInFlight: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = api
      .post(REFRESH_URL, {})
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

// Response interceptor to handle 401 and refresh logic
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = (originalRequest?.url ?? "").includes(REFRESH_URL);

    // Only run if 401, not already retried, and not the refresh call itself
    // (a 401 from /auth/refresh must never trigger another refresh — that
    // was an infinite loop).
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true; // Custom flag to avoid infinite loop

      try {
        await refreshSession();
        // Retry the original request (cookie has been renewed)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed: the backend has cleared the session cookie, so the
        // middleware will now let /login render instead of bouncing to "/".
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Axios wrapper for fetch-like calls, using AxiosRequestConfig.
 * Always returns the response's `.data` (parsed JSON/body).
 *
 * Example:
 *   const data = await authAxios("/users/profile", { method: "get" });
 */
export async function authAxios<T = any>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  // Merge url into config, so user can pass other AxiosRequestConfig fields
  const response = await api({ url, ...config });
  return response.data;
}

export default api;
