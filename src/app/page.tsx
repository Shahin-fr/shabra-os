'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useResponsive';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isMobile = useMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading only briefly while session is being established
  if (isLoading) {
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
  const isEmployee = userRoles.includes('EMPLOYEE');

  // Role-based dashboard rendering
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isEmployee) {
    return <EmployeeDashboard />;
  }

  // Show mobile dashboard for mobile devices (fallback)
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Fallback for users without specific roles
  return <EmployeeDashboard />;
}
