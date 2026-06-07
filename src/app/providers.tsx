'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState } from 'react';
import { Toaster } from 'sonner';

const ONE_DAY = 24 * 60 * 60 * 1000;

function makePersister() {
  if (typeof window === 'undefined') return null;
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: 'salestrack-cache',
    throttleTime: 1000,
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: ONE_DAY,
            retry: 1,
            refetchOnWindowFocus: false,
            networkMode: 'offlineFirst',
          },
          mutations: {
            networkMode: 'offlineFirst',
            retry: 3,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
          },
        },
      }),
  );

  const [persister] = useState(makePersister);

  const toaster = (
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
  );

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {toaster}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY,
        dehydrateOptions: {
          shouldDehydrateMutation: (m) => m.state.status === 'pending',
        },
      }}
      onSuccess={() => {
        queryClient.resumePausedMutations();
      }}
    >
      {children}
      {toaster}
    </PersistQueryClientProvider>
  );
}
