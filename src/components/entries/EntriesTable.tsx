'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn, formatMillion } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { TableSkeleton } from '@/components/TableSkeleton';
import {
  useEntriesByCustomer,
  useUpsertEntry,
  transformToPivot,
  PivotRow,
} from '@/hooks/useSalesEntries';
import { getApiErrorMessage } from '@/lib/api/client';
import { EntryCell, ViewMode } from './EntryCell';
import { EntryDetailModal } from './EntryDetailModal';

interface EntriesTableProps {
  year: number;
  customerId: string;
  categoryFilter: string | null;
  viewMode: ViewMode;
}

interface FocusCoord {
  productId: string;
  month: number;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function EntriesTable({
  year,
  customerId,
  categoryFilter,
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
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<FocusCoord | null>(null);

  const allRows = useMemo<PivotRow[]>(
    () => transformToPivot(entries ?? [], productsData?.data ?? []),
    [entries, productsData],
  );

  const rows = useMemo(
    () =>
      categoryFilter ? allRows.filter((r) => r.product.categoryName === categoryFilter) : allRows,
    [allRows, categoryFilter],
  );

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
      else if (idx > 0)
        setFocus({ productId: rows[idx - 1].product._id, month: 12 });
      else setFocus(null);
    } else if (direction === 'Enter' || direction === 'ArrowDown') {
      if (idx < rows.length - 1) setFocus({ productId: rows[idx + 1].product._id, month: focus.month });
      else setFocus(null);
    } else if (direction === 'ArrowUp') {
      if (idx > 0) setFocus({ productId: rows[idx - 1].product._id, month: focus.month });
      else setFocus(null);
    }
  }

  if (loadingProducts || loadingEntries) {
    return <TableSkeleton rows={10} />;
  }

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Không có sản phẩm nào.
      </div>
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
      <div className="border rounded-lg overflow-auto bg-white h-full">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-30">
            <tr>
              <th className="sticky left-0 z-40 bg-slate-100 px-3 py-2 text-left font-medium min-w-[200px] border-r">
                Sản phẩm
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="px-2 py-2 text-right font-medium w-[70px]">
                  T{m}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-semibold bg-slate-200 w-[90px]">
                Tổng
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows
                key={g.categoryName}
                group={g}
                viewMode={viewMode}
                focus={focus}
                setFocus={setFocus}
                savingKey={savingKey}
                onCommit={commit}
                onCancel={() => setFocus(null)}
                onKey={moveFocus}
                onOpenDetail={setModalOpen}
              />
            ))}
            <tr className="bg-slate-100 font-semibold border-t-2">
              <td className="sticky left-0 z-20 bg-slate-100 px-3 py-2 border-r">TỔNG</td>
              {MONTHS.map((m) => {
                const t = monthTotals[m];
                const v = viewMode === 'plan' ? t.plan : t.actual;
                return (
                  <td key={m} className="px-2 py-2 text-right tabular-nums">
                    {v === 0 ? '—' : formatMillion(v)}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-right tabular-nums bg-slate-200">
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
  setFocus: (f: FocusCoord | null) => void;
  savingKey: string | null;
  onCommit: (productId: string, month: number, value: number) => void;
  onCancel: () => void;
  onKey: (key: 'Enter' | 'Tab' | 'ShiftTab' | 'ArrowUp' | 'ArrowDown') => void;
  onOpenDetail: (coord: FocusCoord) => void;
}

function GroupRows({
  group,
  viewMode,
  focus,
  setFocus,
  savingKey,
  onCommit,
  onCancel,
  onKey,
  onOpenDetail,
}: GroupRowsProps) {
  return (
    <>
      <tr className="bg-slate-50">
        <td
          colSpan={14}
          className="sticky left-0 z-20 px-3 py-1 text-xs font-semibold text-slate-600 uppercase bg-slate-50"
        >
          {group.categoryName}
        </td>
      </tr>
      {group.rows.map((r) => {
        const total = viewMode === 'plan' ? r.totalPlan : r.totalActual;
        return (
          <tr key={r.product._id} className="border-t hover:bg-slate-50/50">
            <td className={cn(
              'sticky left-0 z-20 bg-white px-3 py-0 text-sm border-r whitespace-nowrap',
              focus?.productId === r.product._id && 'bg-blue-50',
            )}>
              <div className="py-2">{r.product.name}</div>
            </td>
            {MONTHS.map((m) => {
              const isFocused = focus?.productId === r.product._id && focus.month === m;
              const key = `${r.product._id}:${m}`;
              return (
                <td key={m} className="p-0 border-r border-slate-100">
                  <EntryCell
                    cell={r.cells[m]}
                    viewMode={viewMode}
                    isFocused={isFocused}
                    isSaving={savingKey === key}
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
            <td className="px-3 py-2 text-right tabular-nums bg-slate-100 font-medium">
              {total === 0 ? '—' : formatMillion(total)}
            </td>
          </tr>
        );
      })}
    </>
  );
}
