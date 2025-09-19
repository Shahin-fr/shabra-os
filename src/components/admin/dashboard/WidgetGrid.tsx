'use client';

import { WidgetGridProps } from '@/types/admin-dashboard';

const gridColsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

export function WidgetGrid({ 
  children, 
  columns, 
  gap = 8, 
  className = '' 
}: WidgetGridProps) {
  const gridClass = gridColsMap[columns];
  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

