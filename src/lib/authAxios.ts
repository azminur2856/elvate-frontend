import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Create an Axios instance with base config
const api = axios.create({
  baseURL: "http://localhost:8000", // Change as needed
  withCredentials: true, // Send cookies with requests
});

// Response interceptor to handle 401 and refresh logic
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only run if 401 and not already trying to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Custom flag to avoid infinite loop

      try {
        // Attempt token refresh
        await api.post("/auth/refresh", {});
        // Retry the original request (cookie should be renewed)
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
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
