import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, Clock, Users, CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            تقویم تیمی
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            برنامه‌ریزی زمانی و مدیریت رویدادهای تیم
          </p>
        </div>

        {/* Calendar Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#ff0a54]" />
              </div>
              تقویم تیمی شبرا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#ff0a54]/10 to-[#ff0a54]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-12 w-12 text-[#ff0a54]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                نمای کامل تقویم تیمی
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                نمای کامل تقویم تیمی در اینجا قرار خواهد گرفت. این بخش شامل برنامه‌ریزی رویدادها، جلسات تیمی و مدیریت زمان خواهد بود.
              </p>
              
              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="h-6 w-6 text-[#ff0a54]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">رویدادها</h4>
                  <p className="text-sm text-gray-600">مدیریت رویدادها و جلسات تیمی</p>
                </div>
                
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-[#ff0a54]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">زمان‌بندی</h4>
                  <p className="text-sm text-gray-600">برنامه‌ریزی زمانی پروژه‌ها</p>
                </div>
                
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-[#ff0a54]" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">همکاری</h4>
                  <p className="text-sm text-gray-600">هماهنگی اعضای تیم</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
