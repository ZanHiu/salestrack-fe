'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/useAuth';

const loginSchema = z.object({
  username: z.string().min(3, 'Tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Tối thiểu 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    try {
      const { token, user } = await authApi.login(values.username, values.password);
      login(token, user);
      router.replace('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left: brand block */}
      <div className="hidden md:flex relative bg-primary text-primary-foreground p-12 flex-col justify-between bg-lua-pattern">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/10 backdrop-blur rounded-md flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 19V8L12 4L19 8V19M5 19H19M5 19V12M19 19V12M9 19V14H15V19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-heading font-semibold text-lg">SalesTrack</span>
        </div>

        <div className="space-y-6 max-w-md">
          <h1 className="font-heading font-semibold text-3xl leading-tight">
            Sổ doanh số online
            <br />
            <span className="text-primary-foreground/70">không bị lỗi #REF!</span>
          </h1>
          <div className="space-y-2 text-primary-foreground/80">
            <p className="text-sm leading-relaxed">
              Quản lý <strong className="text-primary-foreground">20 đại lý</strong> ×{' '}
              <strong className="text-primary-foreground">37 sản phẩm</strong> ×{' '}
              <strong className="text-primary-foreground">12 tháng</strong> trên một bảng
              duy nhất.
            </p>
            <p className="text-sm leading-relaxed">
              Nhập theo số lượng × đơn giá. Báo cáo tự động. Xuất Excel khi cần.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm italic text-primary-foreground/90">
            &ldquo;Muốn 1 website đơn giản để quản lý.&rdquo;
          </p>
          <p className="text-xs text-primary-foreground/60">— Anh Hợp, chủ doanh nghiệp</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile brand */}
          <div className="md:hidden text-center space-y-1">
            <div className="font-heading font-semibold text-2xl text-primary">
              SalesTrack
            </div>
            <p className="text-sm text-muted-foreground">Sổ doanh số online</p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-semibold text-2xl text-foreground">
              Đăng nhập
            </h2>
            <p className="text-sm text-muted-foreground">
              Nhập thông tin tài khoản để vào sổ.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-foreground">
                Tài khoản
              </Label>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Không có tài khoản? Liên hệ Anh Hợp để được cấp quyền.
          </p>
        </div>
      </div>
    </div>
  );
}
