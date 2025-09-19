'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'تسک تکمیل شد',
    message: 'طراحی رابط کاربری با موفقیت تکمیل شد',
    time: '5 دقیقه پیش',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'تسک در انتظار',
    message: 'تسک "بررسی کد" تا 2 ساعت دیگر باید تکمیل شود',
    time: '1 ساعت پیش',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'جلسه جدید',
    message: 'جلسه تیم فردا ساعت 10:00 برنامه‌ریزی شده',
    time: '2 ساعت پیش',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'پروژه به‌روزرسانی شد',
    message: 'پروژه "وب‌سایت جدید" به مرحله تست رسید',
    time: '3 ساعت پیش',
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className='h-5 w-5 text-green-600' />;
    case 'warning':
      return <AlertTriangle className='h-5 w-5 text-yellow-600' />;
    case 'info':
      return <Info className='h-5 w-5 text-blue-600' />;
    default:
      return <Bell className='h-5 w-5 text-gray-600' />;
  }
};

const getNotificationBg = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function MobileNotificationsWidget() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Card className='mobile-card'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center'>
              <Bell className='h-5 w-5 text-[#ff0a54]' />
            </div>
            <span className='mobile-subheading'>اعلان‌ها</span>
          </div>
          {unreadCount > 0 && (
            <Badge className='bg-[#ff0a54] text-white'>{unreadCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='mobile-spacing'>
        {mockNotifications.slice(0, 3).map((notification, index) => (
          <OptimizedMotion
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getNotificationBg(notification.type)} ${
              !notification.read ? 'ring-2 ring-[#ff0a54]/20' : ''
            }`}
          >
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0 mt-1'>
                {getNotificationIcon(notification.type)}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between'>
                  <h4
                    className={`font-semibold text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                  >
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <div className='w-2 h-2 bg-[#ff0a54] rounded-full flex-shrink-0 mt-2'></div>
                  )}
                </div>
                <p className='text-xs text-gray-600 mt-1 line-clamp-2'>
                  {notification.message}
                </p>
                <p className='text-xs text-gray-500 mt-2'>
                  {notification.time}
                </p>
              </div>
            </div>
          </OptimizedMotion>
        ))}

        {/* View All Button */}
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='pt-4 border-t border-gray-200'
        >
          <Button
            variant='outline'
            className='w-full bg-white/50 hover:bg-white/80 border-gray-200 text-sm'
          >
            مشاهده همه اعلان‌ها
          </Button>
        </OptimizedMotion>
      </CardContent>
    </Card>
  );
}

