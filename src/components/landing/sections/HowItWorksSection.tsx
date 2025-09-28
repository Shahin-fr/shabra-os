'use client';

import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Settings, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'ثبت‌نام و راه‌اندازی',
    description: 'در کمتر از 5 دقیقه حساب کاربری خود را ایجاد کنید و سیستم را راه‌اندازی کنید',
    details: [
      'ایجاد حساب کاربری',
      'وارد کردن اطلاعات شرکت',
      'تنظیم اولیه سیستم',
      'آموزش سریع تیم'
    ],
    color: 'blue'
  },
  {
    step: 2,
    icon: Settings,
    title: 'پیکربندی و سفارشی‌سازی',
    description: 'سیستم را مطابق با نیازهای خاص کسب‌وکار خود تنظیم و سفارشی‌سازی کنید',
    details: [
      'تنظیم فرآیندهای کاری',
      'سفارشی‌سازی داشبوردها',
      'وارد کردن داده‌های موجود',
      'تنظیم دسترسی‌ها'
    ],
    color: 'purple'
  },
  {
    step: 3,
    icon: BarChart3,
    title: 'شروع کار و بهینه‌سازی',
    description: 'با تیم پشتیبانی ما شروع به کار کنید و به‌طور مداوم سیستم را بهینه‌سازی کنید',
    details: [
      'آموزش کامل تیم',
      'پشتیبانی 24/7',
      'بهینه‌سازی مداوم',
      'گزارش‌گیری پیشرفته'
    ],
    color: 'green'
  }
];

export function HowItWorksSection() {
  return (
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          چگونه کار می‌کند؟
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          فقط در 3 مرحله ساده، کسب‌وکار خود را به سطح جدیدی از کارایی برسانید
        </p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: true }}
            className={`flex flex-col lg:flex-row items-center gap-8 ${
              index % 2 === 1 ? 'lg:flex-row' : ''
            }`}
          >
            {/* Content */}
            <div className="flex-1 space-y-6">
              {/* Step Number and Icon */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-${step.color}-100 rounded-xl flex items-center justify-center`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                </div>
                <div className={`text-4xl font-bold text-${step.color}-600`}>
                  {step.step}
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Details List */}
              <ul className="space-y-2">
                {step.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center gap-3 text-gray-600">
                    <div className={`w-2 h-2 bg-${step.color}-500 rounded-full flex-shrink-0`}></div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="flex-1">
              <div className={`bg-gradient-to-br from-${step.color}-50 to-${step.color}-100 rounded-2xl p-8 h-80 flex items-center justify-center`}>
                <div className="text-center">
                  <step.icon className={`w-24 h-24 text-${step.color}-600 mx-auto mb-4`} />
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    مرحله {step.step}
                  </div>
                  <div className="text-gray-600">
                    {step.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow (except for last step) */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="hidden lg:block"
              >
                <ArrowRight className="rtl:rotate-180 w-8 h-8 text-gray-400" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            آماده برای شروع سفر؟
          </h3>
          <p className="text-lg mb-6 opacity-90">
            همین حالا با تیم ما تماس بگیرید و دموی رایگان شبرا OS را مشاهده کنید
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
          >
            شروع دموی رایگان
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
