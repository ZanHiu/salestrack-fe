'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Table,
  BarChart3,
  List,
  LayoutDashboard,
  Users,
  UserCog,
  ScrollText,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/useAuth';
import { usePrefs } from '@/lib/prefs/usePrefs';
import { UserMenu } from './UserMenu';

const WORK_MENU = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/entries', label: 'Nhập liệu', icon: Table },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
];

const MANAGE_MENU = [
  { href: '/catalog', label: 'Danh mục', icon: List },
];

const ADMIN_ONLY: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/users', label: 'Người dùng', icon: Users },
  { href: '/audit', label: 'Nhật ký', icon: ScrollText },
];

const PERSONAL_MENU = [{ href: '/account', label: 'Tài khoản', icon: UserCog }];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuth((s) => s.user?.role);
  const collapsed = usePrefs((s) => s.sidebarCollapsed);
  const patch = usePrefs((s) => s.patch);

  return (
    <aside
      className={cn(
        'bg-brand-cream-muted border-r border-border flex flex-col transition-[width] duration-200',
        collapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      {/* Brand block */}
      <div className={cn('py-5 border-b border-border', collapsed ? 'px-0' : 'px-4')}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center shadow-card shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 19V8L12 4L19 8V19M5 19H19M5 19V12M19 19V12M9 19V14H15V19"
                stroke="hsl(36 33% 97%)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="font-heading font-semibold text-foreground text-[15px]">
                SalesTrack
              </div>
              <div className="text-xs text-muted-foreground">Sổ doanh số</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-3 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavSection items={WORK_MENU} pathname={pathname} collapsed={collapsed} />

        <NavSection
          items={role === 'admin' ? [...MANAGE_MENU, ...ADMIN_ONLY] : MANAGE_MENU}
          pathname={pathname}
          collapsed={collapsed}
          label="Quản lý"
        />

        <NavSection
          items={PERSONAL_MENU}
          pathname={pathname}
          collapsed={collapsed}
          label="Cá nhân"
        />

        {/* Collapse toggle — placed at end of nav list */}
        <div className="mt-auto px-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => patch({ sidebarCollapsed: !collapsed })}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors',
              collapsed && 'justify-center px-0',
            )}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Thu gọn</span>}
          </button>
        </div>
      </nav>

      {/* User menu bottom */}
      <div className="border-t border-border p-2">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

function NavSection({
  items,
  pathname,
  label,
  collapsed,
}: {
  items: NavItem[];
  pathname: string;
  label?: string;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {label && (
        <div className="h-5 mb-0.5 flex items-center">
          {collapsed ? (
            <div className="mx-3 w-full border-t border-border/60" aria-hidden="true" />
          ) : (
            <div className="px-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          )}
        </div>
      )}
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? itemLabel : undefined}
            className={cn(
              'relative flex items-center gap-2.5 py-2 text-sm transition-colors',
              collapsed ? 'justify-center px-0 mx-2 rounded-md' : 'px-5',
              active
                ? 'bg-card text-primary font-medium'
                : 'text-foreground/80 hover:text-foreground hover:bg-card/50',
            )}
          >
            {active && !collapsed && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r"
                aria-hidden="true"
              />
            )}
            <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
            {!collapsed && <span>{itemLabel}</span>}
          </Link>
        );
      })}
    </div>
  );
}
