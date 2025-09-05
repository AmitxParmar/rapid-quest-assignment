import { refreshToken } from "@/services/auth.service";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // important for cookies
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (cb: () => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const requestUrl: string | undefined = config?.url;
    const isAuthRefreshEndpoint = requestUrl?.includes(
      "/api/auth/refresh-token"
    );
    const errorCode = response?.data?.code;

    // Check if this is an authentication error that should trigger token refresh
    const shouldRefreshToken = 
      response?.status === 401 && 
      (errorCode === "ACCESS_TOKEN_EXPIRED" || errorCode === "ACCESS_TOKEN_INVALID");

    if (shouldRefreshToken) {
      // If the refresh call itself failed with 401, redirect immediately
      if (isAuthRefreshEndpoint) {
        isRefreshing = false;
        refreshSubscribers = [];
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (config._retry) {
        // Already retried once, do not loop
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, subscribe to the refresh completion
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            api(config).then(resolve).catch(reject);
          });
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token - server will set new cookies
        await refreshToken();
        isRefreshing = false;
        onRefreshed();

        // Retry the original request with new token
        return api(config);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // For other authentication errors (missing tokens, user not found, etc.), redirect immediately
    if (response?.status === 401 && 
        (errorCode === "ACCESS_TOKEN_MISSING" || 
         errorCode === "REFRESH_TOKEN_MISSING" ||
         errorCode === "REFRESH_TOKEN_EXPIRED" ||
         errorCode === "REFRESH_TOKEN_INVALID" ||
         errorCode === "USER_NOT_FOUND")) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
