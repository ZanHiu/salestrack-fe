'use client';

import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { format, isSameYear, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAudit } from '@/hooks/useAudit';
import type { AuditAction, AuditEntry, AuditResource } from '@/lib/api/audit';

interface Props {
  year: number;
}

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

const RESOURCE_INLINE: Record<AuditResource, string> = {
  'sales-entry': 'doanh số',
  customer: 'khách hàng',
  product: 'sản phẩm',
  category: 'nhóm sản phẩm',
  user: 'người dùng',
  auth: '',
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

function formatGroupLabel(date: Date): string {
  if (isToday(date)) return 'Hôm nay';
  if (isYesterday(date)) return 'Hôm qua';
  const now = new Date();
  if (isSameYear(date, now)) {
    return format(date, 'EEEE, dd/MM', { locale: vi });
  }
  return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
}

function groupByDate(
  entries: AuditEntry[],
): { label: string; key: string; entries: AuditEntry[] }[] {
  const groups: { label: string; key: string; entries: AuditEntry[] }[] = [];
  for (const e of entries) {
    const d = new Date(e.createdAt);
    const key = format(d, 'yyyy-MM-dd');
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push(e);
    else groups.push({ key, label: formatGroupLabel(d), entries: [e] });
  }
  return groups;
}

export function RecentActivity(_props: Props) {
  const { data, isLoading } = useAudit({ pageSize: 15 });

  const grouped = useMemo(() => groupByDate(data?.data ?? []), [data]);

  return (
    <div className="bg-card border border-border rounded-md shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hoạt động gần đây
        </h3>
        <Link
          href="/audit"
          className="text-[11px] text-primary hover:underline"
        >
          Xem tất cả →
        </Link>
      </div>
      <div>
        {isLoading ? (
          <div className="p-4 text-sm text-center text-muted-foreground">Đang tải...</div>
        ) : grouped.length === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">
            Chưa có hoạt động nào
          </div>
        ) : (
          grouped.map((group) => (
            <Fragment key={group.key}>
              <div className="px-4 py-1.5 bg-secondary/60 border-y border-border text-[11px] font-semibold uppercase tracking-wider">
                <span className="text-foreground">{group.label}</span>
                <span className="ml-2 text-muted-foreground opacity-60">
                  · {format(new Date(group.entries[0].createdAt), 'dd/MM/yyyy')} ·{' '}
                  {group.entries.length} bản ghi
                </span>
              </div>
              {group.entries.map((entry) => {
                const d = new Date(entry.createdAt);
                const resourceWord = RESOURCE_INLINE[entry.resource];
                return (
                  <div
                    key={entry._id}
                    className="px-4 py-2.5 border-b border-border/30 last:border-b-0 hover:bg-secondary/30"
                  >
                    {/* Line 1: title — user + action badge + resource type · time on right */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                        <span className="font-medium text-foreground">
                          {entry.userFullName}
                        </span>
                        <span
                          className={cn(
                            'inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                            ACTION_BADGE[entry.action],
                          )}
                        >
                          {ACTION_LABEL[entry.action]}
                        </span>
                        {resourceWord && (
                          <span className="text-muted-foreground">{resourceWord}</span>
                        )}
                      </div>
                      <span
                        className="font-mono text-[11px] text-muted-foreground shrink-0"
                        title={format(d, 'dd/MM/yyyy HH:mm:ss')}
                      >
                        {format(d, 'HH:mm:ss')}
                      </span>
                    </div>
                    {/* Line 2: resourceLabel full width */}
                    {entry.resourceLabel && (
                      <div className="text-[11px] text-foreground/70 mt-0.5 truncate">
                        {entry.resourceLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))
        )}
      </div>
    </div>
  );
}
