'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import { DemoForm } from '../ui/DemoForm';

export function CTASection() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            آماده برای
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              تحول کسب‌وکار
            </span>
            خود هستید؟
          </h2>
          
          <p className="text-xl text-blue-100 leading-relaxed">
            همین امروز دموی رایگان شبرا OS را مشاهده کنید و ببینید چگونه می‌تواند 
            کسب‌وکار شما را به سطح جدیدی از کارایی برساند.
          </p>

          {/* Benefits List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>دموی رایگان 14 روزه بدون تعهد</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>پشتیبانی کامل در طول دمو</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span>راه‌اندازی و آموزش رایگان</span>
            </div>
          </div>

          {/* Contact Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Phone className="ms-2 w-5 h-5" />
              تماس تلفنی
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              <MessageCircle className="ms-2 w-5 h-5" />
              چت آنلاین
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-blue-400">
            <p className="text-blue-200 text-sm mb-4">مورد اعتماد بیش از 500 شرکت:</p>
            <div className="flex items-center gap-6 opacity-80">
              <div className="w-20 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-xs text-gray-600">Logo 1</span>
              </div>
              <div className="w-20 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-xs text-gray-600">Logo 2</span>
              </div>
              <div className="w-20 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-xs text-gray-600">Logo 3</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              درخواست دموی رایگان
            </h3>
            <p className="text-gray-600">
              اطلاعات خود را وارد کنید تا تیم ما با شما تماس بگیرد
            </p>
          </div>

          <DemoForm />
        </motion.div>
      </div>
    </div>
  );
}
