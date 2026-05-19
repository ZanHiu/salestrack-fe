import { useQuery } from '@tanstack/react-query';
import { customersApi, ListCustomersParams } from '@/lib/api/customers';

export function useCustomers(params: ListCustomersParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.list(params),
  });
}
