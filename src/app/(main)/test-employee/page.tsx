'use client';

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with TanStack Query
const TestEmployeePageContent = () => {
  const EmployeeDashboard = dynamic(
    () =>
      import('@/components/dashboard/EmployeeDashboard').then(
        mod => mod.EmployeeDashboard
      ),
    {
      ssr: false,
      loading: () => (
        <div className='container mx-auto max-w-7xl p-6'>
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-3 text-muted-foreground'>
              در حال بارگذاری داشبورد کارمند...
            </p>
          </div>
        </div>
      ),
    }
  );

  return <EmployeeDashboard />;
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(TestEmployeePageContent), {
  ssr: false,
  loading: () => (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='text-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
        <p className='mt-3 text-muted-foreground'>
          در حال بارگذاری صفحه تست کارمند...
        </p>
      </div>
    </div>
  ),
});

