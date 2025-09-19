'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Calendar, FileText, Clock } from 'lucide-react';

import { NewLeaveRequestForm } from '@/components/leave/NewLeaveRequestForm';
import { MyLeaveRequestsTable } from '@/components/leave/MyLeaveRequestsTable';

export default function LeavePage() {
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
              <Calendar className='h-6 w-6 text-[#ff0a54]' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                مدیریت مرخصی
              </h1>
              <p className='text-gray-600'>درخواست مرخصی و مشاهده تاریخچه</p>
            </div>
          </div>
        </OptimizedMotion>

        <div className='space-y-8'>
          {/* New Leave Request Form */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <FileText className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    درخواست مرخصی جدید
                  </h2>
                  <p className='text-gray-600 text-sm'>
                    فرم درخواست مرخصی خود را تکمیل کنید
                  </p>
                </div>
              </div>
              <NewLeaveRequestForm />
            </div>
          </OptimizedMotion>

          {/* My Leave Requests History */}
          <OptimizedMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Clock className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    تاریخچه درخواست‌های مرخصی
                  </h2>
                  <p className='text-gray-600 text-sm'>
                    مشاهده وضعیت درخواست‌های قبلی شما
                  </p>
                </div>
              </div>
              <MyLeaveRequestsTable />
            </div>
          </OptimizedMotion>
        </div>
      </div>
    </div>
  );
}
