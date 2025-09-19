'use client';

import { useState, useEffect } from 'react';

/**
 * ClientOnly Component
 * 
 * Prevents hydration mismatches by only rendering children on the client side.
 * This is essential for components that use randomization or other client-only features.
 */
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}