'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { salesEntriesApi } from '@/lib/api/salesEntries';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatVND } from '@/lib/utils';
import type { Product } from '@/types/domain';
import type { PivotCell } from '@/hooks/useSalesEntries';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  year: number;
  month: number;
  customerId: string;
  productId: string;
  product?: Product;
  cell?: PivotCell;
}

function parseDecimalInput(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized || !/^\d*(?:\.\d*)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function formatEditableNumber(value: number, maximumFractionDigits = 6): string {
  return String(Number(value.toFixed(maximumFractionDigits)));
}

export function EntryDetailModal({
  open,
  onOpenChange,
  year,
  month,
  customerId,
  productId,
  product,
  cell,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const appliedUnitPrice = product?.unitPrice;
  const existingActual = cell?.actual ?? 0;
  const quantityFromCurrentPrice =
    existingActual > 0 && appliedUnitPrice
      ? (existingActual * 1_000_000) / appliedUnitPrice
      : undefined;

  const [quantity, setQuantity] = useState(
    quantityFromCurrentPrice !== undefined
      ? formatEditableNumber(quantityFromCurrentPrice)
      : cell?.quantity !== undefined
        ? formatEditableNumber(cell.quantity)
        : '',
  );
  const [calculatedActual, setCalculatedActual] = useState(existingActual);
  const [note, setNote] = useState(cell?.note ?? '');
  const [saving, setSaving] = useState(false);

  function handleQuantityChange(value: string) {
    setQuantity(value);
    const parsedQuantity = parseDecimalInput(value);
    if (parsedQuantity === null) return;
    if (appliedUnitPrice && appliedUnitPrice > 0) {
      const nextActual = (parsedQuantity * appliedUnitPrice) / 1_000_000;
      setCalculatedActual(Number(nextActual.toFixed(2)));
    }
  }

  async function handleSave() {
    const parsedQuantity = parseDecimalInput(quantity);

    if (quantity.trim() && parsedQuantity === null) {
      toast.error('Số lượng không hợp lệ');
      return;
    }
    if ((parsedQuantity ?? 0) > 0 && !appliedUnitPrice) {
      toast.error('Sản phẩm chưa có đơn giá. Hãy cập nhật trong Danh mục trước.');
      return;
    }

    setSaving(true);
    try {
      await salesEntriesApi.upsert({
        year,
        month,
        customerId,
        productId,
        ...(calculatedActual > 0 && { actualAmount: calculatedActual }),
        ...(parsedQuantity !== null && { quantity: parsedQuantity }),
        ...(appliedUnitPrice !== undefined && { unitPrice: appliedUnitPrice }),
        note: note.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['entries', year, customerId] });
      toast.success('Đã lưu');
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết: {product?.name ?? 'SP'} · T{month}/{year}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Số lượng{product?.unit ? ` (${product.unit})` : ''}</Label>
              <Input
                id="qty"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Đơn giá (VNĐ)</Label>
              <Input
                id="price"
                value={appliedUnitPrice ? formatVND(appliedUnitPrice) : ''}
                placeholder="Chưa có đơn giá"
                readOnly
                className="bg-secondary/60"
                title="Đơn giá hiện tại trong Danh mục"
              />
            </div>
          </div>

          <div className="rounded-md bg-secondary px-3 py-2 text-sm flex justify-between">
            <span className="text-muted-foreground">Thành tiền (triệu VNĐ)</span>
            <span className="font-semibold tabular-nums">
              {calculatedActual === 0 ? '—' : formatEditableNumber(calculatedActual, 2)}
            </span>
          </div>

          {appliedUnitPrice ? (
            <p className="text-[11px] text-muted-foreground">
              {existingActual > 0
                ? 'Số lượng được tính từ thành tiền đã nhập trên bảng và đơn giá hiện tại.'
                : 'Nhập số lượng để hệ thống tính thành tiền.'}
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <p className="text-xs text-destructive">
                Sản phẩm này chưa được thiết lập đơn giá nên chưa thể tính số lượng.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/catalog?tab=products&select=${productId}`);
                }}
              >
                Cập nhật đơn giá
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
