'use client';

import { motion } from 'framer-motion';
import { Bell, Megaphone, User, AlertTriangle, CheckCircle, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'announcement',
    title: 'جلسه تیم فردا',
    message: 'جلسه هفتگی تیم فردا ساعت 10 صبح در اتاق کنفرانس برگزار می‌شود.',
    time: '2 ساعت پیش',
    isRead: false,
    priority: 'high',
  },
  {
    id: 2,
    type: 'task',
    title: 'تسک جدید اختصاص یافت',
    message: 'تسک "بررسی کدهای جدید" به شما اختصاص یافت.',
    time: '4 ساعت پیش',
    isRead: false,
    priority: 'medium',
  },
  {
    id: 3,
    type: 'reminder',
    title: 'یادآوری: گزارش ماهانه',
    message: 'گزارش ماهانه باید تا فردا ساعت 14:00 ارسال شود.',
    time: '6 ساعت پیش',
    isRead: true,
    priority: 'high',
  },
  {
    id: 4,
    type: 'system',
    title: 'به‌روزرسانی سیستم',
    message: 'سیستم در ساعت 23:00 به‌روزرسانی خواهد شد.',
    time: '1 روز پیش',
    isRead: true,
    priority: 'low',
  },
  {
    id: 5,
    type: 'approval',
    title: 'درخواست مرخصی تایید شد',
    message: 'درخواست مرخصی شما برای تاریخ 15 آذر تایید شد.',
    time: '2 روز پیش',
    isRead: true,
    priority: 'medium',
  },
];

export function PersonalNotificationsWidget() {
  // Get notification icon and color
  const getNotificationInfo = (type: string, priority: string) => {
    const baseInfo = {
      announcement: {
        icon: Megaphone,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      task: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      reminder: {
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      },
      system: {
        icon: Bell,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
      approval: {
        icon: User,
        color: 'text-[#ff0a54]',
        bgColor: 'bg-[#ff0a54]/10',
        borderColor: 'border-[#ff0a54]/20',
      },
    };

    const info = baseInfo[type as keyof typeof baseInfo] || baseInfo.system;
    
    // Adjust color based on priority
    if (priority === 'high') {
      return {
        ...info,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }

    return info;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get priority text in Persian
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'بالا';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'پایین';
      default:
        return 'نامشخص';
    }
  };

  // Get type text in Persian
  const getTypeText = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'اعلان';
      case 'task':
        return 'تسک';
      case 'reminder':
        return 'یادآوری';
      case 'system':
        return 'سیستم';
      case 'approval':
        return 'تایید';
      default:
        return 'عمومی';
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#ff0a54] flex items-center gap-2">
            <Bell className="h-5 w-5" />
            اعلان‌های شخصی
            {unreadCount > 0 && (
              <Badge className="bg-[#ff0a54] text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">
            آخرین اعلان‌ها و یادآوری‌ها
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-[#ff0a54]">{unreadCount}</div>
              <div className="text-xs text-gray-500">خوانده نشده</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {mockNotifications.length - unreadCount}
              </div>
              <div className="text-xs text-gray-500">خوانده شده</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{mockNotifications.length}</div>
              <div className="text-xs text-gray-500">کل اعلان‌ها</div>
            </div>
          </motion.div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockNotifications.slice(0, 5).map((notification, index) => {
              const notificationInfo = getNotificationInfo(notification.type, notification.priority);
              const NotificationIcon = notificationInfo.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50 border-gray-200' : `${notificationInfo.bgColor} ${notificationInfo.borderColor}`
                  } hover:shadow-md transition-all duration-200 ${
                    !notification.isRead ? 'ring-2 ring-[#ff0a54]/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notificationInfo.bgColor} ${notificationInfo.borderColor} border`}>
                      <NotificationIcon className={`h-4 w-4 ${notificationInfo.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {getPriorityText(notification.priority)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                            >
                              {getTypeText(notification.type)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#ff0a54] rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            className="pt-4 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                <Bell className="h-3 w-3 ml-1" />
                همه اعلان‌ها
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                <X className="h-3 w-3 ml-1" />
                پاک کردن همه
              </Button>
            </div>
          </motion.div>

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <motion.div
              className="bg-[#ff0a54]/10 border border-[#ff0a54]/20 rounded-lg p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#ff0a54]">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {unreadCount} اعلان خوانده نشده
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  همه را خوانده کن
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
