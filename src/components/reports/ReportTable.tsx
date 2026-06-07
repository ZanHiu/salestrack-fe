'use client';

import { useMemo } from 'react';
import { cn, formatMillion, formatPercent } from '@/lib/utils';
import { useProductReport, useCustomerReport } from '@/hooks/useReports';
import type {
  ProductReport,
  CustomerReport,
  ReportRowProduct,
  ReportRowCustomer,
} from '@/types/domain';
import { HeatmapCell, DisplayMode } from './HeatmapCell';
import { TableSkeleton } from '@/components/TableSkeleton';
import { EmptyState } from '@/components/EmptyState';

function NoDataEmptyState({ year }: { year: number }) {
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
          <rect x="8" y="14" width="48" height="42" rx="2" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="24" x2="56" y2="24" stroke="currentColor" strokeWidth="2" />
          <line x1="18" y1="44" x2="18" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="44" x2="28" y2="30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="44" x2="38" y2="34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="48" y1="44" x2="48" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      }
      title={`Chưa có dữ liệu năm ${year}`}
      description="Vào trang Nhập liệu để thêm dữ liệu, hoặc nhập từ Excel."
    />
  );
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface ReportTableProps {
  type: 'by-product' | 'by-customer';
  year: number;
  displayMode: DisplayMode;
}

export function ReportTable({ type, year, displayMode }: ReportTableProps) {
  if (type === 'by-product') return <ProductTable year={year} displayMode={displayMode} />;
  return <CustomerTable year={year} displayMode={displayMode} />;
}

function ProductTable({
  year,
  displayMode,
}: {
  year: number;
  displayMode: DisplayMode;
}) {
  const { data, isLoading } = useProductReport(year);

  const groups = useMemo(() => {
    if (!data) return [];
    const result: { categoryName: string; rows: ReportRowProduct[] }[] = [];
    for (const r of data.rows) {
      const cat = r.product.categoryName;
      const last = result[result.length - 1];
      if (last && last.categoryName === cat) last.rows.push(r);
      else result.push({ categoryName: cat, rows: [r] });
    }
    return result;
  }, [data]);

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }
  if (!data || data.rows.length === 0) {
    return <NoDataEmptyState year={year} />;
  }

  return (
    <TableShell labelCol="Sản phẩm">
      {groups.map((g) => (
        <FragmentGroup key={g.categoryName} categoryName={g.categoryName}>
          {g.rows.map((r) => (
            <Row
              key={r.product.id}
              label={r.product.name}
              months={r.months}
              yearTotal={r.yearTotal}
              displayMode={displayMode}
            />
          ))}
        </FragmentGroup>
      ))}
      <TotalRow data={data} displayMode={displayMode} />
    </TableShell>
  );
}

function CustomerTable({
  year,
  displayMode,
}: {
  year: number;
  displayMode: DisplayMode;
}) {
  const { data, isLoading } = useCustomerReport(year);

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }
  if (!data || data.rows.length === 0) {
    return <NoDataEmptyState year={year} />;
  }

  return (
    <TableShell labelCol="Khách hàng">
      {data.rows.map((r: ReportRowCustomer) => (
        <Row
          key={r.customer.id}
          label={r.customer.name}
          months={r.months}
          yearTotal={r.yearTotal}
          displayMode={displayMode}
        />
      ))}
      <TotalRow data={data} displayMode={displayMode} />
    </TableShell>
  );
}

function TableShell({
  labelCol,
  children,
}: {
  labelCol: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-md overflow-auto bg-card h-full shadow-card">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-brand-cream-warm sticky top-0 z-30">
          <tr>
            <th className="sticky left-0 z-40 bg-brand-cream-warm px-3 py-2 text-left font-heading font-semibold text-foreground min-w-[240px] border-r border-b border-border">
              {labelCol}
            </th>
            {MONTHS.map((m) => (
              <th key={m} className="bg-brand-cream-warm px-2 py-2 text-right font-mono font-medium text-foreground/80 w-[68px] border-b border-border">
                T{m}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-heading font-semibold text-foreground bg-brand-cream-warm w-[96px] border-l border-b border-border">
              Cả năm
            </th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function FragmentGroup({
  categoryName,
  children,
}: {
  categoryName: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <tr className="border-y border-border">
        <td className="sticky left-0 z-20 bg-secondary px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-r border-border whitespace-nowrap">
          {categoryName}
        </td>
        {MONTHS.map((m) => (
          <td key={m} className="bg-secondary px-2 py-1.5" />
        ))}
        <td className="bg-secondary px-3 py-1.5" />
      </tr>
      {children}
    </>
  );
}

interface RowProps {
  label: string;
  months: { plan: number; actual: number; completionPercent: number | null }[];
  yearTotal: { plan: number; actual: number; completionPercent: number | null };
  displayMode: DisplayMode;
}

function Row({ label, months, yearTotal, displayMode }: RowProps) {
  return (
    <tr className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
      <td className="sticky left-0 z-20 bg-card hover:bg-secondary/30 px-3 py-0 text-sm border-r border-border whitespace-nowrap text-foreground">
        <div className="py-2">{label}</div>
      </td>
      {months.map((m, i) => (
        <td key={i} className="p-0 border-r border-border/50">
          <HeatmapCell
            plan={m.plan}
            actual={m.actual}
            completionPercent={m.completionPercent}
            mode={displayMode}
          />
        </td>
      ))}
      <td className="px-3 py-2 text-right font-mono bg-brand-cream-muted/40 font-medium text-foreground">
        {displayMode === 'completion-percent'
          ? formatPercent(yearTotal.completionPercent)
          : formatMillion(displayMode === 'plan' ? yearTotal.plan : yearTotal.actual)}
      </td>
    </tr>
  );
}

function TotalRow({
  data,
  displayMode,
}: {
  data: ProductReport | CustomerReport;
  displayMode: DisplayMode;
}) {
  const monthAgg = MONTHS.map((m) => {
    let plan = 0;
    let actual = 0;
    for (const r of data.rows) {
      plan += r.months[m - 1].plan;
      actual += r.months[m - 1].actual;
    }
    return {
      plan,
      actual,
      completionPercent: plan === 0 ? null : Math.round((actual / plan) * 100),
    };
  });

  return (
    <tr className="font-heading font-semibold">
      <td className="sticky left-0 bottom-0 z-30 bg-brand-cream-warm px-3 py-2.5 border-r border-t-2 border-border text-foreground">
        TỔNG
      </td>
      {monthAgg.map((m, i) => (
        <td
          key={i}
          className="sticky bottom-0 z-20 bg-brand-cream-warm p-0 border-t-2 border-border"
        >
          <HeatmapCell
            plan={m.plan}
            actual={m.actual}
            completionPercent={m.completionPercent}
            mode={displayMode}
          />
        </td>
      ))}
      <td className="sticky bottom-0 z-20 px-3 py-2.5 text-right font-mono bg-brand-cream-warm border-l border-t-2 border-border">
        {displayMode === 'completion-percent'
          ? formatPercent(data.grandTotal.completionPercent)
          : formatMillion(displayMode === 'plan' ? data.grandTotal.plan : data.grandTotal.actual)}
      </td>
    </tr>
  );
}
