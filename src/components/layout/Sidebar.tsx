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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/useAuth';
import { UserMenu } from './UserMenu';

const WORK_MENU = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/entries', label: 'Nhập liệu', icon: Table },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
];

const MANAGE_MENU = [
  { href: '/catalog', label: 'Danh mục', icon: List },
  // /users appended at render time if admin
];

const ADMIN_ONLY: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/users', label: 'Người dùng', icon: Users },
  { href: '/audit', label: 'Nhật ký', icon: ScrollText },
];

const PERSONAL_MENU = [{ href: '/account', label: 'Tài khoản', icon: UserCog }];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuth((s) => s.user?.role);

  return (
    <aside className="w-[220px] bg-brand-cream-muted border-r border-border flex flex-col">
      {/* Brand block */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center shadow-card">
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
          <div className="leading-tight">
            <div className="font-heading font-semibold text-foreground text-[15px]">
              SalesTrack
            </div>
            <div className="text-xs text-muted-foreground">Sổ doanh số</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-3 overflow-y-auto">
        <NavSection items={WORK_MENU} pathname={pathname} />

        <NavSection
          items={role === 'admin' ? [...MANAGE_MENU, ...ADMIN_ONLY] : MANAGE_MENU}
          pathname={pathname}
          label="Quản lý"
        />

        <NavSection items={PERSONAL_MENU} pathname={pathname} label="Cá nhân" />
      </nav>

      {/* User menu bottom */}
      <div className="border-t border-border p-2">
        <UserMenu />
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
}: {
  items: NavItem[];
  pathname: string;
  label?: string;
}) {
  return (
    <div className="space-y-0.5">
      {label && (
        <div className="px-5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex items-center gap-2.5 px-5 py-2 text-sm transition-colors',
              active
                ? 'bg-card text-primary font-medium'
                : 'text-foreground/80 hover:text-foreground hover:bg-card/50',
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-r"
                aria-hidden="true"
              />
            )}
            <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
            <span>{itemLabel}</span>
          </Link>
        );
      })}
    </div>
  );
}
