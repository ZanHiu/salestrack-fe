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
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Không có dữ liệu năm {year}
      </div>
    );
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
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Không có dữ liệu năm {year}
      </div>
    );
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
    <div className="border rounded-lg overflow-auto bg-white h-full">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 sticky top-0 z-30">
          <tr>
            <th className="sticky left-0 z-40 bg-slate-100 px-3 py-2 text-left font-medium min-w-[220px] border-r">
              {labelCol}
            </th>
            {MONTHS.map((m) => (
              <th key={m} className="px-2 py-2 text-right font-medium w-[70px]">
                T{m}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-semibold bg-slate-200 w-[90px]">
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
      <tr className="bg-slate-50">
        <td
          colSpan={14}
          className="sticky left-0 z-20 px-3 py-1 text-xs font-semibold text-slate-600 uppercase bg-slate-50"
        >
          {categoryName}
        </td>
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
    <tr className={cn('border-t hover:bg-slate-50/50')}>
      <td className="sticky left-0 z-20 bg-white px-3 py-0 text-sm border-r whitespace-nowrap">
        <div className="py-2">{label}</div>
      </td>
      {months.map((m, i) => (
        <td key={i} className="p-0 border-r border-slate-100">
          <HeatmapCell
            plan={m.plan}
            actual={m.actual}
            completionPercent={m.completionPercent}
            mode={displayMode}
          />
        </td>
      ))}
      <td className="px-3 py-2 text-right tabular-nums bg-slate-100 font-medium">
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
    <tr className="bg-slate-100 font-semibold border-t-2">
      <td className="sticky left-0 z-20 bg-slate-100 px-3 py-2 border-r">TỔNG</td>
      {monthAgg.map((m, i) => (
        <td key={i} className="p-0">
          <HeatmapCell
            plan={m.plan}
            actual={m.actual}
            completionPercent={m.completionPercent}
            mode={displayMode}
          />
        </td>
      ))}
      <td className="px-3 py-2 text-right tabular-nums bg-slate-200">
        {displayMode === 'completion-percent'
          ? formatPercent(data.grandTotal.completionPercent)
          : formatMillion(displayMode === 'plan' ? data.grandTotal.plan : data.grandTotal.actual)}
      </td>
    </tr>
  );
}
