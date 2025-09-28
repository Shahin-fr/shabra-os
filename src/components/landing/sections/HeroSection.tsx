'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export function HeroSection() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>راه‌حل پیشرفته مدیریت کسب‌وکار</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
          >
            یکپارچه‌سازی تمام فرآیندهای
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}کسب‌وکار شما
            </span>
            <br />
            در یک پلتفرم هوشمند
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl"
          >
            شبرا OS یک سیستم عامل جامع کسب‌وکار است که تمام نیازهای مدیریتی، مالی و عملیاتی 
            سازمان شما را در یک پلتفرم یکپارچه و هوشمند ارائه می‌دهد.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid grid-cols-3 gap-8 py-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                <AnimatedCounter end={500} duration={2} />
                <span className="text-lg">+</span>
              </div>
              <div className="text-sm text-gray-600">شرکت موفق</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                <AnimatedCounter end={99} duration={2} />
                <span className="text-lg">%</span>
              </div>
              <div className="text-sm text-gray-600">رضایت مشتریان</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                <AnimatedCounter end={50} duration={2} />
                <span className="text-lg">%</span>
              </div>
              <div className="text-sm text-gray-600">صرفه‌جویی در زمان</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              درخواست دمو رایگان
              <ArrowLeft className="rtl:rotate-180 me-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              <Play className="ms-2 w-5 h-5" />
              تماشای ویدیو
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="pt-8"
          >
            <p className="text-sm text-gray-500 mb-4">مورد اعتماد شرکت‌های پیشرو:</p>
            <div className="flex items-center gap-8 opacity-60">
              {/* Placeholder for company logos */}
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
          </motion.div>
        </motion.div>

        {/* Right Column - Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Main Dashboard Mockup */}
          <Card className="relative shadow-2xl">
            <CardContent className="p-6">
              {/* Mockup Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                  <span className="font-semibold text-gray-800">شبرا OS</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">پروژه‌ها</span>
                  </div>
                  <div className="h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">تسک‌ها</span>
                  </div>
                  <div className="h-20 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">گزارش‌ها</span>
                  </div>
                  <div className="h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">تیم</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -end-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+25%</div>
              <div className="text-xs text-gray-600">بازدهی</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -start-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">-40%</div>
              <div className="text-xs text-gray-600">هزینه</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
