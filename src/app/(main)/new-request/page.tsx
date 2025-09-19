'use client';

import { useSession } from 'next-auth/react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Plus, Shield } from 'lucide-react';

import { NewRequestForm } from '@/components/requests/NewRequestForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewRequestPage() {
  const { data: session, status } = useSession();

  // Show loading state
  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[#ff0a54] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!session?.user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 flex items-center justify-center'>
        <Card className='max-w-md mx-auto'>
          <CardHeader className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Shield className='h-8 w-8 text-red-600' />
            </div>
            <CardTitle className='text-xl text-red-600'>دسترسی محدود</CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-gray-600 mb-4'>
              لطفاً ابتدا وارد حساب کاربری خود شوید.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header */}
        <OptimizedMotion
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-[#ff0a54]/10 rounded-xl'>
              <Plus className='h-6 w-6 text-[#ff0a54]' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                درخواست جدید
              </h1>
              <p className='text-gray-600'>ارسال درخواست جدید</p>
            </div>
          </div>
        </OptimizedMotion>

        {/* New Request Form */}
        <NewRequestForm />
      </div>
    </div>
  );
}
