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
      <DropdownMenuTrigger className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-card transition-colors text-left">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-xs font-semibold font-heading">
          {initials(user.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-foreground">{user.fullName}</div>
          <div className="text-xs text-muted-foreground truncate capitalize">{user.role}</div>
        </div>
        <ChevronUp size={14} className="text-muted-foreground" />
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
