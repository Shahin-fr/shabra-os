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
  'ecosystem_task_management_desc': 'یک بورد کانبان ساده برای مدیریت یکپارچه وظایف و پروژه‌ها.',
  'ecosystem_task_management_long_desc': 'برای رسیدن به یکپارچگی، وجود یک سیستم مدیریت وظیفه ضروری بود. این ماژول قابلیت‌های اصلی مثل ساختن تسک، تعیین ددلاین و تخصیص وظایف رو در یک بورد کانبان ساده فراهم می‌کنه. هدف، ساختن یک راه حل داخلی و کاملاً یکپارچه با بقیه سیستم بود.',
  'ecosystem_task_management_features': 'نمای کانبان با قابلیت Drag & Drop,تخصیص وظایف به اعضای تیم,تعیین ددلاین برای تسک‌ها',
  
  'ecosystem_storyboard': 'استوری‌بورد',
  'ecosystem_storyboard_desc': 'ابزاری برای برنامه‌ریزی بصری محتوای داستانی تیم.',
  'ecosystem_storyboard_long_desc': 'ابزاری تخصصی برای برنامه‌ریزی بصری محتوای داستانی (Story-driven content). این ماژول به تیم اجازه می‌ده تا با یک رابط کاربری ساده، ایده‌ها و مراحل مختلف یک روایت رو قبل از اجرا، سازماندهی و مرور کنن.',
  'ecosystem_storyboard_features': 'سازماندهی بصری مراحل روایت,انتخاب از بین انواع استوری تعریف شده,ایجاد و ویرایش کارت‌های ایده',
  
  'ecosystem_instapulse': 'اینستاپالس',
  'ecosystem_instapulse_desc': 'داشبوردی برای رصد خودکار محتوای وایرال در اینستاگرام.',
  'ecosystem_instapulse_long_desc': 'یک داشبورد هوشمند برای خودکارسازی فرآیند پیدا کردن محتوای پربازدید (Explore). این ماژول به جای ساعت‌ها جستجوی دستی، به صورت روزانه لیستی از وایرال‌ترین پست‌ها رو در اختیار تیم قرار می‌ده تا منبع الهام سریعی برای تولید محتوا باشه.',
  'ecosystem_instapulse_features': 'رصد روزانه و خودکار پیج‌های منتخب,شناسایی پست‌های پربازدید (Explore),منبع الهام سریع برای تولید محتوا',
  'ecosystem_instapulse_badge': 'Key Module',
  
  'ecosystem_wiki': 'پایگاه دانش',
  'ecosystem_wiki_desc': 'یک فضای متمرکز برای دانش و مستندات تیم.',
  'ecosystem_wiki_long_desc': 'یک فضای متمرکز برای تمام دانش و مستندات تیم. این بخش، زیرساخت اصلی برای جمع‌آوری کانتکست کاریه؛ همون اطلاعات پایه‌ای که در آینده، هوش مصنوعی سیستم برای دادن پاسخ‌های هوشمندانه بهش نیاز خواهد داشت.',
  'ecosystem_wiki_features': 'ساختار درختی برای سازماندهی محتوا,قابلیت آپلود و مشاهده فایل (PDF و Markdown),جستجوی سریع در تمام اسناد',
  
  'ecosystem_hr': 'منابع انسانی',
  'ecosystem_hr_desc': 'ماژولی جامع برای مدیریت فرآیندهای داخلی تیم.',
  'ecosystem_hr_long_desc': 'یک ماژول جامع برای مدیریت فرآیندهای داخلی تیم. این بخش قابلیت‌های متنوعی از جمله سیستم ثبت حضور و غیاب، فرآیند کامل درخواست و تایید مرخصی، و مدیریت اطلاعات کارمندان رو به صورت یکپارچه ارائه می‌ده.',
  'ecosystem_hr_features': 'سیستم ثبت ورود و خروج (Attendance),فرآیند کامل درخواست و تایید مرخصی,مدیریت اطلاعات و پروفایل کارمندان',
  
  // Tech Stack Section
  'tech_title': 'تکنولوژی‌های استفاده شده',
  
  // Roadmap Section
  'roadmap_title': 'نقشه راه و چشم‌انداز آینده',
  'roadmap_phase1_title': 'Phase 1: The Comprehensive Foundation',
  'roadmap_phase1_desc': 'رسیدن به یک اکوسیستم داخلی کامل، پایدار و یکپارچه. این فاز شامل تکمیل تمام ماژول‌های کلیدی همکاری، بهینه‌سازی عملکرد و تضمین امنیت پلتفرم است.',
  'roadmap_phase2_title': 'Phase 2: The Insight Engine',
  'roadmap_phase2_desc': 'تبدیل شدن شبرا OS از یک ابزار ثبت داده به یک موتور تولید بینش. در این مرحله، هوش مصنوعی برای درک عمیق کانتکست کاری و ارائه تحلیل‌های هوشمند به هسته سیستم اضافه می‌شود.',
  'roadmap_phase3_title': 'Phase 3: The Autonomous Workspace',
  'roadmap_phase3_desc': 'تکامل به یک پلتفرم کنش‌گرا که فرآیندها را خودکار می‌کند و به صورت فعالانه در کنار تیم کار می‌کند. در این فاز، پتانسیل تجاری‌سازی محصول نیز به طور جدی بررسی خواهد شد.',
  
  // About Section
  'about_title': 'ساخته شده توسط یک نفر، برای حل یک مشکل واقعی',
  'about_description': 'من شاهین فرهمند، یک محصول‌ساز (Product Builder) هستم که به حل مشکلات واقعی کسب‌وکار از طریق تکنولوژی علاقه دارم. Shabra OS سفر من در تبدیل چالش‌های روزمره به یک راه‌حل نرم‌افزاری یکپارچه است. این پروژه نمایانگر رویکرد من به توسعه محصول است: شناسایی دقیق مشکل، معماری هوشمندانه، و اجرای سریع با ابزارهای مدرن.',
  'about_cta': 'مشاهده رزومه',
  'about_github': 'GitHub',
  'about_linkedin': 'LinkedIn',
  'about_portfolio': 'Portfolio',

  // Modal Content
  'modal_task_management_title': 'مدیریت وظایف و پروژه‌ها',
  'modal_task_management_description': 'برای رسیدن به یکپارچگی، وجود یک سیستم مدیریت وظیفه ضروری بود. این ماژول قابلیت‌های اصلی مثل ساختن تسک، تعیین ددلاین و تخصیص وظایف رو در یک بورد کانبان ساده فراهم می‌کنه. هدف، ساختن یک راه حل داخلی و کاملاً یکپارچه با بقیه سیستم بود.',
  'modal_task_management_features': 'نمای کانبان با قابلیت Drag & Drop,تخصیص وظایف به اعضای تیم,تعیین ددلاین برای تسک‌ها',
  
  'modal_storyboard_title': 'استوری‌بورد',
  'modal_storyboard_description': 'ابزاری تخصصی برای برنامه‌ریزی بصری محتوای داستانی (Story-driven content). این ماژول به تیم اجازه می‌ده تا با یک رابط کاربری ساده، ایده‌ها و مراحل مختلف یک روایت رو قبل از اجرا، سازماندهی و مرور کنن.',
  'modal_storyboard_features': 'سازماندهی بصری مراحل روایت,انتخاب از بین انواع استوری تعریف شده,ایجاد و ویرایش کارت‌های ایده',
  
  'modal_instapulse_title': 'اینستاپالس',
  'modal_instapulse_description': 'یک داشبورد هوشمند برای خودکارسازی فرآیند پیدا کردن محتوای پربازدید (Explore). این ماژول به جای ساعت‌ها جستجوی دستی، به صورت روزانه لیستی از وایرال‌ترین پست‌ها رو در اختیار تیم قرار می‌ده تا منبع الهام سریعی برای تولید محتوا باشه.',
  'modal_instapulse_features': 'رصد روزانه و خودکار پیج‌های منتخب,شناسایی پست‌های پربازدید (Explore),منبع الهام سریع برای تولید محتوا',
  
  'modal_wiki_title': 'پایگاه دانش',
  'modal_wiki_description': 'یک فضای متمرکز برای تمام دانش و مستندات تیم. این بخش، زیرساخت اصلی برای جمع‌آوری کانتکست کاریه؛ همون اطلاعات پایه‌ای که در آینده، هوش مصنوعی سیستم برای دادن پاسخ‌های هوشمندانه بهش نیاز خواهد داشت.',
  'modal_wiki_features': 'ساختار درختی برای سازماندهی محتوا,قابلیت آپلود و مشاهده فایل (PDF و Markdown),جستجوی سریع در تمام اسناد',
  
  'modal_hr_title': 'منابع انسانی',
  'modal_hr_description': 'یک ماژول جامع برای مدیریت فرآیندهای داخلی تیم. این بخش قابلیت‌های متنوعی از جمله سیستم ثبت حضور و غیاب، فرآیند کامل درخواست و تایید مرخصی، و مدیریت اطلاعات کارمندان رو به صورت یکپارچه ارائه می‌ده.',
  'modal_hr_features': 'سیستم ثبت ورود و خروج (Attendance),فرآیند کامل درخواست و تایید مرخصی,مدیریت اطلاعات و پروفایل کارمندان',

  // Enhanced Roadmap Content
  'roadmap_phase1_features': 'Comprehensive Collaboration Hub,Enterprise-Grade Reliability & Security,Fluid & Responsive Experience (Real-time & Offline),Intuitive & Unified Design System',
  'roadmap_phase2_features': 'Context-Aware AI Assistant,Actionable Insight Engine,Cross-Module Intelligence,Team Empowerment & Growth Platform',
  'roadmap_phase3_features': 'Autonomous Workflow Automation (via Multi-Agent System),Strategic Recommendation Engine,Generative Workspace Interface,Commercialization & SaaS Platformization',
};

/**
 * Translation function - placeholder for real i18n library
 * @param key - Translation key
 * @returns Translated string or key if not found
 */
export const t = (key: string): string => {
  return translations[key] || key;
};
