'use client';

import { ReactNode } from 'react';

interface ManagerTaskViewProps {
  children: ReactNode;
}

export function ManagerTaskView({ children }: ManagerTaskViewProps) {
  return <>{children}</>;
}
