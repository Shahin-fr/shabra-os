const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// دسته‌بندی‌های جدید برای ایده‌های استوری
const additionalCategories = [
  'داستان‌سرایی',
  'تعامل',
  'آموزش',
  'تجربه',
  'محصول',
  'تحلیل',
  'سفر مشتری',
  'نکات حرفه‌ای',
  'چالش',
  'ترند',
  'همکاری',
  'پاسخ به سوالات'
];

// ایده‌های استوری اضافی برای دسته‌بندی‌های جدید
const additionalStoryIdeas = [
  // داستان‌سرایی
  {
    title: 'داستان موفقیت',
    description: 'روایت موفقیت‌های مشتریان و پروژه‌ها',
    category: 'داستان‌سرایی',
    storyType: 'داستان‌سرایی برند',
    template: '🏆 داستان موفقیت:\n\n{نام مشتری/پروژه}\n\n{چالش}\n{راه‌حل}\n{نتیجه}\n\n#داستان_موفقیت #مشتری_راضی',
    guidelines: 'از ساختار کلاسیک داستان استفاده کنید: وضعیت اولیه، مشکل، راه‌حل، نتیجه.',
    icon: 'Trophy',
    isActive: true
  },
  {
    title: 'داستان شکست و یادگیری',
    description: 'اشتراک تجربیات شکست و درس‌های آموخته',
    category: 'داستان‌سرایی',
    storyType: 'داستان‌سرایی برند',
    template: '💔 داستان شکست:\n\n{توضیح شکست}\n\n📚 درس آموخته:\n{درس}\n\n💪 نتیجه: {نتیجه مثبت}',
    guidelines: 'صادقانه و شفاف باشید. روی درس‌های آموخته تمرکز کنید.',
    icon: 'BookOpen',
    isActive: true
  },

  // تعامل
  {
    title: 'سوال باز',
    description: 'سوالات باز برای شروع گفتگو',
    category: 'تعامل',
    storyType: 'تعامل تعاملی',
    template: '💭 سوال باز:\n\n{سوال}\n\nنظر شما چیه؟ در کامنت‌ها به اشتراک بذارید 👇',
    guidelines: 'سوالات باید فکربرانگیز و مرتبط با مخاطب باشند.',
    icon: 'MessageSquare',
    isActive: true
  },
  {
    title: 'نظرسنجی تصویری',
    description: 'نظرسنجی‌های بصری با استفاده از تصاویر',
    category: 'تعامل',
    storyType: 'تعامل تعاملی',
    template: '🖼️ کدوم رو ترجیح می‌دید؟\n\nA) {تصویر/گزینه اول}\nB) {تصویر/گزینه دوم}\n\nنظرتون رو بگید!',
    guidelines: 'از تصاویر واضح و جذاب استفاده کنید.',
    icon: 'MessageSquare',
    isActive: true
  },

  // آموزش
  {
    title: 'آموزش ویدیویی کوتاه',
    description: 'آموزش‌های کوتاه در قالب ویدیو',
    category: 'آموزش',
    storyType: 'میکرو-آموزش',
    template: '🎥 آموزش کوتاه:\n\n{موضوع آموزش}\n\nمرحله 1: {مرحله اول}\nمرحله 2: {مرحله دوم}\nمرحله 3: {مرحله سوم}\n\n✅ نتیجه: {نتیجه}',
    guidelines: 'مراحل را ساده و قابل فهم کنید. از تصاویر مرحله‌ای استفاده کنید.',
    icon: 'GraduationCap',
    isActive: true
  },
  {
    title: 'نکات سریع',
    description: 'نکات کوتاه و مفید برای بهبود عملکرد',
    category: 'آموزش',
    storyType: 'میکرو-آموزش',
    template: '⚡ نکته سریع:\n\n{عنوان نکته}\n\n{توضیح کوتاه}\n\n💡 نتیجه: {نکته کلیدی}',
    guidelines: 'نکات باید عملی و قابل اجرا باشند.',
    icon: 'GraduationCap',
    isActive: true
  },

  // تجربه
  {
    title: 'تجربه شخصی',
    description: 'اشتراک تجربیات شخصی و درس‌های آموخته',
    category: 'تجربه',
    storyType: 'تجربه کاربری',
    template: '👤 تجربه شخصی:\n\n{موضوع}\n\n{تجربه}\n\n📚 درس: {درس آموخته}',
    guidelines: 'صادقانه و انسانی باشید. تجربیات را قابل ارتباط کنید.',
    icon: 'UserCheck',
    isActive: true
  },
  {
    title: 'مقایسه تجربیات',
    description: 'مقایسه تجربیات مختلف و نتیجه‌گیری',
    category: 'تجربه',
    storyType: 'تجربه کاربری',
    template: '⚖️ مقایسه تجربیات:\n\nتجربه A: {تجربه اول}\nتجربه B: {تجربه دوم}\n\n🏆 نتیجه: {نتیجه‌گیری}',
    guidelines: 'مقایسه‌ها باید منصفانه و مفید باشند.',
    icon: 'UserCheck',
    isActive: true
  },

  // محصول
  {
    title: 'معرفی ویژگی جدید',
    description: 'معرفی ویژگی‌های جدید محصولات',
    category: 'محصول',
    storyType: 'پیش‌نمایش محصول',
    template: '🆕 ویژگی جدید:\n\n{نام ویژگی}\n\n{توضیح}\n\n💡 چطور استفاده کنیم: {راهنمای استفاده}',
    guidelines: 'ویژگی‌ها را به صورت واضح و کاربردی معرفی کنید.',
    icon: 'Eye',
    isActive: true
  },
  {
    title: 'مقایسه نسخه‌ها',
    description: 'مقایسه نسخه‌های مختلف محصول',
    category: 'محصول',
    storyType: 'پیش‌نمایش محصول',
    template: '🔄 مقایسه نسخه‌ها:\n\nنسخه قدیم: {ویژگی‌های قدیم}\nنسخه جدید: {ویژگی‌های جدید}\n\n✨ بهبودها: {بهبودها}',
    guidelines: 'بهبودها را به صورت واضح و قابل مشاهده نمایش دهید.',
    icon: 'Eye',
    isActive: true
  },

  // تحلیل
  {
    title: 'تحلیل عمیق',
    description: 'تحلیل‌های عمیق و تخصصی موضوعات مختلف',
    category: 'تحلیل',
    storyType: 'مقایسه و تحلیل',
    template: '🔍 تحلیل عمیق:\n\n{موضوع}\n\n📊 داده‌ها: {داده‌ها}\n📈 تحلیل: {تحلیل}\n💡 نتیجه‌گیری: {نتیجه}',
    guidelines: 'از داده‌های معتبر استفاده کنید. تحلیل‌ها را ساده کنید.',
    icon: 'BarChart3',
    isActive: true
  },
  {
    title: 'پیش‌بینی آینده',
    description: 'پیش‌بینی‌های تخصصی برای آینده',
    category: 'تحلیل',
    storyType: 'مقایسه و تحلیل',
    template: '🔮 پیش‌بینی آینده:\n\n{موضوع}\n\n📈 ترند فعلی: {ترند فعلی}\n🔮 آینده: {پیش‌بینی}\n💡 فرصت: {فرصت}',
    guidelines: 'پیش‌بینی‌ها را بر اساس داده‌های معتبر ارائه دهید.',
    icon: 'BarChart3',
    isActive: true
  },

  // سفر مشتری
  {
    title: 'نقشه ذهنی مشتری',
    description: 'نمایش ذهنیت و نیازهای مشتری',
    category: 'سفر مشتری',
    storyType: 'سفر مشتری',
    template: '🧠 ذهن مشتری:\n\n{مرحله}\n\n💭 فکر می‌کند: {فکر}\n😰 نگران است: {نگرانی}\n💡 می‌خواهد: {خواسته}',
    guidelines: 'از دیدگاه مشتری فکر کنید. نیازهای واقعی را شناسایی کنید.',
    icon: 'Map',
    isActive: true
  },
  {
    title: 'نقاط تماس',
    description: 'نمایش نقاط تماس مختلف با مشتری',
    category: 'سفر مشتری',
    storyType: 'سفر مشتری',
    template: '📞 نقاط تماس:\n\n{نقطه تماس}\n\n🎯 هدف: {هدف}\n💬 پیام: {پیام}\n📊 نتیجه: {نتیجه}',
    guidelines: 'نقاط تماس را به صورت منطقی و متوالی نمایش دهید.',
    icon: 'Map',
    isActive: true
  },

  // نکات حرفه‌ای
  {
    title: 'نکات مدیریتی',
    description: 'نکات تخصصی برای مدیریت و رهبری',
    category: 'نکات حرفه‌ای',
    storyType: 'نکات حرفه‌ای',
    template: '👨‍💼 نکته مدیریتی:\n\n{موضوع}\n\n{توضیح}\n\n📚 درس: {درس آموخته}',
    guidelines: 'نکات باید عملی و قابل اجرا باشند.',
    icon: 'Lightbulb',
    isActive: true
  },
  {
    title: 'نکات فروش',
    description: 'نکات تخصصی برای فروش و بازاریابی',
    category: 'نکات حرفه‌ای',
    storyType: 'نکات حرفه‌ای',
    template: '💰 نکته فروش:\n\n{موضوع}\n\n{توضیح}\n\n🎯 نتیجه: {نتیجه}',
    guidelines: 'نکات باید بر اساس تجربه واقعی باشند.',
    icon: 'Lightbulb',
    isActive: true
  },

  // چالش
  {
    title: 'چالش هفتگی',
    description: 'چالش‌های هفتگی برای مشارکت مخاطبان',
    category: 'چالش',
    storyType: 'چالش و مسابقه',
    template: '📅 چالش هفتگی:\n\n{توضیح چالش}\n\n🎁 جایزه: {جایزه}\n⏰ مهلت: {تاریخ}\n\nنتیجه رو با #چالش_هفتگی به اشتراک بذارید!',
    guidelines: 'چالش‌ها باید جذاب و قابل انجام باشند.',
    icon: 'Trophy',
    isActive: true
  },
  {
    title: 'چالش ماهانه',
    description: 'چالش‌های ماهانه برای ایجاد عادت‌های مثبت',
    category: 'چالش',
    storyType: 'چالش و مسابقه',
    template: '📆 چالش ماهانه:\n\n{توضیح چالش}\n\n📊 پیشرفت: {وضعیت}\n🏆 برندگان: {برندگان}',
    guidelines: 'چالش‌ها باید مفید و قابل انجام باشند.',
    icon: 'Trophy',
    isActive: true
  },

  // ترند
  {
    title: 'ترند هفته',
    description: 'ترندهای مهم هفته در صنعت',
    category: 'ترند',
    storyType: 'پیش‌بینی و ترند',
    template: '📈 ترند هفته:\n\n{نام ترند}\n\n📊 وضعیت: {وضعیت}\n🔮 آینده: {پیش‌بینی}\n💡 فرصت: {فرصت}',
    guidelines: 'ترندها باید معتبر و مرتبط باشند.',
    icon: 'TrendingUp',
    isActive: true
  },
  {
    title: 'ترند ماه',
    description: 'ترندهای مهم ماه در صنعت',
    category: 'ترند',
    storyType: 'پیش‌بینی و ترند',
    template: '📅 ترند ماه:\n\n{نام ترند}\n\n📈 رشد: {رشد}\n🎯 هدف: {هدف}\n💡 استراتژی: {استراتژی}',
    guidelines: 'ترندها را با داده‌های معتبر پشتیبانی کنید.',
    icon: 'TrendingUp',
    isActive: true
  },

  // همکاری
  {
    title: 'شراکت استراتژیک',
    description: 'نمایش شراکت‌های استراتژیک و همکاری‌ها',
    category: 'همکاری',
    storyType: 'کولاب و همکاری',
    template: '🤝 شراکت استراتژیک:\n\n{نام شریک}\n\n🎯 هدف: {هدف}\n📊 نتیجه: {نتیجه}\n💡 ارزش: {ارزش افزوده}',
    guidelines: 'همکاری‌ها را به صورت مثبت و ارزشمند نمایش دهید.',
    icon: 'Users',
    isActive: true
  },
  {
    title: 'تیم متخصص',
    description: 'معرفی تیم متخصص و تخصص‌های آن‌ها',
    category: 'همکاری',
    storyType: 'کولاب و همکاری',
    template: '👥 تیم متخصص:\n\n{نام عضو}\n\n🎓 تخصص: {تخصص}\n💼 تجربه: {تجربه}\n🏆 دستاورد: {دستاورد}',
    guidelines: 'اعضای تیم را به صورت حرفه‌ای معرفی کنید.',
    icon: 'Users',
    isActive: true
  },

  // پاسخ به سوالات
  {
    title: 'سوال فنی',
    description: 'پاسخ به سوالات فنی و تخصصی',
    category: 'پاسخ به سوالات',
    storyType: 'سوال و جواب تخصصی',
    template: '🔧 سوال فنی:\n\n{سوال}\n\n💡 پاسخ:\n{پاسخ}\n\n📚 منابع: {منابع}',
    guidelines: 'پاسخ‌ها باید دقیق و قابل فهم باشند.',
    icon: 'HelpCircle',
    isActive: true
  },
  {
    title: 'سوال استراتژیک',
    description: 'پاسخ به سوالات استراتژیک و کسب‌وکار',
    category: 'پاسخ به سوالات',
    storyType: 'سوال و جواب تخصصی',
    template: '🎯 سوال استراتژیک:\n\n{سوال}\n\n💡 پاسخ:\n{پاسخ}\n\n📊 تحلیل: {تحلیل}',
    guidelines: 'پاسخ‌ها باید جامع و قابل اجرا باشند.',
    icon: 'HelpCircle',
    isActive: true
  }
];

async function seedAdditionalContent() {
  try {
    console.log('🎨 Starting to seed additional story content...');

    // اضافه کردن ایده‌های استوری اضافی
    console.log('💡 Adding additional story ideas...');
    for (const storyIdea of additionalStoryIdeas) {
      const existing = await prisma.storyIdea.findFirst({
        where: { title: storyIdea.title }
      });
      
      if (!existing) {
        await prisma.storyIdea.create({
          data: storyIdea
        });
        console.log(`✅ Created story idea: ${storyIdea.title}`);
      } else {
        console.log(`⏭️ Story idea already exists: ${storyIdea.title}`);
      }
    }

    console.log('🎉 Additional story content seeded successfully!');
    
    // بررسی نهایی
    const storyIdeasCount = await prisma.storyIdea.count();
    console.log(`📊 Total story ideas: ${storyIdeasCount}`);

  } catch (error) {
    console.error('❌ Error seeding additional content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdditionalContent();
