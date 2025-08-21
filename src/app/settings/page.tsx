import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Settings, User, Shield, Bell, Palette, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            تنظیمات
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            پیکربندی حساب کاربری و تنظیمات سیستم
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* User Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-[#ff0a54]" />
                </div>
                پروفایل کاربری
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-[#ff0a54]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">اطلاعات شخصی</h4>
                      <p className="text-sm text-gray-600">ویرایش نام، ایمیل و اطلاعات تماس</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">تنظیمات پروفایل کاربری در اینجا قرار خواهد گرفت</p>
                </div>
                
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#ff0a54]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">امنیت</h4>
                      <p className="text-sm text-gray-600">تغییر رمز عبور و تنظیمات امنیتی</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">تنظیمات امنیتی و احراز هویت در اینجا قرار خواهد گرفت</p>
                </div>
                
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-[#ff0a54]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">اعلان‌ها</h4>
                      <p className="text-sm text-gray-600">تنظیمات اعلان‌ها و هشدارها</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">تنظیمات اعلان‌ها و هشدارهای سیستم در اینجا قرار خواهد گرفت</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-[#ff0a54]" />
                </div>
                تنظیمات سیستم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                      <Palette className="h-5 w-5 text-[#ff0a54]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">ظاهر</h4>
                      <p className="text-sm text-gray-600">تنظیمات تم و رابط کاربری</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">تنظیمات ظاهر و تم سیستم در اینجا قرار خواهد گرفت</p>
                </div>
                
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-[#ff0a54]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">داده‌ها</h4>
                      <p className="text-sm text-gray-600">مدیریت داده‌ها و پشتیبان‌گیری</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">تنظیمات مدیریت داده‌ها و پشتیبان‌گیری در اینجا قرار خواهد گرفت</p>
                </div>
                
                <div className="p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff0a54]/20 to-[#ff0a54]/40 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-[#ff0a54]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">پیشرفته</h4>
                      <p className="text-sm text-gray-600">تنظیمات پیشرفته سیستم</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">تنظیمات پیشرفته و تخصصی سیستم در اینجا قرار خواهد گرفت</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
