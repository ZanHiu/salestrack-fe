import { apiClient } from './client';
import type { User } from '@/types/domain';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await apiClient.post('/auth/login', { username, password });
    return res.data.data;
  },
  async me(): Promise<User> {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.patch('/auth/password', { currentPassword, newPassword });
  },
  async updateProfile(fullName: string): Promise<User> {
    const res = await apiClient.patch('/auth/profile', { fullName });
    return res.data.data;
  },
};
