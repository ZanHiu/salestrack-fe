'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCustomers } from '@/hooks/useCustomers';
import { EmptyState } from '@/components/EmptyState';
import { useIsAdmin } from '@/lib/auth/permissions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntriesFilters } from '@/components/entries/EntriesFilters';
import { EntriesTable } from '@/components/entries/EntriesTable';
import { BulkImportButton } from '@/components/entries/BulkImportButton';
import { SyncStatus } from '@/components/SyncStatus';
import { usePrefs, type EntriesViewMode } from '@/lib/prefs/usePrefs';
import { useUrlPrefSync } from '@/lib/prefs/useUrlPrefSync';

export default function EntriesPage() {
  const year = usePrefs((s) => s.year);
  const customerId = usePrefs((s) => s.entriesCustomerId);
  const categoryFilter = usePrefs((s) => s.entriesCategoryFilter);
  const viewMode = usePrefs((s) => s.entriesViewMode);
  const patch = usePrefs((s) => s.patch);
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = useIsAdmin();

  // Deep-link highlight from /audit
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [highlight, setHighlight] = useState<{ productId: string; month: number } | null>(null);

  useEffect(() => {
    const raw = searchParams.get('highlight');
    if (!raw) return;
    const [pid, mStr] = raw.split(':');
    const m = Number(mStr);
    if (pid && Number.isFinite(m) && m >= 1 && m <= 12) {
      setHighlight({ productId: pid, month: m });
    }
    // Clear the URL param so a manual reload doesn't re-trigger.
    const next = new URLSearchParams(searchParams.toString());
    next.delete('highlight');
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { updateUrl } = useUrlPrefSync({
    tab: { key: 'entriesViewMode', parse: (v) => v as EntriesViewMode },
    year: { key: 'year', parse: (v) => Number(v) || undefined, optional: true },
    customer: { key: 'entriesCustomerId', parse: (v) => v || null, optional: true },
    category: {
      key: 'entriesCategoryFilter',
      parse: (v) => v || null,
      optional: true,
    },
  });

  const { data: customersData } = useCustomers({ isActive: true, pageSize: 200 });
  const selectedCustomer = customersData?.data.find((c) => c._id === customerId);

  function setYear(y: number) {
    patch({ year: y });
    updateUrl({ year: y });
  }
  function setCustomerId(id: string | null) {
    patch({ entriesCustomerId: id });
    updateUrl({ customer: id });
  }
  function setCategoryFilter(cat: string | null) {
    patch({ entriesCategoryFilter: cat });
    updateUrl({ category: cat });
  }
  function setViewMode(m: EntriesViewMode) {
    patch({ entriesViewMode: m });
    updateUrl({ tab: m });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-5 border-b border-border bg-background">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
              Sổ doanh số {year}
              {selectedCustomer && (
                <span className="text-muted-foreground font-normal text-xl">
                  {' · '}
                  {selectedCustomer.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Bấm ô để nhập · Tab/Enter chuyển ô · Esc hủy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SyncStatus />
            {isAdmin && <BulkImportButton defaultYear={year} />}
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as EntriesViewMode)}>
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        {!customerId ? (
          <EmptyCustomerState />
        ) : (
          <EntriesTable
            year={year}
            customerId={customerId}
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            viewMode={viewMode}
            highlight={highlight}
            onHighlightConsumed={() => setHighlight(null)}
          />
        )}
      </div>
    </div>
  );
}

function EmptyCustomerState() {
  return (
    <EmptyState
      icon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="10" y="14" width="44" height="38" rx="2" stroke="currentColor" strokeWidth="2" />
          <line x1="10" y1="22" x2="54" y2="22" stroke="currentColor" strokeWidth="2" />
          <line x1="22" y1="14" x2="22" y2="52" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="30" x2="20" y2="30" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="36" x2="20" y2="36" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="42" x2="20" y2="42" stroke="currentColor" strokeWidth="1.5" />
          <line x1="28" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="1.5" />
          <line x1="28" y1="36" x2="50" y2="36" stroke="currentColor" strokeWidth="1.5" />
          <line x1="28" y1="42" x2="50" y2="42" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      }
      title="Chọn khách hàng để mở sổ"
      description="Mỗi khách hàng có một sổ riêng theo năm"
    />
  );
}
