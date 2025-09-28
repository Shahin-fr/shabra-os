'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Play, Download } from 'lucide-react';
import { DemoForm } from '@/components/landing/ui/DemoForm';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ش</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">شبرا OS</span>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              بازگشت
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                درخواست
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {' '}دموی رایگان
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                همین امروز دموی رایگان شبرا OS را مشاهده کنید و ببینید چگونه می‌تواند 
                کسب‌وکار شما را متحول کند.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-gray-700">دموی رایگان 14 روزه بدون تعهد</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-gray-700">پشتیبانی کامل در طول دمو</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-gray-700">راه‌اندازی و آموزش رایگان</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-gray-700">دسترسی به تمام ویژگی‌ها</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="ms-2 w-5 h-5" />
                تماشای ویدیو دمو
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              >
                <Download className="ms-2 w-5 h-5" />
                دانلود بروشور
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-4">مورد اعتماد بیش از 500 شرکت:</p>
              <div className="flex items-center gap-6 opacity-60">
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Logo 1</span>
                </div>
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Logo 2</span>
                </div>
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Logo 3</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                اطلاعات تماس خود را وارد کنید
              </h2>
              <p className="text-gray-600">
                تیم ما در کمتر از 24 ساعت با شما تماس خواهد گرفت
              </p>
            </div>

            <DemoForm />
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            چه چیزی در دمو دریافت می‌کنید؟
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">دموی زنده</h4>
              <p className="text-gray-600">
                دسترسی کامل به تمام ویژگی‌های شبرا OS برای 14 روز
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">راه‌اندازی رایگان</h4>
              <p className="text-gray-600">
                تیم ما سیستم را برای شما راه‌اندازی و پیکربندی می‌کند
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="rtl:rotate-180 w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">پشتیبانی کامل</h4>
              <p className="text-gray-600">
                پشتیبانی 24/7 در طول دوره دمو و آموزش کامل تیم شما
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
