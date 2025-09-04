'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return 'خطا در پیکربندی سرور';
      case 'AccessDenied':
        return 'دسترسی رد شد';
      case 'Verification':
        return 'خطا در تأیید حساب کاربری';
      case 'Default':
      default:
        return 'خطا در احراز هویت';
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card
          className='w-full max-w-md'
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.15),
              0 8px 25px rgba(255, 10, 84, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
          }}
        >
          <CardHeader className='pb-6 text-center'>
            <CardTitle className='text-2xl font-bold text-red-600 mb-3'>
              خطا در احراز هویت
            </CardTitle>
            <p className='text-muted-foreground'>
              مشکلی در ورود به سیستم پیش آمده است
            </p>
          </CardHeader>

          <CardContent className='space-y-6'>
            <div className='p-4 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700'>
              {getErrorMessage(error)}
            </div>

            <div className='space-y-3'>
              <Button
                onClick={() => window.history.back()}
                className='w-full bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
              >
                بازگشت
              </Button>

              <Button
                variant='outline'
                onClick={() => (window.location.href = '/login')}
                className='w-full'
              >
                تلاش مجدد
              </Button>
            </div>

            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>
                اگر مشکل ادامه دارد، با مدیر سیستم تماس بگیرید
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
