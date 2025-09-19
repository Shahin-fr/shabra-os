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
  'ecosystem_instapulse': 'InstaPulse',
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
  'modal_instapulse_title': 'InstaPulse',
  'modal_instapulse_description': 'این ماژول برای جایگزینی فرآیند دستی و زمان‌بر تحقیق روندها ساخته شد. InstaPulse به صورت خودکار صفحات کلیدی صنعت را رصد کرده و محتوای وایرال را برای تحلیل استراتژیک به نمایش می‌گذارد.',
  'modal_instapulse_features': 'جمع‌آوری خودکار روزانه داده‌ها,داشبورد تحلیلی محتوای وایرال,معماری Decoupled برای پایداری بالا,استراتژی محتوا بر اساس داده',
  
  'modal_storyboard_title': 'Storyboard',
  'modal_storyboard_description': 'این ابزار بصری برای حل مشکل استوری‌های بدون ساختار و ناهماهنگ ایجاد شد. تیم می‌تواند به صورت مشترک سناریوهای محتوایی روزانه را برنامه‌ریزی کرده و از هماهنگی برند و افزایش تعامل اطمینان حاصل کند.',
  'modal_storyboard_features': 'رابط کاربری کشیدن و رها کردن (Drag & Drop),قالب‌های آماده برای کمپین‌ها,برنامه‌ریزی مشترک تیمی,کاهش وابستگی به مدیران',
  
  'modal_task_management_title': 'Task Management',
  'modal_task_management_description': 'این ماژول تمام وظایف و پروژه‌های تیم را متمرکز می‌کند. این سیستم به عنوان یک منبع حقیقت واحد برای وضعیت پروژه‌ها، ددلاین‌ها و مسئولیت‌ها عمل کرده و شفافیت و کارایی گردش کار را بهبود می‌بخشد.',
  'modal_task_management_features': 'نمای Kanban Board,تخصیص وظیفه و تعیین ددلاین,رهگیری پیشرفت پروژه,به‌روزرسانی UI برای تجربه کاربری روان',
  
  'modal_wiki_title': 'ShabraLog (Knowledge Base)',
  'modal_wiki_description': 'ShabraLog serves as the central repository for all organizational knowledge, processes, and documentation. It eliminates the need for scattered note-taking tools and ensures that critical information is always accessible and up-to-date.',
  'modal_wiki_features': 'Centralized Documentation,Search & Discovery,Version Control,Team Collaboration',
  
  'modal_hr_title': 'Human Resources',
  'modal_hr_description': 'The HR module streamlines personnel management and attendance tracking, replacing manual processes with an automated system. It provides insights into team productivity and helps maintain accurate records.',
  'modal_hr_features': 'Attendance Tracking,Performance Monitoring,Leave Management,Team Analytics',

  // Enhanced Roadmap Content
  'roadmap_phase1_features': 'Performance optimization and code refactoring,Advanced UI/UX improvements with micro-interactions,Comprehensive bug fixes and stability enhancements,Core feature refinement based on user feedback',
  'roadmap_phase2_features': 'Advanced analytics dashboard with real-time insights,Third-party API integrations (Instagram, Google Analytics),Enhanced mobile responsiveness and PWA features,Advanced collaboration tools with real-time updates',
  'roadmap_phase3_features': 'Enterprise-grade security and compliance features,Advanced third-party integrations and webhooks,AI-powered automation and smart recommendations,Horizontal scaling and microservices architecture',
};

/**
 * Translation function - placeholder for real i18n library
 * @param key - Translation key
 * @returns Translated string or key if not found
 */
export const t = (key: string): string => {
  return translations[key] || key;
};
