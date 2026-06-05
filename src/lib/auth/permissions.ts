'use client';

import { useAuth } from './useAuth';

export function useIsAdmin(): boolean {
  return useAuth((s) => s.user?.role === 'admin');
}
