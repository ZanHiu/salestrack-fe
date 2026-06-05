'use client';

import { Users, TrendingUp, Target, Crown, type LucideIcon } from 'lucide-react';
import { cn, formatMillion } from '@/lib/utils';
import { useCustomerReport } from '@/hooks/useReports';
import { useCustomers } from '@/hooks/useCustomers';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  year: number;
}

export function KpiCards({ year }: Props) {
  const { data: report, isLoading } = useCustomerReport(year);
  const { data: customers } = useCustomers({ pageSize: 200 });

  if (isLoading || !report) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[96px] rounded-md" />
        ))}
      </div>
    );
  }

  const totalCustomers = customers?.meta.total ?? 0;
  const activeCustomers = customers?.data.filter((c) => c.isActive).length ?? 0;
  const ytd = report.grandTotal.actual;
  const completion = report.grandTotal.completionPercent;
  const topCustomer = report.rows[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        icon={Users}
        label="Khách hàng"
        value={String(totalCustomers)}
        sub={`${activeCustomers} đang KD`}
        iconClass="bg-primary/10 text-primary"
      />
      <KpiCard
        icon={TrendingUp}
        label={`YTD ${year}`}
        value={billion(ytd)}
        sub="triệu VNĐ"
        iconClass="bg-success-bg text-success"
      />
      <KpiCard
        icon={Target}
        label="% Hoàn thành"
        value={completion === null ? '—' : `${completion}%`}
        sub={completion === null ? 'Chưa có kế hoạch' : 'so với kế hoạch'}
        iconClass="bg-warning-bg text-warning"
      />
      <KpiCard
        icon={Crown}
        label="Khách hàng top"
        value={topCustomer?.customer.name ?? '—'}
        sub={topCustomer ? `${billion(topCustomer.yearTotal.actual)} triệu` : ''}
        iconClass="bg-brand-orange/10 text-brand-orange"
        smallValue
      />
    </div>
  );
}

function billion(million: number): string {
  if (million === 0) return '0';
  if (million >= 1000) {
    return `${(million / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
  }
  return formatMillion(million);
}

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  iconClass: string;
  smallValue?: boolean;
}

function KpiCard({ icon: Icon, label, value, sub, iconClass, smallValue }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-md p-4 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', iconClass)}>
          <Icon size={16} />
        </div>
      </div>
      <div
        className={cn(
          'font-heading font-semibold text-foreground tabular-nums leading-tight',
          smallValue ? 'text-base truncate' : 'text-2xl',
        )}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
