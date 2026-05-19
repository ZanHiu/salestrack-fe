import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesEntriesApi, UpsertEntryDto, ListEntriesParams } from '@/lib/api/salesEntries';
import type { SalesEntry, Product } from '@/types/domain';

export interface PivotCell {
  entryId?: string;
  plan: number;
  actual: number;
  unitPrice?: number;
  quantity?: number;
  note?: string;
}

export interface PivotRow {
  product: Product;
  cells: Record<number, PivotCell>;
  totalPlan: number;
  totalActual: number;
}

export function useEntriesByCustomer(year: number, customerId: string | null) {
  return useQuery({
    queryKey: ['entries', year, customerId],
    queryFn: () => salesEntriesApi.list({ year, customerId: customerId as string }),
    enabled: !!customerId,
  });
}

export function useEntriesList(params: ListEntriesParams, enabled = true) {
  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => salesEntriesApi.list(params),
    enabled,
  });
}

export function useUpsertEntry(year: number, customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertEntryDto) => salesEntriesApi.upsert(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', year, customerId] });
    },
  });
}

export function transformToPivot(
  entries: SalesEntry[],
  allProducts: Product[],
): PivotRow[] {
  const map = new Map<string, PivotRow>();

  for (const p of allProducts) {
    map.set(p._id, {
      product: p,
      cells: {},
      totalPlan: 0,
      totalActual: 0,
    });
  }

  for (const e of entries) {
    const row = map.get(e.productId);
    if (!row) continue;
    row.cells[e.month] = {
      entryId: e.id,
      plan: e.planAmount,
      actual: e.actualAmount,
      unitPrice: e.unitPrice,
      quantity: e.quantity,
      note: e.note,
    };
    row.totalPlan += e.planAmount;
    row.totalActual += e.actualAmount;
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.product.categoryOrder !== b.product.categoryOrder) {
      return a.product.categoryOrder - b.product.categoryOrder;
    }
    return a.product.name.localeCompare(b.product.name);
  });
}
