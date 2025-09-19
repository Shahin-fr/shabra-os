import React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

