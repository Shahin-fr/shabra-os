'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, CheckCircle, Plus, MessageSquare, Calendar, FileText, AlertCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const activityData = [
  {
    id: 1,
    type: 'task_completed',
    user: 'احمد محمدی',
    action: 'تکمیل تسک',
    fullAction: 'تسک "طراحی صفحه اصلی" را تکمیل کرد',
    time: '5 دقیقه پیش',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20'
  },
  {
    id: 2,
    type: 'task_created',
    user: 'فاطمه احمدی',
    action: 'ایجاد تسک',
    fullAction: 'تسک جدید "بهینه‌سازی UI" ایجاد کرد',
    time: '15 دقیقه پیش',
    icon: Plus,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20'
  },
  {
    id: 3,
    type: 'comment',
    user: 'علی رضایی',
    action: 'نظر جدید',
    fullAction: 'نظری روی پروژه "وب‌سایت جدید" گذاشت',
    time: '30 دقیقه پیش',
    icon: MessageSquare,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20'
  },
  {
    id: 4,
    type: 'meeting',
    user: 'مریم حسینی',
    action: 'برنامه‌ریزی جلسه',
    fullAction: 'جلسه "بررسی عملکرد ماهانه" را برنامه‌ریزی کرد',
    time: '1 ساعت پیش',
    icon: Calendar,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20'
  },
  {
    id: 5,
    type: 'document',
    user: 'حسن کریمی',
    action: 'آپلود فایل',
    fullAction: 'فایل "گزارش هفتگی" را آپلود کرد',
    time: '2 ساعت پیش',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20'
  }
];

export function RecentTeamActivityFeed() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getActionTypeText = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'تکمیل تسک';
      case 'task_created':
        return 'ایجاد تسک';
      case 'comment':
        return 'نظر جدید';
      case 'meeting':
        return 'برنامه‌ریزی جلسه';
      case 'document':
        return 'آپلود فایل';
      default:
        return 'فعالیت';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-full"
    >
      <Card className="h-full bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#ff0a54]" />
            فعالیت‌های اخیر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activityData.map((item, index) => {
            const IconComponent = item.icon;
            const isExpanded = expandedItems.includes(item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Collapsed View - Always Visible */}
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full p-4 text-right hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.bgColor}`}>
                        <IconComponent className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getActionTypeText(item.type)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {item.time}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>
                </button>

                {/* Expanded View - Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700">
                            {item.fullAction}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-xs ${item.color} ${item.bgColor} border-0`}
                            >
                              {getActionTypeText(item.type)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-4 border-t border-gray-200"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              مشاهده همه فعالیت‌ها
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}