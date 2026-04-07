import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse
} from "axios";
import { authStorage } from "../auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || " http://147.182.225.80/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach bearer token from centralized storage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response Interceptor: Global error & security handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // Handle session expiration or invalid tokens
      if (status === 401) {
        if (typeof window !== "undefined") {
          authStorage.clearAuth();
          window.location.href = "/";
        }
      }

      console.error(`[API Error] ${status}:`, error.response.data);
    } else if (error.request) {
      console.error("[API Network Error]: No response received", error.request);
    } else {
      console.error("[API Setup Error]:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
