'use client';

import React from 'react';

import { useResponsive } from '@/hooks/useResponsive';

interface ClientResponsiveWrapperProps {
  children: React.ReactNode;
}

export function ClientResponsiveWrapper({
  children,
}: ClientResponsiveWrapperProps) {
  // Initialize responsive system
  useResponsive();

  return <>{children}</>;
}

