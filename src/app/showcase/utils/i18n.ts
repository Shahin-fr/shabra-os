/**
 * i18n Utility for Shabra OS Showcase
 * 
 * This is a placeholder implementation that prepares the codebase
 * for easy integration with a real i18n library like next-intl.
 * All text content is centralized here for easy translation management.
 */

const translations: { [key: string]: string } = {
  // Hero Section
  'hero_brand_name': 'Shabra OS',
  'hero_title': 'سیستم‌عامل داخلی برای مدیریت یکپارچه کسب‌وکار',
  'hero_subtitle': 'طراحی شده برای جایگزینی ابزارهای پراکنده و متمرکز کردن مدیریت پروژه، برنامه‌ریزی محتوا، و دانش سازمانی در یک پلتفرم واحد',
  'hero_visual_placeholder': 'Product Visual Placeholder',
  
  // Problem Section
  'problem_title': 'عملیات پراکنده، چالش هر روز ما بود',
  'problem_description': 'تیم ما برای انجام کارهای روزمره، دائماً بین پلتفرم‌های مختلف جابجا می‌شد. این پراکندگی باعث اتلاف وقت، افزایش خطا و عدم هماهنگی می‌شد',
  
  // Ecosystem Section
  'ecosystem_title': 'یک اکوسیستم از ماژول‌های هدفمند',
  'ecosystem_task_management': 'مدیریت وظایف و پروژه‌ها',
  'ecosystem_task_management_desc': 'سیستم جامع مدیریت وظایف با قابلیت‌های پیشرفته پروژه‌ریزی',
  'ecosystem_storyboard': 'استوری‌بورد',
  'ecosystem_storyboard_desc': 'ابزار حرفه‌ای برای برنامه‌ریزی و تولید محتوای بصری',
  'ecosystem_instapulse': 'اینستاپالس',
  'ecosystem_instapulse_desc': 'پلتفرم تولید محتوای خودکار با معماری Decoupled',
  'ecosystem_instapulse_badge': 'Key Module',
  'ecosystem_wiki': 'شبرالوگ (پایگاه دانش)',
  'ecosystem_wiki_desc': 'سیستم مدیریت دانش و مستندات سازمانی',
  'ecosystem_hr': 'منابع انسانی',
  'ecosystem_hr_desc': 'ابزارهای مدیریت پرسنل و حضور و غیاب',
  
  // Tech Stack Section
  'tech_title': 'تکنولوژی‌های استفاده شده',
  
  // Roadmap Section
  'roadmap_title': 'نقشه راه فنی و چشم‌انداز آینده',
  'roadmap_phase1_title': 'Phase 1: Stability & Optimal UX',
  'roadmap_phase1_desc': 'تثبیت عملکرد و بهبود تجربه کاربری',
  'roadmap_phase2_title': 'Phase 2: Advanced Features',
  'roadmap_phase2_desc': 'افزودن قابلیت‌های پیشرفته و ماژول‌های جدید',
  'roadmap_phase3_title': 'Phase 3: Scale & Integration',
  'roadmap_phase3_desc': 'مقیاس‌پذیری و یکپارچه‌سازی با سیستم‌های خارجی',
  
  // About Section
  'about_title': 'ساخته شده توسط یک نفر، برای حل یک مشکل واقعی',
  'about_description': 'من شاهین فرهمند، یک محصول‌ساز (Product Builder) هستم که به حل مشکلات واقعی کسب‌وکار از طریق تکنولوژی علاقه دارم. Shabra OS سفر من در تبدیل چالش‌های روزمره به یک راه‌حل نرم‌افزاری یکپارچه است. این پروژه نمایانگر رویکرد من به توسعه محصول است: شناسایی دقیق مشکل، معماری هوشمندانه، و اجرای سریع با ابزارهای مدرن.',
  'about_cta': 'مشاهده رزومه',
  'about_github': 'GitHub',
  'about_linkedin': 'LinkedIn',
  'about_portfolio': 'Portfolio',

  // Modal Content
  'modal_instapulse_title': 'اینستاپالس',
  'modal_instapulse_description': 'این ماژول برای جایگزینی فرآیند دستی و زمان‌بر تحقیق روندها ساخته شد. اینستاپالس به صورت خودکار صفحات کلیدی صنعت را رصد کرده و محتوای وایرال را برای تحلیل استراتژیک به نمایش می‌گذارد.',
  'modal_instapulse_features': 'جمع‌آوری خودکار روزانه داده‌ها,داشبورد تحلیلی محتوای وایرال,معماری مستقل برای پایداری بالا,استراتژی محتوا بر اساس داده',
  
  'modal_storyboard_title': 'استوری‌بورد',
  'modal_storyboard_description': 'این ابزار بصری برای حل مشکل استوری‌های بدون ساختار و ناهماهنگ ایجاد شد. تیم می‌تواند به صورت مشترک سناریوهای محتوایی روزانه را برنامه‌ریزی کرده و از هماهنگی برند و افزایش تعامل اطمینان حاصل کند.',
  'modal_storyboard_features': 'رابط کاربری کشیدن و رها کردن,قالب‌های آماده برای کمپین‌ها,برنامه‌ریزی مشترک تیمی,کاهش وابستگی به مدیران',
  
  'modal_task_management_title': 'مدیریت وظایف',
  'modal_task_management_description': 'این ماژول تمام وظایف و پروژه‌های تیم را متمرکز می‌کند. این سیستم به عنوان یک منبع حقیقت واحد برای وضعیت پروژه‌ها، ددلاین‌ها و مسئولیت‌ها عمل کرده و شفافیت و کارایی گردش کار را بهبود می‌بخشد.',
  'modal_task_management_features': 'نمای کانبان,تخصیص وظیفه و تعیین ددلاین,رهگیری پیشرفت پروژه,بهبود تجربه کاربری',
  
  'modal_wiki_title': 'شیرالوگ (پایگاه دانش)',
  'modal_wiki_description': 'شیرالوگ به عنوان مخزن مرکزی برای تمام دانش سازمانی، فرآیندها و مستندات عمل می‌کند. این ماژول نیاز به ابزارهای یادداشت‌برداری پراکنده را از بین می‌برد و تضمین می‌کند که اطلاعات حیاتی همیشه در دسترس و به‌روز هستند.',
  'modal_wiki_features': 'مستندات متمرکز,جستجو و کشف,کنترل نسخه,همکاری تیمی',
  
  'modal_hr_title': 'منابع انسانی',
  'modal_hr_description': 'ماژول منابع انسانی مدیریت پرسنل و ردیابی حضور را ساده‌سازی می‌کند و فرآیندهای دستی را با یک سیستم خودکار جایگزین می‌کند. این ماژول بینش‌هایی در مورد بهره‌وری تیم ارائه می‌دهد و به حفظ سوابق دقیق کمک می‌کند.',
  'modal_hr_features': 'ردیابی حضور,نظارت بر عملکرد,مدیریت مرخصی,تحلیل تیمی',

  // Enhanced Roadmap Content
  'roadmap_phase1_features': 'بهینه‌سازی عملکرد و بازسازی کد,بهبودهای پیشرفته UI/UX با تعاملات ریز,رفع باگ‌های جامع و بهبودهای پایداری,پالایش ویژگی‌های اصلی بر اساس بازخورد کاربران',
  'roadmap_phase2_features': 'داشبورد تحلیلی پیشرفته با بینش‌های بلادرنگ,یکپارچه‌سازی API های شخص ثالث (اینستاگرام، Google Analytics),پاسخگویی موبایل بهبود یافته و ویژگی‌های PWA,ابزارهای همکاری پیشرفته با به‌روزرسانی‌های بلادرنگ',
  'roadmap_phase3_features': 'ویژگی‌های امنیتی و انطباق در سطح سازمانی,یکپارچه‌سازی‌های پیشرفته شخص ثالث و وب‌هوک‌ها,خودکارسازی مبتنی بر هوش مصنوعی و توصیه‌های هوشمند,مقیاس‌پذیری افقی و معماری میکروسرویس‌ها',
};

/**
 * Translation function - placeholder for real i18n library
 * @param key - Translation key
 * @returns Translated string or key if not found
 */
export const t = (key: string): string => {
  return translations[key] || key;
};
