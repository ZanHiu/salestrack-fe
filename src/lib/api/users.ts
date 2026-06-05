import { apiClient } from './client';

export interface UserAdmin {
  _id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'staff';
}

export interface UpdateUserDto {
  fullName?: string;
  role?: 'admin' | 'staff';
  isActive?: boolean;
  newPassword?: string;
}

export const usersApi = {
  async list(): Promise<UserAdmin[]> {
    const res = await apiClient.get('/users');
    return res.data.data;
  },
  async create(dto: CreateUserDto): Promise<UserAdmin> {
    const res = await apiClient.post('/users', dto);
    return res.data.data;
  },
  async update(id: string, dto: UpdateUserDto): Promise<UserAdmin> {
    const res = await apiClient.patch(`/users/${id}`, dto);
    return res.data.data;
  },
  async deactivate(id: string): Promise<UserAdmin> {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data.data;
  },
};
