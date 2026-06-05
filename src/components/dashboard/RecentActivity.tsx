'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { salesEntriesApi } from '@/lib/api/salesEntries';
import { formatMillion } from '@/lib/utils';

interface Props {
  year: number;
}

const MONTH_LABEL = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

export function RecentActivity({ year }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-activity', year],
    queryFn: () => salesEntriesApi.list({ year }),
  });

  const recent = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div className="bg-card border border-border rounded-md shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cập nhật gần đây
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {isLoading ? (
          <div className="p-4 text-sm text-center text-muted-foreground">Đang tải...</div>
        ) : recent.length === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">
            Chưa có hoạt động nào
          </div>
        ) : (
          recent.map((e) => (
            <div key={e.id} className="px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {e.customer.name}
                  <span className="text-muted-foreground font-normal mx-1.5">·</span>
                  <span className="text-muted-foreground font-normal">{e.product.name}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {MONTH_LABEL[e.month - 1]} ·{' '}
                  {formatDistanceToNow(new Date(e.updatedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </div>
              </div>
              <div className="text-sm font-mono tabular-nums text-foreground shrink-0">
                {formatMillion(e.actualAmount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
