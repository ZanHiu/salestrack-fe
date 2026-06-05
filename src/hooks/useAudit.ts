import { useQuery } from '@tanstack/react-query';
import { auditApi, type ListAuditParams } from '@/lib/api/audit';

export function useAudit(params: ListAuditParams) {
  return useQuery({
    queryKey: ['audit', params],
    queryFn: () => auditApi.list(params),
  });
}
