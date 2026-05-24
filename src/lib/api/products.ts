import { apiClient } from './client';
import type { Product, Category } from '@/types/domain';

export interface ListProductsParams {
  categoryName?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const productsApi = {
  async list(params: ListProductsParams = {}) {
    const res = await apiClient.get<{
      data: Product[];
      meta: { total: number; page: number; pageSize: number };
    }>('/products', { params });
    return res.data;
  },
  async categories(): Promise<Category[]> {
    const res = await apiClient.get('/products/categories');
    return res.data.data;
  },
  async renameCategory(oldName: string, newName: string, newOrder: number) {
    const res = await apiClient.patch('/products/categories/rename', {
      oldName,
      newName,
      newOrder,
    });
    return res.data.data as { updated: number };
  },
  async deleteCategory(name: string) {
    const res = await apiClient.delete(`/products/categories/${encodeURIComponent(name)}`);
    return res.data.data as { deleted: number };
  },
  async create(dto: {
    name: string;
    categoryName: string;
    categoryOrder: number;
    unit?: string;
  }) {
    const res = await apiClient.post('/products', dto);
    return res.data.data as Product;
  },
  async update(
    id: string,
    dto: Partial<{
      name: string;
      categoryName: string;
      categoryOrder: number;
      unit: string;
      isActive: boolean;
    }>,
  ) {
    const res = await apiClient.patch(`/products/${id}`, dto);
    return res.data.data as Product;
  },
  async remove(id: string) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data?.data ?? { softDeleted: false };
  },
};
