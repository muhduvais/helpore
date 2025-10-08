import { store } from "../redux/store";
import { logout, refreshToken } from "../redux/slices/authSlice";
import axios from "axios";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

customAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired tokens
customAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(new Error("Network Error"));
    }

    // 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return customAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await customAxios.post(
          "/api/auth/refreshToken"
        );
        const newAccessToken = refreshResponse.data.accessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          store.dispatch(refreshToken(newAccessToken));
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return customAxios(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        const response = await authService.logout();
        if (response.status === 200) {
          toast.info("Please login again");
        }
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 Forbidden
    if (error.response.status === 403) {
      const response = await authService.logout();
      if (response.status === 200) {
        toast.info("Please login again");
      }
      store.dispatch(logout());
      return Promise.reject(new Error("Forbidden Access"));
    }

    return Promise.reject(error);
  }
);
