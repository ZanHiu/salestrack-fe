'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
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
import type { Product } from '@/types/domain';

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
        <Input id="p-name" {...register('name')} autoFocus />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Nhóm *</Label>
        <Select
          value={categoryName}
          onValueChange={(v) => {
            setValue('categoryName', v);
            const cat = categories?.find((c) => c.name === v);
            if (cat) setValue('categoryOrder', cat.order);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhóm..." />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((c) => (
              <SelectItem key={c.order} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryName && (
          <p className="text-xs text-destructive">{errors.categoryName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unit">Đơn vị</Label>
        <Input id="unit" placeholder="chai, kg..." {...register('unit')} />
      </div>

      {!isNew && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="p-isActive"
            checked={isActive}
            onCheckedChange={(v) => setValue('isActive', !!v)}
          />
          <Label htmlFor="p-isActive" className="cursor-pointer">
            Đang bán
          </Label>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {!isNew && product && (
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
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
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
    </form>
  );
}
