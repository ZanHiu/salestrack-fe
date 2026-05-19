import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';

export function useProductReport(year: number, categoryName?: string) {
  return useQuery({
    queryKey: ['report', 'by-product', year, categoryName ?? null],
    queryFn: () => reportsApi.byProduct(year, categoryName),
  });
}

export function useCustomerReport(year: number) {
  return useQuery({
    queryKey: ['report', 'by-customer', year],
    queryFn: () => reportsApi.byCustomer(year),
  });
}
