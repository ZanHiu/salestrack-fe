'use client';

import { formatAmountVN } from '@/lib/utils';

interface TopItem {
  id: string;
  label: string;
  value: number;
  sub?: string;
}

interface Props {
  title: string;
  items: TopItem[];
  emptyText?: string;
  isLoading?: boolean;
}

export function TopList({ title, items, emptyText = 'Chưa có dữ liệu', isLoading }: Props) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0);

  return (
    <div className="bg-card border border-border rounded-md shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="p-2 space-y-1">
        {isLoading ? (
          <div className="p-4 text-sm text-center text-muted-foreground">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">{emptyText}</div>
        ) : (
          items.map((item, i) => {
            const pct = max > 0 ? (item.value / max) * 100 : 0;
            return (
              <div key={item.id} className="px-2 py-1.5">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[11px] font-mono text-muted-foreground w-4 text-right">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-mono tabular-nums text-foreground shrink-0">
                    {(() => {
                      const a = formatAmountVN(item.value);
                      return `${a.value} ${a.unit === 'tỷ VNĐ' ? 'tỷ' : 'tr'}`;
                    })()}
                  </span>
                </div>
                <div className="ml-6 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/80 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {item.sub && (
                  <p className="ml-6 mt-0.5 text-[11px] text-muted-foreground">{item.sub}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
