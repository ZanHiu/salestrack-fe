'use client';

import axios from 'axios';
import { useAuth } from '@/lib/auth/useAuth';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path !== '/login') {
        useAuth.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error?.message;
    if (typeof msg === 'string') return msg;
  }
  return 'Lỗi hệ thống, vui lòng thử lại';
}
