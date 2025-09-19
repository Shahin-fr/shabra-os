'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Shield, 
  Zap 
} from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: 'افزایش 50% بازدهی',
    description: 'با اتوماسیون فرآیندها و مدیریت یکپارچه، بازدهی تیم شما تا 50% افزایش می‌یابد',
    stat: '+50%',
    color: 'green'
  },
  {
    icon: Clock,
    title: 'صرفه‌جویی 30 ساعت در هفته',
    description: 'کاهش زمان‌های تکراری و خودکارسازی وظایف روزانه',
    stat: '30h',
    color: 'blue'
  },
  {
    icon: DollarSign,
    title: 'کاهش 40% هزینه‌های عملیاتی',
    description: 'بهینه‌سازی فرآیندها و کاهش هزینه‌های غیرضروری',
    stat: '-40%',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'بهبود 90% همکاری تیمی',
    description: 'ابزارهای ارتباطی و مدیریت پروژه پیشرفته',
    stat: '90%',
    color: 'orange'
  },
  {
    icon: Shield,
    title: 'امنیت 100% داده‌ها',
    description: 'محافظت کامل از اطلاعات حساس کسب‌وکار شما',
    stat: '100%',
    color: 'red'
  },
  {
    icon: Zap,
    title: 'پاسخ‌دهی 99.9%',
    description: 'سرویس ابری با بالاترین سطح دسترسی و پایداری',
    stat: '99.9%',
    color: 'indigo'
  }
];

export function BenefitsSection() {
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
          چرا شبرا OS؟
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          نتایج قابل اندازه‌گیری که کسب‌وکار شما را متحول می‌کند
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* Icon and Stat */}
            <div className="flex items-center justify-between mb-6">
              <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-xl flex items-center justify-center`}>
                <benefit.icon className={`w-8 h-8 text-${benefit.color}-600`} />
              </div>
              <div className={`text-3xl font-bold text-${benefit.color}-600`}>
                {benefit.stat}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {benefit.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="text-center mt-16 bg-white rounded-2xl p-8 shadow-lg"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          آماده برای شروع؟
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          همین امروز دموی رایگان شبرا OS را مشاهده کنید و ببینید چگونه می‌تواند 
          کسب‌وکار شما را متحول کند
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
        >
          شروع دموی رایگان
        </motion.button>
      </motion.div>
    </div>
  );
}
