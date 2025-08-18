"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock } from 'lucide-react';

const activities = [
  {
    id: 1,
    message: "پروژه 'توسعه وب سایت' به‌روزرسانی شد",
    time: "2 دقیقه پیش",
    type: "project"
  },
  {
    id: 2,
    message: "وظیفه جدیدی به شما محول شد",
    time: "15 دقیقه پیش",
    type: "task"
  },
  {
    id: 3,
    message: "استوری جدید در استوری‌بورد ایجاد شد",
    time: "1 ساعت پیش",
    type: "story"
  },
  {
    id: 4,
    message: "گزارش تحلیل ماهانه آماده شد",
    time: "2 ساعت پیش",
    type: "analytics"
  },
  {
    id: 5,
    message: "عضو جدید به تیم اضافه شد",
    time: "3 ساعت پیش",
    type: "team"
  }
];

export function RecentActivity() {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-[#ff0a54]" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              فعالیت‌های اخیر
            </CardTitle>
            <p className="text-sm text-gray-600">آخرین به‌روزرسانی‌ها</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-48 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
              <div className="w-2 h-2 bg-[#ff0a54] rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
