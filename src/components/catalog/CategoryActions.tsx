'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

interface CategoryTarget {
  categoryName: string;
  categoryOrder: number;
  rows: { _id: string }[];
}

interface RenameProps {
  target: CategoryTarget | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newName: string, newOrder: number) => Promise<void>;
}

export function RenameCategoryDialog({ target, onOpenChange, onConfirm }: RenameProps) {
  const [name, setName] = useState('');
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (target) {
      setName(target.categoryName);
      setOrder(target.categoryOrder);
      setError(null);
    }
  }, [target]);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tên nhóm không được rỗng');
      return;
    }
    const n = Number(order);
    if (!Number.isInteger(n) || n < 1 || n > 99) {
      setError('Thứ tự phải là số nguyên 1-99');
      return;
    }
    setSaving(true);
    try {
      await onConfirm(trimmed, n);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Đổi tên nhóm</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rename-cat-name">Tên nhóm *</Label>
            <Input
              id="rename-cat-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rename-cat-order">Thứ tự hiển thị</Label>
            <Input
              id="rename-cat-order"
              type="number"
              min={1}
              max={99}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {target && target.rows.length > 0 && (
            <div className="rounded-md bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
              Sẽ cập nhật {target.rows.length} sản phẩm thuộc nhóm này.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProps {
  target: CategoryTarget | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteCategoryDialog({
  target,
  onOpenChange,
  onConfirm,
}: DeleteProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  const hasProducts = target ? target.rows.length > 0 : false;

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xóa nhóm &quot;{target?.categoryName}&quot;?</DialogTitle>
        </DialogHeader>

        {hasProducts ? (
          <p className="text-sm text-muted-foreground">
            Nhóm này còn <strong className="text-foreground">{target?.rows.length} sản phẩm</strong>.
            Phải xóa sản phẩm trước khi xóa nhóm.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nhóm này không có sản phẩm — có thể xóa an toàn.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting || hasProducts}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
