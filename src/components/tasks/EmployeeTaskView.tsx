'use client';

import { ReactNode } from 'react';

interface EmployeeTaskViewProps {
  children: ReactNode;
}

export function EmployeeTaskView({ children }: EmployeeTaskViewProps) {
  return <>{children}</>;
}

