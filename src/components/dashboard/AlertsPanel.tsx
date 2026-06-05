'use client';

import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useCustomerReport } from '@/hooks/useReports';
import { useCustomers } from '@/hooks/useCustomers';

interface Props {
  year: number;
}

export function AlertsPanel({ year }: Props) {
  const { data: report, isLoading } = useCustomerReport(year);
  const { data: customers } = useCustomers({ pageSize: 200 });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-md shadow-card p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Cảnh báo
        </h3>
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  // KH có plan nhưng < 50% YTD
  const underperforming = (report?.rows ?? [])
    .filter(
      (r) =>
        r.yearTotal.plan > 0 &&
        r.yearTotal.completionPercent !== null &&
        r.yearTotal.completionPercent < 50,
    )
    .slice(0, 5);

  // KH active nhưng chưa có entries nào trong năm
  const customersWithData = new Set(
    (report?.rows ?? []).filter((r) => r.yearTotal.actual > 0).map((r) => r.customer.id),
  );
  const noActivity = (customers?.data ?? [])
    .filter((c) => c.isActive && !customersWithData.has(c._id))
    .slice(0, 5);

  const hasAlerts = underperforming.length > 0 || noActivity.length > 0;

  return (
    <div className="bg-card border border-border rounded-md shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cảnh báo
        </h3>
      </div>
      <div className="p-3 space-y-3">
        {!hasAlerts && (
          <p className="text-sm text-muted-foreground py-3 text-center">
            Mọi thứ ổn — không có cảnh báo
          </p>
        )}

        {underperforming.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5 text-warning">
              <TrendingDown size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Dưới 50% kế hoạch
              </span>
            </div>
            <ul className="space-y-0.5">
              {underperforming.map((r) => (
                <li
                  key={r.customer.id}
                  className="flex items-baseline justify-between px-2 py-1 rounded hover:bg-secondary/40 text-sm"
                >
                  <span className="truncate text-foreground">{r.customer.name}</span>
                  <span className="font-mono text-warning tabular-nums shrink-0 ml-2">
                    {r.yearTotal.completionPercent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {noActivity.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5 text-muted-foreground">
              <AlertTriangle size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Chưa có giao dịch năm {year}
              </span>
            </div>
            <ul className="space-y-0.5">
              {noActivity.map((c) => (
                <li
                  key={c._id}
                  className="px-2 py-1 rounded hover:bg-secondary/40 text-sm text-foreground truncate"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

