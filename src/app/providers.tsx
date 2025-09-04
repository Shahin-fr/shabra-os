'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

import { createIntegratedQueryClient } from '@/lib/query-cache-integration';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    createIntegratedQueryClient({
      strategy: 'balanced',
      enablePersistentCache: true,
      enableBackgroundSync: false, // Disable for performance
      enableOptimisticUpdates: true,
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchInterval={0} // Don't auto-refetch session
        refetchOnWindowFocus={false} // Prevent unnecessary refetches
        refetchWhenOffline={false} // Don't refetch when offline
      >
        {children}
        <Toaster position='top-center' richColors />
      </SessionProvider>
    </QueryClientProvider>
  );
}
