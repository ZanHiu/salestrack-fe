'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/hooks/useCustomers';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { salesEntriesApi } from '@/lib/api/salesEntries';
import { getApiErrorMessage } from '@/lib/api/client';

interface Props {
  year: number;
}

/**
 * Prefetch entries for ALL active customers in the given year so /entries
 * has data for every customer when the user later goes offline.
 *
 * Sequential fetch (not parallel) to avoid hammering the backend.
 */
export function PrefetchOfflineButton({ year }: Props) {
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const { data: customersData } = useCustomers({ isActive: true, pageSize: 200 });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });

  // Hide when offline — can't prefetch anyway.
  if (!online) return null;

  const customers = customersData?.data ?? [];

  async function handlePrefetch() {
    if (customers.length === 0) {
      toast.warning('Chưa có khách hàng nào để tải');
      return;
    }

    setLoading(true);
    setProgress({ done: 0, total: customers.length });
    let failed = 0;

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      try {
        await queryClient.prefetchQuery({
          queryKey: ['entries', year, customer._id],
          queryFn: () =>
            salesEntriesApi.list({ year, customerId: customer._id }),
          staleTime: 30_000,
        });
      } catch (err) {
        failed += 1;
        // eslint-disable-next-line no-console
        console.warn(`Prefetch failed for ${customer.name}:`, err);
      }
      setProgress({ done: i + 1, total: customers.length });
    }

    setLoading(false);
    if (failed > 0) {
      toast.error(
        `Đã tải ${customers.length - failed}/${customers.length} khách hàng. ${failed} thất bại.`,
      );
    } else {
      toast.success(
        `Đã tải sẵn data ${customers.length} khách hàng năm ${year}`,
      );
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrefetch}
      disabled={loading || customers.length === 0}
      title={`Tải sẵn data ${year} cho tất cả khách hàng để dùng offline`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
          Đang tải {progress.done}/{progress.total}
        </>
      ) : (
        <>
          <Download className="mr-1.5 h-3 w-3" />
          Tải Cache
        </>
      )}
    </Button>
  );
}
