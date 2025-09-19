'use client';

import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Instagram,
  ArrowLeft
} from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'ویژگی‌ها', href: '#features' },
    { name: 'قیمت‌گذاری', href: '#pricing' },
    { name: 'دمو', href: '#cta' },
    { name: 'API', href: '#' },
    { name: 'مستندات', href: '#' }
  ],
  company: [
    { name: 'درباره ما', href: '#' },
    { name: 'تیم', href: '#' },
    { name: 'شغل‌ها', href: '#' },
    { name: 'اخبار', href: '#' },
    { name: 'تماس', href: '#' }
  ],
  support: [
    { name: 'مرکز راهنمایی', href: '#' },
    { name: 'سوالات متداول', href: '#' },
    { name: 'پشتیبانی', href: '#' },
    { name: 'وضعیت سرویس', href: '#' },
    { name: 'گزارش باگ', href: '#' }
  ],
  legal: [
    { name: 'حریم خصوصی', href: '#' },
    { name: 'شرایط استفاده', href: '#' },
    { name: 'کوکی‌ها', href: '#' },
    { name: 'مجوزها', href: '#' }
  ]
};

export function FooterSection() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ش</span>
                </div>
                <span className="text-2xl font-bold">شبرا OS</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                سیستم عامل جامع کسب‌وکار که تمام نیازهای مدیریتی، مالی و عملیاتی 
                سازمان شما را در یک پلتفرم یکپارچه و هوشمند ارائه می‌دهد.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>021-12345678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>info@shabra-os.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>تهران، خیابان ولیعصر، پلاک 123</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </motion.div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:col-span-3">
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  {category === 'product' && 'محصول'}
                  {category === 'company' && 'شرکت'}
                  {category === 'support' && 'پشتیبانی'}
                  {category === 'legal' && 'قانونی'}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">در خبرنامه ما عضو شوید</h3>
              <p className="text-gray-400">
                آخرین اخبار و به‌روزرسانی‌های شبرا OS را دریافت کنید
              </p>
            </div>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                عضویت
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">
            © 2024 شبرا OS. تمام حقوق محفوظ است.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors duration-300">
              حریم خصوصی
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              شرایط استفاده
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              کوکی‌ها
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
