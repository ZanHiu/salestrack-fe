'use client';

import { useRouter } from 'next/navigation';
import { LogOut, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/useAuth';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

export function UserMenu() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  if (!user) return null;

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-200 transition-colors text-left">
        <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
          {initials(user.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user.fullName}</div>
          <div className="text-xs text-slate-500 truncate">{user.role}</div>
        </div>
        <ChevronUp size={14} className="text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        <DropdownMenuItem disabled className="text-xs opacity-60">
          {user.username}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
          <LogOut size={14} className="mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
