'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, ShieldCheck, User as UserIcon } from 'lucide-react';
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
import { useAuth } from '@/lib/auth/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { usersApi, type UserAdmin } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const createSchema = z.object({
  username: z.string().trim().toLowerCase().min(3, 'Tối thiểu 3 ký tự').max(50),
  password: z.string().min(6, 'Tối thiểu 6 ký tự').max(100),
  fullName: z.string().trim().min(1, 'Họ tên không được rỗng').max(100),
  role: z.enum(['admin', 'staff']),
});

const updateSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  role: z.enum(['admin', 'staff']),
  isActive: z.boolean(),
  newPassword: z
    .string()
    .max(100)
    .refine((v) => v === '' || v.length >= 6, 'Tối thiểu 6 ký tự')
    .optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export default function UsersPage() {
  const router = useRouter();
  const currentUser = useAuth((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserAdmin | null>(null);

  const { data: users, isLoading } = useUsers();

  // Guard: redirect non-admin to /entries
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/entries');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-0.5 border-b border-border bg-background">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
              Quản lý người dùng
            </h2>
            <p className="text-xs text-muted-foreground">
              Thêm, sửa, vô hiệu hóa tài khoản admin và nhân viên
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={14} className="mr-1.5" /> Thêm
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-auto">
        <div className="border border-border rounded-md bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream-warm">
              <tr>
                <Th>Tài khoản</Th>
                <Th>Họ tên</Th>
                <Th>Vai trò</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : (users ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                (users ?? []).map((u) => (
                  <tr key={u._id} className="border-t border-border/50 hover:bg-secondary/30">
                    <Td>
                      <span className="font-medium">{u.username}</span>
                    </Td>
                    <Td>{u.fullName}</Td>
                    <Td>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider',
                          u.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary text-muted-foreground',
                        )}
                      >
                        {u.role === 'admin' ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <UserIcon size={12} />
                        )}
                        {u.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
                      </span>
                    </Td>
                    <Td>
                      {u.isActive ? (
                        <span className="text-success font-medium">Đang hoạt động</span>
                      ) : (
                        <span className="text-muted-foreground">Vô hiệu hóa</span>
                      )}
                    </Td>
                    <Td align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(u)}
                      >
                        Sửa
                      </Button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog
        user={editing}
        currentUserId={currentUser.id}
        onOpenChange={(o) => !o && setEditing(null)}
      />
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <td
      className={cn('px-4 py-3 text-foreground', align === 'right' ? 'text-right' : 'text-left')}
    >
      {children}
    </td>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { username: '', password: '', fullName: '', role: 'staff' },
  });
  const role = watch('role');

  useEffect(() => {
    if (open) reset({ username: '', password: '', fullName: '', role: 'staff' });
  }, [open, reset]);

  async function onSubmit(values: CreateForm) {
    setSaving(true);
    try {
      await usersApi.create(values);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã thêm người dùng');
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
          <DialogTitle>Thêm người dùng</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-username">Tài khoản *</Label>
            <Input
              id="new-username"
              autoFocus
              autoComplete="off"
              placeholder="vd: minh"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-fullname">Họ và tên *</Label>
            <Input
              id="new-fullname"
              placeholder="vd: Nguyễn Văn Minh"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password">Mật khẩu *</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Vai trò *</Label>
            <Select
              value={role}
              onValueChange={(v) => setValue('role', v as 'admin' | 'staff')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Nhân viên</SelectItem>
                <SelectItem value="admin">Quản trị</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thêm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  currentUserId,
  onOpenChange,
}: {
  user: UserAdmin | null;
  currentUserId: string;
  onOpenChange: (o: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      fullName: '',
      role: 'staff',
      isActive: true,
      newPassword: '',
    },
  });
  const role = watch('role');
  const isActive = watch('isActive');

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        newPassword: '',
      });
    }
  }, [user, reset]);

  const isSelf = user?._id === currentUserId;

  async function onSubmit(values: UpdateForm) {
    if (!user) return;
    setSaving(true);
    try {
      await usersApi.update(user._id, {
        fullName: values.fullName,
        role: values.role,
        isActive: values.isActive,
        newPassword: values.newPassword ? values.newPassword : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã cập nhật');
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa người dùng: {user?.username}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fullname">Họ và tên *</Label>
            <Input id="edit-fullname" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Vai trò</Label>
            <Select
              value={role}
              onValueChange={(v) => setValue('role', v as 'admin' | 'staff')}
              disabled={isSelf}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Nhân viên</SelectItem>
                <SelectItem value="admin">Quản trị</SelectItem>
              </SelectContent>
            </Select>
            {isSelf && (
              <p className="text-[11px] text-muted-foreground">
                Không thể thay đổi vai trò của chính mình
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-password">Đặt lại mật khẩu (để trống nếu không đổi)</Label>
            <Input
              id="edit-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••"
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="edit-isActive"
              checked={isActive}
              onCheckedChange={(v) => setValue('isActive', !!v)}
              disabled={isSelf}
            />
            <Label htmlFor="edit-isActive" className="cursor-pointer">
              Đang hoạt động
            </Label>
            {isSelf && (
              <span className="text-[11px] text-muted-foreground">
                (không thể tự vô hiệu hóa)
              </span>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
