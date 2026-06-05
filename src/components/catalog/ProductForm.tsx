'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { productsApi } from '@/lib/api/products';
import { useCategories } from '@/hooks/useProducts';
import { getApiErrorMessage } from '@/lib/api/client';
import { useIsAdmin } from '@/lib/auth/permissions';
import type { Product, Category } from '@/types/domain';

const schema = z.object({
  name: z.string().trim().min(1, 'Tên không được rỗng').max(200),
  categoryName: z.string().min(1, 'Chọn nhóm'),
  categoryOrder: z.number().int().min(1).max(99),
  unit: z.string().trim().max(20).optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  product: Product | null;
  isNew: boolean;
  onSaved: (p: Product) => void;
  onCancelled: () => void;
}

export function ProductForm({ product, isNew, onSaved, onCancelled }: Props) {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const isAdmin = useIsAdmin();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      categoryName: '',
      categoryOrder: 1,
      unit: '',
      isActive: true,
    },
  });
  const isActive = watch('isActive');
  const categoryName = watch('categoryName');
  const categoryOrder = watch('categoryOrder');

  useEffect(() => {
    if (isNew) {
      reset({
        name: '',
        categoryName: '',
        categoryOrder: 1,
        unit: '',
        isActive: true,
      });
    } else if (product) {
      reset({
        name: product.name,
        categoryName: product.categoryName,
        categoryOrder: product.categoryOrder,
        unit: product.unit ?? '',
        isActive: product.isActive,
      });
    }
  }, [product, isNew, reset]);

  // Ensure current categoryName is always a selectable option,
  // even if categories list hasn't loaded yet or a brand-new group was added.
  const selectableCategories = useMemo<Category[]>(() => {
    const list = categories ?? [];
    if (categoryName && !list.some((c) => c.name === categoryName)) {
      return [
        ...list,
        { name: categoryName, order: categoryOrder || 99, productCount: 0 },
      ];
    }
    return list;
  }, [categories, categoryName, categoryOrder]);

  function handleNewCategory(name: string, order: number) {
    setValue('categoryName', name, { shouldValidate: true });
    setValue('categoryOrder', order, { shouldValidate: true });
    setNewCategoryOpen(false);
    toast.success(`Đã chọn nhóm mới "${name}". Bấm Lưu để tạo sản phẩm.`);
  }

  async function onSubmit(values: FormData) {
    setSaving(true);
    try {
      const saved = isNew
        ? await productsApi.create({
            name: values.name,
            categoryName: values.categoryName,
            categoryOrder: values.categoryOrder,
            unit: values.unit || undefined,
          })
        : await productsApi.update(product!._id, {
            name: values.name,
            categoryName: values.categoryName,
            categoryOrder: values.categoryOrder,
            unit: values.unit || undefined,
            isActive: values.isActive,
          });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isNew ? 'Đã thêm sản phẩm' : 'Đã cập nhật');
      onSaved(saved);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    try {
      const result = await productsApi.remove(product._id);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (result?.softDeleted) {
        toast.success('Đã chuyển sang ngừng KD do còn dữ liệu');
      } else {
        toast.success('Đã xóa');
      }
      onCancelled();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="p-name">Tên sản phẩm *</Label>
        <Input id="p-name" {...register('name')} autoFocus disabled={!isAdmin} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Nhóm *</Label>
        <div className="flex gap-2">
          <Select
            key={categoryName /* force re-mount when value changes */}
            value={categoryName || undefined}
            disabled={!isAdmin}
            onValueChange={(v) => {
              setValue('categoryName', v, { shouldValidate: true });
              const cat = selectableCategories.find((c) => c.name === v);
              if (cat) setValue('categoryOrder', cat.order, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Chọn nhóm..." />
            </SelectTrigger>
            <SelectContent>
              {selectableCategories
                .sort((a, b) => a.order - b.order)
                .map((c) => (
                  <SelectItem key={`${c.order}-${c.name}`} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setNewCategoryOpen(true)}
              aria-label="Thêm nhóm mới"
              title="Thêm nhóm mới"
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
        {errors.categoryName && (
          <p className="text-xs text-destructive">{errors.categoryName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unit">Đơn vị</Label>
        <Input id="unit" placeholder="chai, kg..." {...register('unit')} disabled={!isAdmin} />
      </div>

      {!isNew && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="p-isActive"
            checked={isActive}
            onCheckedChange={(v) => setValue('isActive', !!v)}
            disabled={!isAdmin}
          />
          <Label htmlFor="p-isActive" className="cursor-pointer">
            Đang bán
          </Label>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {isAdmin && !isNew && product && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              disabled={saving}
            >
              <Trash2 size={14} className="mr-1.5" />
              Xóa
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancelled} disabled={saving}>
            {isAdmin ? 'Hủy' : 'Đóng'}
          </Button>
          {isAdmin && (
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Nếu sản phẩm đã có dữ liệu, sẽ chuyển sang &quot;ngừng KD&quot;.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewCategoryDialog
        open={newCategoryOpen}
        onOpenChange={setNewCategoryOpen}
        existingCategories={categories ?? []}
        onConfirm={handleNewCategory}
      />
    </form>
  );
}

interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  existingCategories: Category[];
  onConfirm: (name: string, order: number) => void;
}

function NewCategoryDialog({
  open,
  onOpenChange,
  existingCategories,
  onConfirm,
}: NewCategoryDialogProps) {
  const nextOrder = useMemo(() => {
    const max = existingCategories.reduce((m, c) => Math.max(m, c.order), 0);
    return max + 1;
  }, [existingCategories]);

  const [name, setName] = useState('');
  const [order, setOrder] = useState(nextOrder);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setOrder(nextOrder);
      setError(null);
    }
  }, [open, nextOrder]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tên nhóm không được rỗng');
      return;
    }
    if (existingCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Nhóm này đã tồn tại');
      return;
    }
    const n = Number(order);
    if (!Number.isInteger(n) || n < 1 || n > 99) {
      setError('Thứ tự phải là số nguyên 1-99');
      return;
    }
    onConfirm(trimmed, n);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm nhóm mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-cat-name">Tên nhóm *</Label>
            <Input
              id="new-cat-name"
              autoFocus
              placeholder="VD: 8. PHÂN VI SINH"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              Mẹo: bắt đầu bằng số thứ tự (VD: &quot;8. ...&quot;) để dễ sắp xếp
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-cat-order">Thứ tự hiển thị</Label>
            <Input
              id="new-cat-order"
              type="number"
              min={1}
              max={99}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
            <p className="text-[11px] text-muted-foreground">
              Nhóm thứ tự nhỏ hơn sẽ hiển thị trên cùng trong báo cáo
            </p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="rounded-md bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
            <strong>Lưu ý:</strong> Nhóm chỉ thực sự tồn tại sau khi anh lưu ít
            nhất 1 sản phẩm thuộc nhóm này.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Thêm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
