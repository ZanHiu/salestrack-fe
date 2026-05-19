'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Table, BarChart3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';

const MENU = [
  { href: '/entries', label: 'Nhập liệu', icon: Table },
  { href: '/reports', label: 'Báo cáo', icon: BarChart3 },
  { href: '/catalog', label: 'Danh mục', icon: List },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] bg-slate-50 border-r flex flex-col">
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Table size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">SalesTrack</div>
            <div className="text-xs text-slate-500">Sales của Hợp</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {MENU.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors',
                active
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-200',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <UserMenu />
      </div>
    </aside>
  );
}
