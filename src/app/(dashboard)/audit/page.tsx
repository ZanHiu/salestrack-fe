'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth/useAuth';
import { useAudit } from '@/hooks/useAudit';
import type { AuditAction, AuditEntry, AuditResource } from '@/lib/api/audit';

const ACTION_LABEL: Record<AuditAction, string> = {
  create: 'Tạo',
  update: 'Sửa',
  delete: 'Xóa',
  deactivate: 'Vô hiệu hóa',
  bulk_import: 'Nhập hàng loạt',
  login: 'Đăng nhập',
  login_failed: 'Đăng nhập thất bại',
  logout: 'Đăng xuất',
  password_change: 'Đổi mật khẩu',
  profile_update: 'Cập nhật hồ sơ',
};

const RESOURCE_LABEL: Record<AuditResource, string> = {
  'sales-entry': 'Doanh số',
  customer: 'Khách hàng',
  product: 'Sản phẩm',
  category: 'Nhóm SP',
  user: 'Người dùng',
  auth: 'Đăng nhập',
};

const ACTION_BADGE: Record<AuditAction, string> = {
  create: 'bg-success-bg text-success',
  update: 'bg-primary/10 text-primary',
  delete: 'bg-destructive/10 text-destructive',
  deactivate: 'bg-warning-bg text-warning',
  bulk_import: 'bg-brand-orange/10 text-brand-orange',
  login: 'bg-secondary text-muted-foreground',
  login_failed: 'bg-destructive/10 text-destructive',
  logout: 'bg-secondary text-muted-foreground',
  password_change: 'bg-primary/10 text-primary',
  profile_update: 'bg-primary/10 text-primary',
};

export default function AuditPage() {
  const router = useRouter();
  const currentUser = useAuth((s) => s.user);
  const [resource, setResource] = useState<AuditResource | 'all'>('all');
  const [action, setAction] = useState<AuditAction | 'all'>('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AuditEntry | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/entries');
    }
  }, [currentUser, router]);

  const { data, isLoading } = useAudit({
    resource: resource === 'all' ? undefined : resource,
    action: action === 'all' ? undefined : action,
    page,
    pageSize: 50,
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [resource, action]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-7 pb-5 space-y-5 border-b border-border bg-background">
        <div className="space-y-0.5">
          <h2 className="font-heading font-semibold text-2xl text-foreground leading-tight">
            Nhật ký hoạt động
          </h2>
          <p className="text-xs text-muted-foreground">
            Theo dõi mọi thao tác của người dùng trong hệ thống
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">
              Đối tượng
            </label>
            <Select
              value={resource}
              onValueChange={(v) => setResource(v as AuditResource | 'all')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="sales-entry">Doanh số</SelectItem>
                <SelectItem value="customer">Khách hàng</SelectItem>
                <SelectItem value="product">Sản phẩm</SelectItem>
                <SelectItem value="category">Nhóm SP</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="auth">Đăng nhập</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">
              Hành động
            </label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as AuditAction | 'all')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="create">Tạo</SelectItem>
                <SelectItem value="update">Sửa</SelectItem>
                <SelectItem value="delete">Xóa</SelectItem>
                <SelectItem value="deactivate">Vô hiệu hóa</SelectItem>
                <SelectItem value="bulk_import">Nhập hàng loạt</SelectItem>
                <SelectItem value="login">Đăng nhập</SelectItem>
                <SelectItem value="login_failed">Đăng nhập thất bại</SelectItem>
                <SelectItem value="logout">Đăng xuất</SelectItem>
                <SelectItem value="password_change">Đổi mật khẩu</SelectItem>
                <SelectItem value="profile_update">Cập nhật hồ sơ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto text-xs text-muted-foreground">
            {total.toLocaleString('vi-VN')} bản ghi
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-auto">
        <div className="border border-border rounded-md bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream-warm">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border w-[140px]">
                  Thời gian
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                  Người dùng
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border w-[140px]">
                  Hành động
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border w-[120px]">
                  Đối tượng
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                  Chi tiết
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border w-[80px]" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : (data?.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Không có bản ghi
                  </td>
                </tr>
              ) : (
                (data?.data ?? []).map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-t border-border/50 hover:bg-secondary/30"
                  >
                    <td
                      className="px-4 py-2.5 text-xs text-muted-foreground"
                      title={format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                    >
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-foreground">{entry.userFullName}</div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        {entry.userRole}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider',
                          ACTION_BADGE[entry.action],
                        )}
                      >
                        {ACTION_LABEL[entry.action]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {RESOURCE_LABEL[entry.resource]}
                    </td>
                    <td className="px-4 py-2.5 text-foreground truncate max-w-md">
                      {entry.resourceLabel || (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {(entry.changes?.length ?? 0) > 0 ||
                      (entry.metadata && Object.keys(entry.metadata).length > 0) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetail(entry)}
                        >
                          Xem
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau →
              </Button>
            </div>
          </div>
        )}
      </div>

      <AuditDetailDialog entry={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}

function AuditDetailDialog({
  entry,
  onOpenChange,
}: {
  entry: AuditEntry | null;
  onOpenChange: (o: boolean) => void;
}) {
  if (!entry) return null;

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {ACTION_LABEL[entry.action]} · {RESOURCE_LABEL[entry.resource]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Người dùng" value={`${entry.userFullName} (${entry.userRole})`} />
            <Field
              label="Thời gian"
              value={format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm:ss')}
            />
            {entry.resourceLabel && (
              <Field label="Đối tượng" value={entry.resourceLabel} colSpan />
            )}
          </div>

          {entry.changes && entry.changes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Thay đổi
              </div>
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Trường
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Trước
                      </th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Sau
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.changes.map((c, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="px-3 py-2 font-mono text-xs">{c.field}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {formatValue(c.before)}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-foreground">
                          {formatValue(c.after)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Metadata
              </div>
              <pre className="bg-secondary rounded-md p-3 text-xs font-mono overflow-auto max-h-48">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  colSpan,
}: {
  label: string;
  value: string;
  colSpan?: boolean;
}) {
  return (
    <div className={cn('space-y-0.5', colSpan && 'col-span-2')}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
