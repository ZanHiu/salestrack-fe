import { useQuery } from '@tanstack/react-query';
import { productsApi, ListProductsParams } from '@/lib/api/products';

export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list({ pageSize: 200, ...params }),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: () => productsApi.categories(),
    staleTime: 5 * 60_000,
  });
}
