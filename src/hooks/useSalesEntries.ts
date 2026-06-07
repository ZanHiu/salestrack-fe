import {
  useQuery,
  useMutation,
  useQueryClient,
  useMutationState,
} from '@tanstack/react-query';
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

function upsertEntryKey(year: number, customerId: string | null) {
  return ['upsert-entry', year, customerId] as const;
}

export function useUpsertEntry(year: number, customerId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['entries', year, customerId];

  return useMutation({
    mutationKey: upsertEntryKey(year, customerId),
    mutationFn: (dto: UpsertEntryDto) => salesEntriesApi.upsert(dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SalesEntry[]>(queryKey);
      queryClient.setQueryData<SalesEntry[]>(queryKey, (old) => {
        const list = old ?? [];
        const idx = list.findIndex(
          (e) => e.productId === dto.productId && e.month === dto.month,
        );
        if (idx >= 0) {
          const next = [...list];
          next[idx] = {
            ...next[idx],
            ...(dto.planAmount !== undefined && { planAmount: dto.planAmount }),
            ...(dto.actualAmount !== undefined && { actualAmount: dto.actualAmount }),
            ...(dto.unitPrice !== undefined && { unitPrice: dto.unitPrice }),
            ...(dto.quantity !== undefined && { quantity: dto.quantity }),
            ...(dto.note !== undefined && { note: dto.note }),
          };
          return next;
        }
        // Inserting a new entry that hasn't been saved yet.
        // Customer/product subdocs are populated server-side; placeholder is enough for UI.
        return [
          ...list,
          {
            id: `tmp-${dto.productId}-${dto.month}`,
            year: dto.year,
            month: dto.month,
            customerId: dto.customerId,
            productId: dto.productId,
            planAmount: dto.planAmount ?? 0,
            actualAmount: dto.actualAmount ?? 0,
            unitPrice: dto.unitPrice,
            quantity: dto.quantity,
            note: dto.note,
          } as SalesEntry,
        ];
      });
      return { previous };
    },
    onError: (err, _dto, ctx) => {
      const isNetworkError =
        (typeof navigator !== 'undefined' && !navigator.onLine) ||
        (err as { code?: string })?.code === 'ERR_NETWORK';
      if (!isNetworkError && ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
    onSettled: (_data, error) => {
      const isNetworkError =
        error &&
        ((typeof navigator !== 'undefined' && !navigator.onLine) ||
          (error as { code?: string })?.code === 'ERR_NETWORK');
      if (!isNetworkError) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function usePendingCells(year: number, customerId: string | null) {
  return useMutationState({
    filters: { mutationKey: upsertEntryKey(year, customerId), status: 'pending' },
    select: (m) => m.state.variables as UpsertEntryDto,
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
