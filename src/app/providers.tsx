"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - Queries stay fresh longer, reducing unnecessary refetches
            gcTime: 10 * 60 * 1000,   // 10 minutes - Cached data persists longer in memory for better performance
            retry: 1,                  // Only retry failed queries once to avoid excessive retry loops
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </SessionProvider>
    </QueryClientProvider>
  );
}
