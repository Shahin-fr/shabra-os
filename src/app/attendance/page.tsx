'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

import { MobileAttendanceHistory } from '@/components/dashboard/MobileAttendanceHistory';
import { useMobile } from '@/hooks/useResponsive';

export default function AttendancePage() {
  const isMobile = useMobile();

  // Show mobile-optimized attendance history
  if (isMobile) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
        <div className='container mx-auto px-4 py-6'>
          {/* Header */}
          <motion.div
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
                  تاریخچه حضور
                </h1>
                <p className='text-gray-600'>آمار حضور و غیاب شما</p>
              </div>
            </div>
          </motion.div>

          {/* Mobile Attendance History */}
          <MobileAttendanceHistory />
        </div>
      </div>
    );
  }

  // Desktop version (placeholder for now)
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
      <div className='container mx-auto px-4 py-6'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center py-12'
        >
          <Calendar className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            تاریخچه حضور
          </h1>
          <p className='text-gray-600'>نسخه دسکتاپ در حال توسعه است</p>
        </motion.div>
      </div>
    </div>
  );
}
