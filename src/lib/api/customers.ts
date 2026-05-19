import { apiClient } from './client';
import type { Customer } from '@/types/domain';

export interface ListCustomersParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const customersApi = {
  async list(params: ListCustomersParams = {}) {
    const res = await apiClient.get<{
      data: Customer[];
      meta: { total: number; page: number; pageSize: number };
    }>('/customers', { params });
    return res.data;
  },
  async getById(id: string): Promise<Customer> {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data.data;
  },
  async create(dto: { name: string; phone?: string; address?: string }) {
    const res = await apiClient.post('/customers', dto);
    return res.data.data as Customer;
  },
  async update(id: string, dto: Partial<{ name: string; phone: string; address: string; isActive: boolean }>) {
    const res = await apiClient.patch(`/customers/${id}`, dto);
    return res.data.data as Customer;
  },
  async remove(id: string) {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data?.data ?? { softDeleted: false };
  },
};
