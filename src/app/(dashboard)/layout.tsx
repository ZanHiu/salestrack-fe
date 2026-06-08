'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { OfflineFallback } from '@/components/OfflineFallback';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

// Routes that fully support offline use — others show a fallback when offline.
const OFFLINE_CAPABLE_ROUTES = ['/entries'];

// Vietnamese label per route prefix, used in the offline fallback message.
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'tổng quan',
  '/reports': 'báo cáo',
  '/audit': 'nhật ký hoạt động',
  '/catalog': 'danh mục',
  '/users': 'quản lý người dùng',
  '/account': 'tài khoản',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const online = useOnlineStatus();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  const requiresOnline =
    !OFFLINE_CAPABLE_ROUTES.some((p) => pathname.startsWith(p));
  const pageName = Object.entries(ROUTE_LABELS).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden bg-background">
        {!online && requiresOnline ? (
          <OfflineFallback pageName={pageName} />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
