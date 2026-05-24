'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast:
              'font-sans border border-border shadow-card bg-card text-foreground',
            success: 'border-l-4 border-l-success',
            error: 'border-l-4 border-l-destructive',
            warning: 'border-l-4 border-l-warning',
            info: 'border-l-4 border-l-primary',
          },
        }}
      />
    </QueryClientProvider>
  );
}
