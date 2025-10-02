'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { grid, spacing } from '@/lib/design-system';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'manager' | 'employee' | 'mobile';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  className,
  variant = 'manager',
  gap = 'lg',
}) => {
  const gapClass = grid.gaps[gap];
  
  const getGridLayout = () => {
    switch (variant) {
      case 'manager':
        return 'grid-cols-1 lg:grid-cols-12';
      case 'employee':
        return 'grid-cols-1 lg:grid-cols-12';
      case 'mobile':
        return 'grid-cols-1';
      default:
        return 'grid-cols-1 lg:grid-cols-12';
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen',
        'px-4 sm:px-6 lg:px-8',
        'py-6 sm:py-8',
        className
      )}
      style={{
        maxWidth: grid.container.maxWidth,
        margin: '0 auto',
      }}
    >
      <div
        className={cn(
          'grid',
          getGridLayout(),
          `gap-${gap === 'sm' ? '2' : gap === 'md' ? '4' : gap === 'lg' ? '6' : '8'}`,
          'auto-rows-min'
        )}
      >
        {children}
      </div>
    </div>
  );
};

// Grid column components for semantic layout
interface GridColumnProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  offset?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
}

export const GridColumn: React.FC<GridColumnProps> = ({
  children,
  className,
  span = 12,
  offset = 0,
}) => {
  const spanClass = `col-span-${span}`;
  const offsetClass = offset > 0 ? `col-start-${offset + 1}` : '';
  
  return (
    <div
      className={cn(
        spanClass,
        offsetClass,
        'min-h-0', // Prevent grid blowout
        className
      )}
    >
      {children}
    </div>
  );
};

// Semantic layout components
export const Sidebar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <GridColumn span={3} className={cn('space-y-6', className)}>
    {children}
  </GridColumn>
);

export const MainContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <GridColumn span={6} className={cn('space-y-6', className)}>
    {children}
  </GridColumn>
);

export const InfoPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <GridColumn span={3} className={cn('space-y-6', className)}>
    {children}
  </GridColumn>
);

// Mobile-first responsive components
export const MobileStack: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('space-y-6', className)}>
    {children}
  </div>
);

// Breathing room component for consistent spacing
export const BreathingRoom: React.FC<{ 
  children: React.ReactNode; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ children, size = 'md', className }) => {
  const sizeClass = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  }[size];

  return (
    <div className={cn(sizeClass, className)}>
      {children}
    </div>
  );
};

// Visual rhythm component for consistent vertical spacing
export const VisualRhythm: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('space-y-8', className)}>
    {children}
  </div>
);


