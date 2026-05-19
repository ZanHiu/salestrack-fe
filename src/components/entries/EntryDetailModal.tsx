'use client';

import { useState } from 'react';
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
import { formatVND, formatMillion, parseNumberInput } from '@/lib/utils';
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
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(String(cell?.quantity ?? ''));
  const [unitPrice, setUnitPrice] = useState(
    cell?.unitPrice ? formatVND(cell.unitPrice) : '',
  );
  const [note, setNote] = useState(cell?.note ?? '');
  const [saving, setSaving] = useState(false);

  const q = parseNumberInput(quantity);
  const p = parseNumberInput(unitPrice);
  const computedActual = q && p ? Math.round((q * p) / 1_000_000 * 100) / 100 : 0;

  async function handleSave() {
    setSaving(true);
    try {
      await salesEntriesApi.upsert({
        year,
        month,
        customerId,
        productId,
        quantity: q || undefined,
        unitPrice: p || undefined,
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
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Đơn giá (VNĐ)</Label>
              <Input
                id="price"
                inputMode="decimal"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md bg-slate-50 px-3 py-2 text-sm flex justify-between">
            <span className="text-slate-600">Thành tiền (triệu VNĐ)</span>
            <span className="font-semibold tabular-nums">
              {computedActual === 0 ? '—' : formatMillion(computedActual)}
            </span>
          </div>

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
