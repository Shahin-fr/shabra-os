'use client';

import React from 'react';

import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

import { FloatingActionButton } from './FloatingActionButton';
import { Header } from './Header';
import { EnhancedMobileBottomNavigation } from './EnhancedMobileBottomNavigation';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isMobile = useMobile();

  return (
    <div className='relative flex flex-col'>
      <OfflineIndicator position='top' />
      <Header />
      <Sidebar />

      {/* Main Content */}
      <main
        className={cn(
          'relative flex-1 transition-all duration-300 ease-in-out',
          'p-4 sm:p-6 mt-16 z-5',
          // Desktop sidebar spacing - fixed width for icon-only sidebar
          !isMobile ? 'lg:mr-20' : '',
          // Mobile full width with no right margin and bottom padding for navigation
          isMobile && 'w-full mr-0 pb-20'
        )}
      >
        <div className='relative z-5 max-w-7xl mx-auto'>{children}</div>
      </main>

      {/* Mobile Navigation Components */}
      {isMobile && (
        <>
          <EnhancedMobileBottomNavigation />
        </>
      )}
    </div>
  );
}


