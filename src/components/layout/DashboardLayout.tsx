'use client';

import React from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { FloatingActionButton } from './FloatingActionButton';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isMobile = useMobile();

  return (
    <div className='relative flex flex-col bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
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
          <MobileBottomNavigation />
          {/* Only show FAB for non-employee roles (MANAGER, ADMIN) */}
          {user?.roles && !user.roles.includes('EMPLOYEE') && (
            <FloatingActionButton />
          )}
        </>
      )}
    </div>
  );
}

// Utility function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
