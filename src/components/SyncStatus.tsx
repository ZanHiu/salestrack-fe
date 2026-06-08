'use client';

import { useEffect } from 'react';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { CloudOff, Clock, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

export function SyncStatus() {
  const online = useOnlineStatus();
  const queryClient = useQueryClient();
  const pendingCount = useMutationState({
    filters: { status: 'pending' },
  }).length;

  // Auto-trigger resume when network returns
  useEffect(() => {
    if (online && pendingCount > 0) {
      queryClient.resumePausedMutations();
    }
  }, [online, pendingCount, queryClient]);

  if (online && pendingCount === 0) return null;

  return (
    <div
      className={
        'flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border ' +
        (online
          ? 'bg-warning/10 border-warning/30 text-warning-foreground'
          : 'bg-muted/60 border-border text-muted-foreground')
      }
    >
      {!online ? (
        <>
          <CloudOff size={14} />
          <span>Đang offline</span>
        </>
      ) : (
        <>
          <RefreshCw size={14} className="animate-spin" />
          <span>Đang đồng bộ</span>
        </>
      )}
      {pendingCount > 0 && (
        <>
          <span className="opacity-60">·</span>
          <Clock size={12} />
          <span>{pendingCount} thay đổi chờ đồng bộ</span>
        </>
      )}
    </div>
  );
}
