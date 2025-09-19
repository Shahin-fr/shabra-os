'use client';

import { motion } from 'framer-motion';
import { FeatureCard, FeatureCardProps } from '../ui/FeatureCard';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Shield,
  Smartphone
} from 'lucide-react';

const features: FeatureCardProps[] = [
  {
    icon: BarChart3,
    title: 'مدیریت پروژه و وظایف یکپارچه',
    description: 'سیستم مدیریت پروژه پیشرفته با قابلیت‌های Kanban، Gantt Chart و گزارش‌گیری آنی',
    color: 'blue',
    benefits: ['مدیریت تسک‌ها', 'گزارش‌گیری پیشرفته', 'همکاری تیمی']
  },
  {
    icon: Zap,
    title: 'اتوماسیون فرآیندهای مالی و حسابداری',
    description: 'سیستم حسابداری هوشمند با قابلیت‌های خودکارسازی و یکپارچه‌سازی با بانک‌ها',
    color: 'purple',
    benefits: ['صورت‌های مالی', 'پردازش خودکار', 'یکپارچه‌سازی بانکی']
  },
  {
    icon: BarChart3,
    title: 'داشبورد گزارش‌گیری هوشمند و آنی',
    description: 'داشبوردهای تعاملی با قابلیت‌های BI پیشرفته و گزارش‌گیری در زمان واقعی',
    color: 'green',
    benefits: ['تحلیل داده‌ها', 'گزارش‌های تعاملی', 'هشدارهای هوشمند']
  },
  {
    icon: Users,
    title: 'مدیریت منابع انسانی',
    description: 'سیستم جامع HR با قابلیت‌های حضور و غیاب، حقوق و دستمزد و ارزیابی عملکرد',
    color: 'orange',
    benefits: ['حضور و غیاب', 'حقوق و دستمزد', 'ارزیابی عملکرد']
  },
  {
    icon: Smartphone,
    title: 'دسترسی موبایل و ابری',
    description: 'دسترسی کامل از هر مکان و هر زمان با اپلیکیشن موبایل و سرویس ابری امن',
    color: 'indigo',
    benefits: ['اپ موبایل', 'سرویس ابری', 'دسترسی 24/7']
  },
  {
    icon: Shield,
    title: 'امنیت و حریم خصوصی',
    description: 'بالاترین استانداردهای امنیتی با رمزگذاری end-to-end و کنترل دسترسی پیشرفته',
    color: 'red',
    benefits: ['رمزگذاری پیشرفته', 'کنترل دسترسی', 'امنیت داده‌ها']
  }
];

export function FeaturesSection() {
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
          ویژگی‌های پیشرفته شبرا OS
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          مجموعه‌ای کامل از ابزارهای مدیریتی که کسب‌وکار شما را به سطح جدیدی از کارایی می‌رساند
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <FeatureCard {...feature} />
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
        <p className="text-gray-600 mb-6">
          و بسیاری از ویژگی‌های دیگر که کسب‌وکار شما را متحول می‌کند
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
        >
          مشاهده تمام ویژگی‌ها
        </motion.button>
      </motion.div>
    </div>
  );
}
