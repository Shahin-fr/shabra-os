'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PDDManagerDashboard } from '@/components/dashboard/PDDManagerDashboard';
import { PDDEmployeeDashboard } from '@/components/dashboard/PDDEmployeeDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isMobile = useMobile();
  const [forceLoadingComplete, setForceLoadingComplete] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Authentication loading timeout reached, forcing loading state to complete');
        setForceLoadingComplete(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Show loading only briefly while session is being established
  // Use timeout fallback to prevent infinite loading
  if (isLoading && !forceLoadingComplete) {
    return (
      <div className='container mx-auto max-w-7xl space-y-10'>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-3 text-muted-foreground'>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if no user yet
  if (!user) {
    return null;
  }

  // Check user roles for conditional rendering
  const userRoles = user.roles || [];
  const isAdmin = userRoles.includes('ADMIN');
  const isManager = userRoles.includes('MANAGER');
  const isEmployee = userRoles.includes('EMPLOYEE');

  // Mobile-first rendering
  if (isMobile) {
    if (isAdmin || isManager) {
      return <PDDManagerDashboard />;
    }
    if (isEmployee) {
      return <PDDEmployeeDashboard />;
    }
    return <PDDEmployeeDashboard />;
  }

  // Desktop role-based dashboard rendering
  if (isAdmin) {
    return <PDDManagerDashboard />;
  }

  if (isManager) {
    return <PDDManagerDashboard />;
  }

  if (isEmployee) {
    return <PDDEmployeeDashboard />;
  }

  // Fallback for users without specific roles
  return <PDDEmployeeDashboard />;
}

