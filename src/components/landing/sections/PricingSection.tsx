'use client';

import { motion } from 'framer-motion';
import { PricingCard, PricingCardProps } from '../ui/PricingCard';

const pricingPlans: PricingCardProps[] = [
  {
    name: 'استارتر',
    price: '2,500,000',
    period: 'ماهانه',
    description: 'مناسب برای کسب‌وکارهای کوچک',
    features: [
      'تا 10 کاربر',
      '5 پروژه همزمان',
      'گزارش‌گیری پایه',
      'پشتیبانی ایمیل',
      'ذخیره‌سازی 10GB',
      'دسترسی موبایل'
    ],
    limitations: [
      'گزارش‌گیری پیشرفته',
      'یکپارچه‌سازی API',
      'پشتیبانی تلفنی'
    ],
    color: 'blue' as const,
    popular: false,
    cta: 'شروع رایگان'
  },
  {
    name: 'پروفشنال',
    price: '4,500,000',
    period: 'ماهانه',
    description: 'محبوب‌ترین انتخاب برای کسب‌وکارهای متوسط',
    features: [
      'تا 50 کاربر',
      'پروژه‌های نامحدود',
      'گزارش‌گیری پیشرفته',
      'پشتیبانی تلفنی',
      'ذخیره‌سازی 100GB',
      'دسترسی موبایل',
      'یکپارچه‌سازی API',
      'داشبوردهای سفارشی',
      'پشتیبانی اولویت‌دار'
    ],
    limitations: [],
    color: 'purple' as const,
    popular: true,
    cta: 'شروع دمو'
  },
  {
    name: 'انترپرایز',
    price: '8,500,000',
    period: 'ماهانه',
    description: 'راه‌حل کامل برای سازمان‌های بزرگ',
    features: [
      'کاربران نامحدود',
      'پروژه‌های نامحدود',
      'گزارش‌گیری پیشرفته',
      'پشتیبانی 24/7',
      'ذخیره‌سازی نامحدود',
      'دسترسی موبایل',
      'یکپارچه‌سازی API',
      'داشبوردهای سفارشی',
      'پشتیبانی اولویت‌دار',
      'مدیر امنیت اختصاصی',
      'سفارشی‌سازی کامل',
      'آموزش تخصصی'
    ],
    limitations: [],
    color: 'green' as const,
    popular: false,
    cta: 'تماس با فروش'
  }
];

export function PricingSection() {
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
          قیمت‌گذاری شفاف و منصفانه
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          پلن مناسب کسب‌وکار خود را انتخاب کنید. همه پلن‌ها شامل دموی رایگان 14 روزه هستند
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <PricingCard {...plan} />
          </motion.div>
        ))}
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            سوالی دارید؟
          </h3>
          <p className="text-gray-600 mb-6">
            تیم فروش ما آماده پاسخگویی به سوالات شما و ارائه مشاوره رایگان است
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              تماس با فروش
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
            >
              سوالات متداول
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
