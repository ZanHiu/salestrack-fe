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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="font-heading font-bold text-7xl text-destructive/20 leading-none">
          500
        </div>
        <div className="space-y-2">
          <h1 className="font-heading font-semibold text-xl text-foreground">
            Có lỗi xảy ra
          </h1>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Lỗi hệ thống. Vui lòng thử lại sau ít phút.'}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
          >
            Về trang chủ
          </Button>
          <Button onClick={reset}>Thử lại</Button>
        </div>
      </div>
    </div>
  );
}
