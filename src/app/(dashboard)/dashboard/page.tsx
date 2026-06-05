'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { TopList } from '@/components/dashboard/TopList';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { useCustomerReport, useProductReport } from '@/hooks/useReports';
import { usePrefs } from '@/lib/prefs/usePrefs';
import { useUrlPrefSync } from '@/lib/prefs/useUrlPrefSync';
import { getYearOptions } from '@/lib/constants';

export default function DashboardPage() {
  const year = usePrefs((s) => s.year);
  const patch = usePrefs((s) => s.patch);

  const { updateUrl } = useUrlPrefSync({
    year: { key: 'year', parse: (v) => Number(v) || undefined, optional: true },
  });

  function setYear(y: number) {
    patch({ year: y });
    updateUrl({ year: y });
  }

  const { data: customerReport, isLoading: loadingC } = useCustomerReport(year);
  const { data: productReport, isLoading: loadingP } = useProductReport(year);

  const topCustomers = useMemo(
    () =>
      (customerReport?.rows ?? [])
        .slice(0, 5)
        .map((r) => ({
          id: r.customer.id,
          label: r.customer.name,
          value: r.yearTotal.actual,
        })),
    [customerReport],
  );

  const topProducts = useMemo(
    () =>
      (productReport?.rows ?? [])
        .slice()
        .sort((a, b) => b.yearTotal.actual - a.yearTotal.actual)
        .slice(0, 5)
        .map((r) => ({
          id: r.product.id,
          label: r.product.name,
          value: r.yearTotal.actual,
          sub: r.product.categoryName,
        })),
    [productReport],
  );

  const yearOptions = getYearOptions();

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-5 border-b border-border bg-background">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
              Tổng quan {year}
            </h2>
            <p className="text-xs text-muted-foreground">
              Nhanh chóng nắm bắt tình hình doanh số và khách hàng
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-[120px]">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">
              Năm
            </label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-6 space-y-4 max-w-[1400px]">
          <KpiCards year={year} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopList
              title="Top 5 khách hàng"
              items={topCustomers}
              isLoading={loadingC}
            />
            <TopList
              title="Top 5 sản phẩm bán chạy"
              items={topProducts}
              isLoading={loadingP}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RecentActivity year={year} />
            </div>
            <AlertsPanel year={year} />
          </div>
        </div>
      </div>
    </div>
  );
}
