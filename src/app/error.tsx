'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl font-bold text-slate-300">500</div>
        <h1 className="text-xl font-semibold">Có lỗi xảy ra</h1>
        <p className="text-sm text-slate-500">{error.message || 'Lỗi hệ thống'}</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => (window.location.href = '/entries')}>
            Về trang chủ
          </Button>
          <Button onClick={reset}>Thử lại</Button>
        </div>
      </div>
    </div>
  );
}
