'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportTable } from '@/components/reports/ReportTable';
import { ExportExcelButton } from '@/components/reports/ExportExcelButton';
import {
  usePrefs,
  type ReportsType,
  type ReportsDisplayMode,
} from '@/lib/prefs/usePrefs';
import { useUrlPrefSync } from '@/lib/prefs/useUrlPrefSync';

const YEAR_OPTIONS = [2022, 2023, 2024, 2025, 2026, 2027];

export default function ReportsPage() {
  const year = usePrefs((s) => s.year);
  const type = usePrefs((s) => s.reportsType);
  const displayMode = usePrefs((s) => s.reportsDisplayMode);
  const patch = usePrefs((s) => s.patch);

  const { updateUrl } = useUrlPrefSync({
    tab: { key: 'reportsType', parse: (v) => v as ReportsType },
    year: { key: 'year', parse: (v) => Number(v) || undefined, optional: true },
    mode: {
      key: 'reportsDisplayMode',
      parse: (v) => v as ReportsDisplayMode,
      optional: true,
    },
  });

  function setYear(y: number) {
    patch({ year: y });
    updateUrl({ year: y });
  }
  function setType(t: ReportsType) {
    patch({ reportsType: t });
    updateUrl({ tab: t });
  }
  function setDisplayMode(m: ReportsDisplayMode) {
    patch({ reportsDisplayMode: m });
    updateUrl({ mode: m });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-5 border-b border-border bg-background">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
              Báo cáo tổng hợp {year}
            </h2>
            <p className="text-xs text-muted-foreground">
              Xem tổng hợp theo sản phẩm hoặc theo khách hàng
            </p>
          </div>
          <ExportExcelButton year={year} />
        </div>

        <Tabs value={type} onValueChange={(v) => setType(v as ReportsType)}>
          <TabsList>
            <TabsTrigger value="by-product">Theo sản phẩm</TabsTrigger>
            <TabsTrigger value="by-customer">Theo khách hàng</TabsTrigger>
          </TabsList>
        </Tabs>

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
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">
              Hiển thị
            </label>
            <Select
              value={displayMode}
              onValueChange={(v) => setDisplayMode(v as ReportsDisplayMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actual">Thực hiện</SelectItem>
                <SelectItem value="plan">Kế hoạch</SelectItem>
                <SelectItem value="completion-percent">% Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col p-6 gap-3 overflow-hidden">
        {displayMode === 'completion-percent' && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">Chú thích:</span>
            <Legend color="bg-heat-low-bg border-red-200" label="< 50%" />
            <Legend color="bg-heat-mid-bg border-amber-200" label="50-90%" />
            <Legend color="bg-heat-high-bg border-green-200" label="≥ 90%" />
          </div>
        )}

        <div className="flex-1 min-h-0">
          <ReportTable type={type} year={year} displayMode={displayMode} />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm border ${color}`} />
      <span>{label}</span>
    </div>
  );
}
