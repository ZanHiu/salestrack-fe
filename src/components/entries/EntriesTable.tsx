'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn, formatMillion } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import {
  useEntriesByCustomer,
  useUpsertEntry,
  transformToPivot,
  PivotRow,
} from '@/hooks/useSalesEntries';
import { getApiErrorMessage } from '@/lib/api/client';
import { EntryCell, ViewMode } from './EntryCell';
import { EntryDetailModal } from './EntryDetailModal';
import { TableSkeleton } from '@/components/TableSkeleton';
import { EmptyState } from '@/components/EmptyState';

interface EntriesTableProps {
  year: number;
  customerId: string;
  categoryFilter: string | null;
  searchQuery: string;
  viewMode: ViewMode;
}

interface FocusCoord {
  productId: string;
  month: number;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const QUARTERS = [
  { label: 'Q1', span: 3 },
  { label: 'Q2', span: 3 },
  { label: 'Q3', span: 3 },
  { label: 'Q4', span: 3 },
];

export function EntriesTable({
  year,
  customerId,
  categoryFilter,
  searchQuery,
  viewMode,
}: EntriesTableProps) {
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    isActive: true,
  });
  const { data: entries, isLoading: loadingEntries } = useEntriesByCustomer(
    year,
    customerId,
  );
  const upsert = useUpsertEntry(year, customerId);

  const [focus, setFocus] = useState<FocusCoord | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [justSavedKey, setJustSavedKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<FocusCoord | null>(null);

  const allRows = useMemo<PivotRow[]>(
    () => transformToPivot(entries ?? [], productsData?.data ?? []),
    [entries, productsData],
  );

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter((r) => {
      if (categoryFilter && r.product.categoryName !== categoryFilter) return false;
      if (q && !r.product.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allRows, categoryFilter, searchQuery]);

  const monthTotals = useMemo(() => {
    const totals: Record<number, { plan: number; actual: number }> = {};
    for (let m = 1; m <= 12; m += 1) totals[m] = { plan: 0, actual: 0 };
    for (const r of rows) {
      for (let m = 1; m <= 12; m += 1) {
        totals[m].plan += r.cells[m]?.plan ?? 0;
        totals[m].actual += r.cells[m]?.actual ?? 0;
      }
    }
    return totals;
  }, [rows]);

  const grandTotal = useMemo(() => {
    let plan = 0;
    let actual = 0;
    for (const r of rows) {
      plan += r.totalPlan;
      actual += r.totalActual;
    }
    return { plan, actual };
  }, [rows]);

  function commit(productId: string, month: number, newValue: number) {
    const key = `${productId}:${month}`;
    setSavingKey(key);
    upsert.mutate(
      {
        year,
        month,
        customerId,
        productId,
        ...(viewMode === 'plan' ? { planAmount: newValue } : { actualAmount: newValue }),
      },
      {
        onSettled: () => setSavingKey(null),
        onSuccess: () => {
          setJustSavedKey(key);
          setTimeout(() => setJustSavedKey(null), 700);
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err));
        },
      },
    );
  }

  function moveFocus(direction: 'Enter' | 'Tab' | 'ShiftTab' | 'ArrowUp' | 'ArrowDown') {
    if (!focus) return;
    const idx = rows.findIndex((r) => r.product._id === focus.productId);
    if (idx === -1) return;

    if (direction === 'Tab') {
      if (focus.month < 12) setFocus({ ...focus, month: focus.month + 1 });
      else if (idx < rows.length - 1)
        setFocus({ productId: rows[idx + 1].product._id, month: 1 });
      else setFocus(null);
    } else if (direction === 'ShiftTab') {
      if (focus.month > 1) setFocus({ ...focus, month: focus.month - 1 });
      else if (idx > 0) setFocus({ productId: rows[idx - 1].product._id, month: 12 });
      else setFocus(null);
    } else if (direction === 'Enter' || direction === 'ArrowDown') {
      if (idx < rows.length - 1)
        setFocus({ productId: rows[idx + 1].product._id, month: focus.month });
      else setFocus(null);
    } else if (direction === 'ArrowUp') {
      if (idx > 0)
        setFocus({ productId: rows[idx - 1].product._id, month: focus.month });
      else setFocus(null);
    }
  }

  if (loadingProducts || loadingEntries) {
    return <TableSkeleton rows={10} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="28" cy="28" r="14" stroke="currentColor" strokeWidth="2" />
            <line x1="38" y1="38" x2="50" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        }
        title="Không có sản phẩm khớp"
        description="Thử bỏ bộ lọc nhóm hoặc xóa từ khóa tìm kiếm"
      />
    );
  }

  // Group rows by category
  const groups: { categoryName: string; rows: PivotRow[] }[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.categoryName === r.product.categoryName) last.rows.push(r);
    else groups.push({ categoryName: r.product.categoryName, rows: [r] });
  }

  return (
    <>
      <div className="border border-border rounded-md overflow-auto bg-card h-full shadow-card">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-30">
            {/* Tier 1: Quarters */}
            <tr className="bg-brand-cream-warm">
              <th
                rowSpan={2}
                className="sticky left-0 z-40 bg-brand-cream-warm px-3 py-2 text-left font-heading font-semibold text-foreground min-w-[220px] border-r border-b border-border"
              >
                Sản phẩm
              </th>
              {QUARTERS.map((q, qi) => (
                <th
                  key={qi}
                  colSpan={q.span}
                  className="px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border"
                >
                  {q.label}
                </th>
              ))}
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-heading font-semibold text-foreground bg-brand-cream-warm w-[96px] border-l border-b border-border"
              >
                Tổng
              </th>
            </tr>
            {/* Tier 2: Months */}
            <tr className="bg-brand-cream-warm">
              {MONTHS.map((m) => (
                <th
                  key={m}
                  onMouseEnter={() => setHoverCol(m)}
                  onMouseLeave={() => setHoverCol(null)}
                  className={cn(
                    'px-2 py-1.5 text-right font-mono font-medium text-foreground/80 w-[68px] border-b border-border transition-colors',
                    hoverCol === m && 'bg-primary/10',
                  )}
                >
                  T{m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows
                key={g.categoryName}
                group={g}
                viewMode={viewMode}
                focus={focus}
                hoverCol={hoverCol}
                setHoverCol={setHoverCol}
                setFocus={setFocus}
                savingKey={savingKey}
                justSavedKey={justSavedKey}
                onCommit={commit}
                onCancel={() => setFocus(null)}
                onKey={moveFocus}
                onOpenDetail={setModalOpen}
              />
            ))}
            {/* Total row — sticky bottom */}
            <tr className="font-heading font-semibold">
              <td className="sticky left-0 bottom-0 z-30 bg-brand-cream-warm px-3 py-2.5 border-r border-t-2 border-border text-foreground">
                TỔNG
              </td>
              {MONTHS.map((m) => {
                const t = monthTotals[m];
                const v = viewMode === 'plan' ? t.plan : t.actual;
                return (
                  <td
                    key={m}
                    className={cn(
                      'sticky bottom-0 z-20 bg-brand-cream-warm px-2 py-2.5 text-right font-mono border-t-2 border-border transition-colors',
                      hoverCol === m && 'bg-primary/10',
                    )}
                  >
                    {v === 0 ? '—' : formatMillion(v)}
                  </td>
                );
              })}
              <td className="sticky bottom-0 z-20 px-3 py-2.5 text-right font-mono bg-brand-cream-warm border-l border-t-2 border-border">
                {formatMillion(viewMode === 'plan' ? grandTotal.plan : grandTotal.actual)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <EntryDetailModal
          open={!!modalOpen}
          onOpenChange={(o) => !o && setModalOpen(null)}
          year={year}
          month={modalOpen.month}
          customerId={customerId}
          productId={modalOpen.productId}
          product={rows.find((r) => r.product._id === modalOpen.productId)?.product}
          cell={rows.find((r) => r.product._id === modalOpen.productId)?.cells[modalOpen.month]}
        />
      )}
    </>
  );
}

