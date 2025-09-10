'use client';

import React, { useEffect, useState } from 'react';

import { ClientResponsiveWrapper } from './ClientResponsiveWrapper';

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add touch-friendly CSS variables for mobile
  useEffect(() => {
    if (!isClient) return;

    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      document.documentElement.style.setProperty('--touch-friendly', 'true');
      document.documentElement.style.setProperty('--scroll-behavior', 'smooth');
    } else {
      document.documentElement.style.setProperty('--touch-friendly', 'false');
      document.documentElement.style.setProperty('--scroll-behavior', 'auto');
    }
  }, [isClient]);

  // Always render the same structure to prevent hydration mismatch
  return (
    <ClientResponsiveWrapper>
      {children}
    </ClientResponsiveWrapper>
  );
}
