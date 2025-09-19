'use client';

import { motion } from 'framer-motion';
import { TestimonialCard } from '../ui/TestimonialCard';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'احمد محمدی',
    position: 'مدیرعامل شرکت فناوری پارس',
    company: 'پارس تک',
    content: 'شبرا OS واقعاً زندگی ما را تغییر داد. از زمان استفاده از این سیستم، بازدهی تیم ما 60% افزایش یافته و مدیریت پروژه‌ها بسیار آسان‌تر شده است.',
    rating: 5,
    avatar: '/images/avatars/ahmad.jpg'
  },
  {
    name: 'فاطمه احمدی',
    position: 'مدیر مالی شرکت صنعتی کاوه',
    company: 'صنعتی کاوه',
    content: 'سیستم حسابداری شبرا OS فوق‌العاده است. تمام فرآیندهای مالی ما خودکار شده و خطاهای انسانی به صفر رسیده است.',
    rating: 5,
    avatar: '/images/avatars/fateme.jpg'
  },
  {
    name: 'علی رضایی',
    position: 'مدیر پروژه شرکت ساختمانی آسمان',
    company: 'ساختمانی آسمان',
    content: 'با داشبوردهای تعاملی شبرا OS، می‌توانم تمام پروژه‌ها را در یک نگاه مدیریت کنم. گزارش‌گیری آنی واقعاً عالی است.',
    rating: 5,
    avatar: '/images/avatars/ali.jpg'
  },
  {
    name: 'مریم کریمی',
    position: 'مدیر منابع انسانی گروه تجاری نور',
    company: 'گروه تجاری نور',
    content: 'مدیریت منابع انسانی با شبرا OS بسیار ساده شده است. حضور و غیاب، حقوق و دستمزد و ارزیابی عملکرد همه در یک جا.',
    rating: 5,
    avatar: '/images/avatars/maryam.jpg'
  },
  {
    name: 'حسن نوری',
    position: 'مدیرعامل شرکت بازرگانی سپهر',
    company: 'بازرگانی سپهر',
    content: 'امنیت داده‌ها در شبرا OS واقعاً قابل اعتماد است. با خیال راحت تمام اطلاعات حساس کسب‌وکارمان را در این سیستم نگهداری می‌کنیم.',
    rating: 5,
    avatar: '/images/avatars/hassan.jpg'
  },
  {
    name: 'زهرا صادقی',
    position: 'مدیر عملیات شرکت خدماتی آرام',
    company: 'خدماتی آرام',
    content: 'پشتیبانی 24/7 شبرا OS واقعاً عالی است. هر زمان که مشکلی داشتیم، تیم پشتیبانی سریع پاسخ دادند و مشکل را حل کردند.',
    rating: 5,
    avatar: '/images/avatars/zahra.jpg'
  }
];

export function TestimonialsSection() {
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
          نظر مشتریان ما
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          بیش از 500 شرکت موفق از شبرا OS استفاده می‌کنند و نتایج فوق‌العاده‌ای کسب کرده‌اند
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
          <div className="text-gray-600">شرکت موفق</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">99%</div>
          <div className="text-gray-600">رضایت مشتریان</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
          <div className="text-gray-600">پشتیبانی</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">5 سال</div>
          <div className="text-gray-600">تجربه</div>
        </div>
      </motion.div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <TestimonialCard {...testimonial} />
          </motion.div>
        ))}
      </div>

      {/* Bottom Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
          <Quote className="w-12 h-12 text-blue-600 mx-auto mb-6" />
          <blockquote className="text-xl text-gray-700 italic mb-6">
            "شبرا OS نه تنها یک نرم‌افزار، بلکه یک شریک استراتژیک برای رشد کسب‌وکار ما بوده است. 
            توصیه می‌کنم هر کسب‌وکاری که به دنبال تحول دیجیتال است، از این سیستم استفاده کند."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              ش
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">شهریار احمدی</div>
              <div className="text-gray-600">مدیرعامل گروه صنعتی پارس</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
