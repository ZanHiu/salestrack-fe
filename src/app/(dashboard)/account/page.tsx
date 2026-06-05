'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/useAuth';

const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Họ tên không được rỗng').max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Tối thiểu 6 ký tự'),
    newPassword: z.string().min(6, 'Tối thiểu 6 ký tự').max(100),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => (u: typeof user) => s.login(s.token ?? '', u!));

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-0.5 border-b border-border bg-background">
        <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
          Tài khoản
        </h2>
        <p className="text-xs text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-auto">
        <div className="max-w-xl space-y-4">
          <ProfileSection user={user} onUpdated={setUser} />
          <PasswordSection />
        </div>
      </div>
    </div>
  );
}

function ProfileSection({
  user,
  onUpdated,
}: {
  user: ReturnType<typeof useAuth.getState>['user'];
  onUpdated: (u: ReturnType<typeof useAuth.getState>['user']) => void;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '' },
  });

  async function onSubmit(values: ProfileForm) {
    setSaving(true);
    try {
      const updated = await authApi.updateProfile(values.fullName);
      onUpdated(updated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Đã cập nhật hồ sơ');
      reset({ fullName: updated.fullName });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-heading">Hồ sơ</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">
                Tài khoản
              </Label>
              <Input value={user?.username ?? ''} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">
                Vai trò
              </Label>
              <Input value={user?.role === 'admin' ? 'Quản trị' : 'Nhân viên'} disabled />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving || !isDirty}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(values: PasswordForm) {
    setSaving(true);
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      toast.success('Đã đổi mật khẩu');
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-heading">Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