interface GroupRowsProps {
  group: { categoryName: string; rows: PivotRow[] };
  viewMode: ViewMode;
  focus: FocusCoord | null;
  hoverCol: number | null;
  setHoverCol: (c: number | null) => void;
  setFocus: (f: FocusCoord | null) => void;
  savingKey: string | null;
  justSavedKey: string | null;
  onCommit: (productId: string, month: number, value: number) => void;
  onCancel: () => void;
  onKey: (key: 'Enter' | 'Tab' | 'ShiftTab' | 'ArrowUp' | 'ArrowDown') => void;
  onOpenDetail: (coord: FocusCoord) => void;
}

function GroupRows({
  group,
  viewMode,
  focus,
  hoverCol,
  setHoverCol,
  setFocus,
  savingKey,
  justSavedKey,
  onCommit,
  onCancel,
  onKey,
  onOpenDetail,
}: GroupRowsProps) {
  return (
    <>
      <tr className="border-y border-border">
        <td className="sticky left-0 z-20 bg-secondary px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-r border-border whitespace-nowrap">
          {group.categoryName}
        </td>
        {MONTHS.map((m) => (
          <td key={m} className="bg-secondary px-2 py-1.5" />
        ))}
        <td className="bg-secondary px-3 py-1.5" />
      </tr>
      {group.rows.map((r) => {
        const isRowFocused = focus?.productId === r.product._id;
        const total = viewMode === 'plan' ? r.totalPlan : r.totalActual;
        return (
          <tr
            key={r.product._id}
            className={cn(
              'group/row border-t border-border/50',
              isRowFocused && 'bg-primary/[0.03]',
            )}
          >
            <td
              className={cn(
                'sticky left-0 z-20 px-3 py-0 text-sm border-r border-border whitespace-nowrap transition-colors',
                isRowFocused ? 'bg-primary/5 font-medium' : 'bg-card group-hover/row:bg-secondary/40',
              )}
            >
              <div className="py-2 text-foreground">{r.product.name}</div>
            </td>
            {MONTHS.map((m) => {
              const isFocused = focus?.productId === r.product._id && focus.month === m;
              const key = `${r.product._id}:${m}`;
              const isColHover = hoverCol === m;
              return (
                <td
                  key={m}
                  onMouseEnter={() => setHoverCol(m)}
                  onMouseLeave={() => setHoverCol(null)}
                  className={cn(
                    'group/col p-0 border-r border-border/50 transition-colors',
                    isColHover && !isFocused && 'bg-primary/[0.03]',
                  )}
                >
                  <EntryCell
                    cell={r.cells[m]}
                    viewMode={viewMode}
                    isFocused={isFocused}
                    isSaving={savingKey === key}
                    justSaved={justSavedKey === key}
                    onFocus={() => setFocus({ productId: r.product._id, month: m })}
                    onCommit={(v) => {
                      onCommit(r.product._id, m, v);
                      onKey('Enter');
                    }}
                    onCancel={onCancel}
                    onKey={onKey}
                    onOpenDetail={
                      viewMode === 'actual'
                        ? () => onOpenDetail({ productId: r.product._id, month: m })
                        : undefined
                    }
                  />
                </td>
              );
            })}
            <td className="px-3 py-2 text-right font-mono bg-brand-cream-muted/40 font-medium text-foreground">
              {total === 0 ? '—' : formatMillion(total)}
            </td>
          </tr>
        );
      })}
    </>
  );
}
