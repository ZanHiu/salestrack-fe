'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntriesFilters } from '@/components/entries/EntriesFilters';
import { EntriesTable } from '@/components/entries/EntriesTable';
import { BulkImportButton } from '@/components/entries/BulkImportButton';
import type { ViewMode } from '@/components/entries/EntryCell';

export default function EntriesPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('actual');

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4 space-y-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nhập liệu doanh số</h2>
          <BulkImportButton defaultYear={year} />
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="plan">Kế hoạch</TabsTrigger>
            <TabsTrigger value="actual">Thực hiện</TabsTrigger>
            <TabsTrigger value="compare">So sánh %</TabsTrigger>
          </TabsList>
        </Tabs>

        <EntriesFilters
          year={year}
          onYearChange={setYear}
          customerId={customerId}
          onCustomerChange={setCustomerId}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        {!customerId ? (
          <div className="bg-white border rounded-lg h-full flex items-center justify-center text-sm text-slate-500">
            Chọn khách hàng để bắt đầu nhập liệu
          </div>
        ) : (
          <EntriesTable
            year={year}
            customerId={customerId}
            categoryFilter={categoryFilter}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}
