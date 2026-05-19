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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { customersApi } from '@/lib/api/customers';
import { getApiErrorMessage } from '@/lib/api/client';
import type { Customer } from '@/types/domain';

const schema = z.object({
  name: z.string().trim().min(1, 'Tên không được rỗng').max(200),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(500).optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  customer: Customer | null;
  isNew: boolean;
  onSaved: (c: Customer) => void;
  onCancelled: () => void;
}

export function CustomerForm({ customer, isNew, onSaved, onCancelled }: Props) {
  const queryClient = useQueryClient();
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
    defaultValues: { name: '', phone: '', address: '', isActive: true },
  });
  const isActive = watch('isActive');

  useEffect(() => {
    if (isNew) {
      reset({ name: '', phone: '', address: '', isActive: true });
    } else if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        isActive: customer.isActive,
      });
    }
  }, [customer, isNew, reset]);

  async function onSubmit(values: FormData) {
    setSaving(true);
    try {
      const saved = isNew
        ? await customersApi.create({
            name: values.name,
            phone: values.phone || undefined,
            address: values.address || undefined,
          })
        : await customersApi.update(customer!._id, {
            name: values.name,
            phone: values.phone || undefined,
            address: values.address || undefined,
            isActive: values.isActive,
          });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(isNew ? 'Đã thêm khách hàng' : 'Đã cập nhật');
      onSaved(saved);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    setDeleting(true);
    try {
      const result = await customersApi.remove(customer._id);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
        <Label htmlFor="name">Tên khách hàng *</Label>
        <Input id="name" {...register('name')} autoFocus />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" {...register('phone')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Địa chỉ</Label>
        <Input id="address" {...register('address')} />
      </div>

      {!isNew && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="isActive"
            checked={isActive}
            onCheckedChange={(v) => setValue('isActive', !!v)}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Đang kinh doanh
          </Label>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {!isNew && customer && (
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
            Nếu khách hàng đã có dữ liệu, sẽ chuyển sang &quot;ngừng KD&quot;. Nếu chưa,
            sẽ xóa hẳn.
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
