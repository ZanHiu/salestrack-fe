'use client';

import { useState } from 'react';
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
import type { DisplayMode } from '@/components/reports/HeatmapCell';

const YEAR_OPTIONS = [2022, 2023, 2024, 2025, 2026, 2027];

export default function ReportsPage() {
  const [type, setType] = useState<'by-product' | 'by-customer'>('by-customer');
  const [year, setYear] = useState(2024);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('actual');

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4 space-y-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Báo cáo tổng hợp</h2>
          <ExportExcelButton year={year} type={type} />
        </div>

        <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
          <TabsList>
            <TabsTrigger value="by-product">Theo sản phẩm</TabsTrigger>
            <TabsTrigger value="by-customer">Theo khách hàng</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-[120px]">
              <label className="text-xs text-slate-500 mb-1 block">Năm</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[200px]">
              <label className="text-xs text-slate-500 mb-1 block">Hiển thị</label>
              <Select
                value={displayMode}
                onValueChange={(v) => setDisplayMode(v as DisplayMode)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actual">Thực hiện</SelectItem>
                  <SelectItem value="plan">Kế hoạch</SelectItem>
                  <SelectItem value="completion-percent">% Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
              <span>&lt; 50%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" />
              <span>50-90%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200" />
              <span>&ge; 90%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        <ReportTable type={type} year={year} displayMode={displayMode} />
      </div>
    </div>
  );
}
