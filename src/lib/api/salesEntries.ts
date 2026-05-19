import { apiClient } from './client';
import type { SalesEntry } from '@/types/domain';

export interface UpsertEntryDto {
  year: number;
  month: number;
  customerId: string;
  productId: string;
  planAmount?: number;
  actualAmount?: number;
  unitPrice?: number;
  quantity?: number;
  note?: string;
}

export interface ListEntriesParams {
  year: number;
  customerId?: string;
  productId?: string;
  month?: number;
  categoryName?: string;
}

export const salesEntriesApi = {
  async list(params: ListEntriesParams): Promise<SalesEntry[]> {
    const res = await apiClient.get('/sales-entries', { params });
    return res.data.data;
  },
  async upsert(dto: UpsertEntryDto): Promise<SalesEntry> {
    const res = await apiClient.post('/sales-entries', dto);
    return res.data.data;
  },
  async update(id: string, dto: Partial<UpsertEntryDto>): Promise<SalesEntry> {
    const res = await apiClient.patch(`/sales-entries/${id}`, dto);
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/sales-entries/${id}`);
  },
  async bulkImport(file: File, year: number) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('year', String(year));
    const res = await apiClient.post('/sales-entries/bulk-import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data as { imported: number; failed: number; errors: { row: number; reason: string }[] };
  },
};
