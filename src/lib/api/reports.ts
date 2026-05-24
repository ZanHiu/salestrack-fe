import { apiClient } from './client';
import type { ProductReport, CustomerReport } from '@/types/domain';

export const reportsApi = {
  async byProduct(year: number, categoryName?: string): Promise<ProductReport> {
    const res = await apiClient.get('/reports/by-product', {
      params: { year, categoryName },
    });
    return res.data.data;
  },
  async byCustomer(year: number): Promise<CustomerReport> {
    const res = await apiClient.get('/reports/by-customer', { params: { year } });
    return res.data.data;
  },
  async exportExcel(year: number) {
    const res = await apiClient.get('/reports/export-excel', {
      params: { year },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `salestrack-${year}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
