const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// انواع استوری خلاقانه و حرفه‌ای
const creativeStoryTypes = [
  {
    name: 'داستان‌سرایی برند',
    icon: 'BookOpen',
    description: 'روایت‌سازی خلاقانه برای برند و محصولات با استفاده از تکنیک‌های داستان‌سرایی',
    isActive: true
  },
  {
    name: 'تعامل تعاملی',
    icon: 'MessageSquare',
    description: 'استوری‌های تعاملی با استفاده از استیکرها، نظرسنجی‌ها و بازی‌های کوچک',
    isActive: true
  },
  {
    name: 'میکرو-آموزش',
    icon: 'GraduationCap',
    description: 'آموزش‌های کوتاه و سریع در قالب نکات، ترفندها و راهنمایی‌های عملی',
    isActive: true
  },
  {
    name: 'تجربه کاربری',
    icon: 'UserCheck',
    description: 'نمایش تجربه واقعی کاربران و مشتریان با محصولات و خدمات',
    isActive: true
  },
  {
    name: 'پیش‌نمایش محصول',
    icon: 'Eye',
    description: 'نمایش جزئیات محصولات جدید با زوایای مختلف و ویژگی‌های خاص',
    isActive: true
  },
  {
    name: 'مقایسه و تحلیل',
    icon: 'BarChart3',
    description: 'مقایسه محصولات، خدمات یا ایده‌ها با استفاده از نمودارها و آمار',
    isActive: true
  },
  {
    name: 'سفر مشتری',
    icon: 'Map',
    description: 'نمایش مسیر سفر مشتری از آگاهی تا خرید و وفاداری',
    isActive: true
  },
  {
    name: 'نکات حرفه‌ای',
    icon: 'Lightbulb',
    description: 'اشتراک نکات تخصصی و تجربیات حرفه‌ای در حوزه کاری',
    isActive: true
  },
  {
    name: 'چالش و مسابقه',
    icon: 'Trophy',
    description: 'ایجاد چالش‌ها، مسابقات و بازی‌های تعاملی برای افزایش مشارکت',
    isActive: true
  },
  {
    name: 'پیش‌بینی و ترند',
    icon: 'TrendingUp',
    description: 'تحلیل ترندها، پیش‌بینی‌ها و آینده‌نگری در صنعت',
    isActive: true
  },
  {
    name: 'کولاب و همکاری',
    icon: 'Users',
    description: 'نمایش همکاری‌ها، شراکت‌ها و پروژه‌های مشترک',
    isActive: true
  },
  {
    name: 'سوال و جواب تخصصی',
    icon: 'HelpCircle',
    description: 'پاسخ به سوالات تخصصی و رفع ابهامات مخاطبان',
    isActive: true
  }
];

// ایده‌های استوری خلاقانه و تخصصی
const creativeStoryIdeas = [
  // داستان‌سرایی برند
  {
    title: 'تولد یک ایده',
    description: 'روایت چگونگی شکل‌گیری ایده محصول از ذهن تا واقعیت',
    category: 'پشت صحنه',
    storyType: 'داستان‌سرایی برند',
    template: '🎬 داستان امروز: چگونه ایده {نام محصول} متولد شد؟\n\n{داستان کوتاه}\n\n#داستان_برند #ایده_خلاق',
    guidelines: 'از عناصر داستانی استفاده کنید: شخصیت، چالش، راه‌حل. تصاویر قبل و بعد را نشان دهید.',
    icon: 'BookOpen',
    isActive: true
  },
  {
    title: 'سفر قهرمان برند',
    description: 'نمایش مسیر برند از شروع تا موفقیت با استفاده از الگوی سفر قهرمان',
    category: 'پشت صحنه',
    storyType: 'داستان‌سرایی برند',
    template: '🦸‍♂️ سفر قهرمان ما: {مرحله از سفر}\n\n{توضیح مرحله}\n\n#سفر_قهرمان #برند_ما',
    guidelines: 'از مراحل کلاسیک سفر قهرمان استفاده کنید: فراخوان، رد کردن، راهنما، آزمایش‌ها، بازگشت.',
    icon: 'BookOpen',
    isActive: true
  },

  // تعامل تعاملی
  {
    title: 'نظرسنجی سریع',
    description: 'نظرسنجی‌های کوتاه و جذاب برای درگیر کردن مخاطبان',
    category: 'تعامل',
    storyType: 'تعامل تعاملی',
    template: '❓ سوال سریع:\n\n{سوال}\n\nA) {گزینه اول}\nB) {گزینه دوم}\nC) {گزینه سوم}\n\nنظر شما چیه؟ 👇',
    guidelines: 'سوالات ساده و مرتبط با مخاطب بپرسید. از ایموجی استفاده کنید.',
    icon: 'MessageSquare',
    isActive: true
  },
  {
    title: 'چالش روزانه',
    description: 'چالش‌های کوچک روزانه برای مشارکت مخاطبان',
    category: 'تعامل',
    storyType: 'تعامل تعاملی',
    template: '🎯 چالش امروز:\n\n{توضیح چالش}\n\nنتیجه رو با #چالش_ما به اشتراک بذارید!',
    guidelines: 'چالش‌ها باید قابل انجام و جذاب باشند. هشتگ مخصوص ایجاد کنید.',
    icon: 'MessageSquare',
    isActive: true
  },

  // میکرو-آموزش
  {
    title: 'نکته 60 ثانیه‌ای',
    description: 'آموزش‌های کوتاه و مفید در کمتر از 60 ثانیه',
    category: 'آموزش',
    storyType: 'میکرو-آموزش',
    template: '⏰ نکته 60 ثانیه‌ای:\n\n{عنوان نکته}\n\n{توضیح کوتاه}\n\n💡 نتیجه: {نکته کلیدی}',
    guidelines: 'مطالب را ساده و قابل فهم کنید. از شماره‌گذاری استفاده کنید.',
    icon: 'GraduationCap',
    isActive: true
  },
  {
    title: 'ترفند حرفه‌ای',
    description: 'اشتراک ترفندها و نکات تخصصی برای بهبود عملکرد',
    category: 'آموزش',
    storyType: 'میکرو-آموزش',
    template: '🔧 ترفند حرفه‌ای:\n\n{نام ترفند}\n\n{مراحل انجام}\n\n⚠️ نکته مهم: {هشدار یا نکته}',
    guidelines: 'ترفندها باید عملی و قابل اجرا باشند. از تصاویر مرحله‌ای استفاده کنید.',
    icon: 'GraduationCap',
    isActive: true
  },

  // تجربه کاربری
  {
    title: 'تستیمنت مشتری',
    description: 'نمایش نظرات و تجربیات واقعی مشتریان',
    category: 'محصول',
    storyType: 'تجربه کاربری',
    template: '💬 نظر مشتری:\n\n"{نظر مشتری}"\n\n- {نام مشتری}\n\n⭐ امتیاز: {امتیاز}/5',
    guidelines: 'نظرات واقعی و معتبر استفاده کنید. اجازه دهید مشتریان خودشان صحبت کنند.',
    icon: 'UserCheck',
    isActive: true
  },
  {
    title: 'قبل و بعد',
    description: 'نمایش تغییرات و بهبودها با مقایسه قبل و بعد',
    category: 'محصول',
    storyType: 'تجربه کاربری',
    template: '🔄 تغییرات:\n\nقبل: {وضعیت قبلی}\nبعد: {وضعیت جدید}\n\nنتیجه: {نتیجه بهبود}',
    guidelines: 'از تصاویر واضح قبل و بعد استفاده کنید. تغییرات را قابل مشاهده کنید.',
    icon: 'UserCheck',
    isActive: true
  },

  // پیش‌نمایش محصول
  {
    title: 'نگاه نزدیک',
    description: 'نمایش جزئیات محصولات با زوایای مختلف',
    category: 'محصول',
    storyType: 'پیش‌نمایش محصول',
    template: '🔍 نگاه نزدیک به {نام محصول}:\n\n{ویژگی اول}\n{ویژگی دوم}\n{ویژگی سوم}\n\n{نکته خاص}',
    guidelines: 'از تصاویر با کیفیت بالا استفاده کنید. جزئیات مهم را برجسته کنید.',
    icon: 'Eye',
    isActive: true
  },
  {
    title: 'ویژگی مخفی',
    description: 'نمایش ویژگی‌های کمتر شناخته شده محصولات',
    category: 'محصول',
    storyType: 'پیش‌نمایش محصول',
    template: '🤫 ویژگی مخفی {نام محصول}:\n\n{توضیح ویژگی}\n\n💡 چطور استفاده کنیم: {راهنمای استفاده}',
    guidelines: 'ویژگی‌های جالب و کاربردی را معرفی کنید. راهنمای استفاده ارائه دهید.',
    icon: 'Eye',
    isActive: true
  },

  // مقایسه و تحلیل
  {
    title: 'مقایسه هوشمند',
    description: 'مقایسه محصولات یا خدمات با استفاده از معیارهای مشخص',
    category: 'آموزش',
    storyType: 'مقایسه و تحلیل',
    template: '📊 مقایسه {موضوع}:\n\n{گزینه اول}: {نقاط قوت}\n{گزینه دوم}: {نقاط قوت}\n\n🏆 برنده: {نتیجه}',
    guidelines: 'معیارهای مقایسه را مشخص کنید. بی‌طرفانه تحلیل کنید.',
    icon: 'BarChart3',
    isActive: true
  },
  {
    title: 'آمار جالب',
    description: 'اشتراک آمار و ارقام جالب در قالب اینفوگرافیک',
    category: 'آموزش',
    storyType: 'مقایسه و تحلیل',
    template: '📈 آمار جالب:\n\n{آمار اول}\n{آمار دوم}\n{آمار سوم}\n\n💭 تحلیل: {نتیجه‌گیری}',
    guidelines: 'آمارها باید معتبر و جالب باشند. از نمودارهای ساده استفاده کنید.',
    icon: 'BarChart3',
    isActive: true
  },

  // سفر مشتری
  {
    title: 'نقشه سفر مشتری',
    description: 'نمایش مراحل مختلف سفر مشتری از آگاهی تا خرید',
    category: 'آموزش',
    storyType: 'سفر مشتری',
    template: '🗺️ سفر مشتری - مرحله {شماره}:\n\n{نام مرحله}\n\n{توضیح مرحله}\n\n➡️ مرحله بعد: {مرحله بعدی}',
    guidelines: 'مراحل را به صورت منطقی و متوالی نمایش دهید. از آیکون‌های مناسب استفاده کنید.',
    icon: 'Map',
    isActive: true
  },
  {
    title: 'نقاط درد مشتری',
    description: 'شناسایی و حل مشکلات مشتریان در هر مرحله',
    category: 'آموزش',
    storyType: 'سفر مشتری',
    template: '😰 مشکل مشتری:\n\n{توضیح مشکل}\n\n💡 راه‌حل ما:\n\n{راه‌حل ارائه شده}',
    guidelines: 'مشکلات واقعی مشتریان را شناسایی کنید. راه‌حل‌های عملی ارائه دهید.',
    icon: 'Map',
    isActive: true
  },

  // نکات حرفه‌ای
  {
    title: 'تجربه مدیر',
    description: 'اشتراک تجربیات و درس‌های آموخته شده از مدیریت',
    category: 'آموزش',
    storyType: 'نکات حرفه‌ای',
    template: '👨‍💼 تجربه مدیر:\n\n{موضوع}\n\n{تجربه}\n\n📚 درس آموخته: {نکته کلیدی}',
    guidelines: 'تجربیات واقعی و مفید به اشتراک بگذارید. از مثال‌های عملی استفاده کنید.',
    icon: 'Lightbulb',
    isActive: true
  },
  {
    title: 'اشتباهات رایج',
    description: 'شناسایی و پیشگیری از اشتباهات رایج در حوزه کاری',
    category: 'آموزش',
    storyType: 'نکات حرفه‌ای',
    template: '⚠️ اشتباه رایج:\n\n{توضیح اشتباه}\n\n✅ راه درست:\n\n{راه‌حل صحیح}',
    guidelines: 'اشتباهات را بدون قضاوت توضیح دهید. راه‌حل‌های عملی ارائه دهید.',
    icon: 'Lightbulb',
    isActive: true
  },

  // چالش و مسابقه
  {
    title: 'مسابقه هفتگی',
    description: 'مسابقات منظم برای افزایش تعامل و وفاداری',
    category: 'سرگرمی',
    storyType: 'چالش و مسابقه',
    template: '🏆 مسابقه هفتگی:\n\n{توضیح مسابقه}\n\n🎁 جایزه: {جایزه}\n\n⏰ مهلت: {تاریخ}',
    guidelines: 'قوانین مسابقه را واضح تعریف کنید. جایزه‌های جذاب در نظر بگیرید.',
    icon: 'Trophy',
    isActive: true
  },
  {
    title: 'چالش 30 روزه',
    description: 'چالش‌های طولانی‌مدت برای ایجاد عادت‌های مثبت',
    category: 'سرگرمی',
    storyType: 'چالش و مسابقه',
    template: '📅 چالش 30 روزه:\n\n{توضیح چالش}\n\n📊 پیشرفت: روز {شماره}\n\n{وضعیت فعلی}',
    guidelines: 'چالش‌ها باید قابل انجام و مفید باشند. پیشرفت را به صورت منظم گزارش دهید.',
    icon: 'Trophy',
    isActive: true
  },

  // پیش‌بینی و ترند
  {
    title: 'ترند آینده',
    description: 'تحلیل و پیش‌بینی ترندهای آینده در صنعت',
    category: 'اخبار',
    storyType: 'پیش‌بینی و ترند',
    template: '🔮 ترند آینده:\n\n{نام ترند}\n\n📈 پیش‌بینی: {پیش‌بینی}\n\n💡 فرصت: {فرصت}',
    guidelines: 'پیش‌بینی‌ها را بر اساس داده‌های معتبر ارائه دهید. فرصت‌ها را شناسایی کنید.',
    icon: 'TrendingUp',
    isActive: true
  },
  {
    title: 'تحلیل بازار',
    description: 'تحلیل وضعیت فعلی بازار و پیش‌بینی تغییرات',
    category: 'اخبار',
    storyType: 'پیش‌بینی و ترند',
    template: '📊 تحلیل بازار:\n\n{موضوع تحلیل}\n\n📈 وضعیت فعلی: {وضعیت}\n\n🔮 آینده: {پیش‌بینی}',
    guidelines: 'از داده‌های معتبر استفاده کنید. تحلیل‌ها را ساده و قابل فهم کنید.',
    icon: 'TrendingUp',
    isActive: true
  },

  // کولاب و همکاری
  {
    title: 'همکاری موفق',
    description: 'نمایش پروژه‌های مشترک و همکاری‌های موفق',
    category: 'پشت صحنه',
    storyType: 'کولاب و همکاری',
    template: '🤝 همکاری با {نام شریک}:\n\n{توضیح پروژه}\n\n🎯 نتیجه: {نتیجه}\n\n💡 درس: {نکته}',
    guidelines: 'همکاری‌ها را به صورت مثبت نمایش دهید. ارزش افزوده را برجسته کنید.',
    icon: 'Users',
    isActive: true
  },
  {
    title: 'تیم پشت صحنه',
    description: 'معرفی اعضای تیم و نقش‌های مختلف آن‌ها',
    category: 'پشت صحنه',
    storyType: 'کولاب و همکاری',
    template: '👥 تیم ما:\n\n{نام عضو} - {نقش}\n\n{توضیح کوتاه}\n\n💪 تخصص: {تخصص}',
    guidelines: 'اعضای تیم را به صورت انسانی معرفی کنید. تخصص‌های آن‌ها را برجسته کنید.',
    icon: 'Users',
    isActive: true
  },

  // سوال و جواب تخصصی
  {
    title: 'سوال متداول',
    description: 'پاسخ به سوالات رایج و متداول مشتریان',
    category: 'آموزش',
    storyType: 'سوال و جواب تخصصی',
    template: '❓ سوال: {سوال}\n\n💡 پاسخ:\n\n{پاسخ کامل}\n\n🔗 بیشتر بدانید: {لینک}',
    guidelines: 'پاسخ‌ها را کامل و مفصل ارائه دهید. از مثال‌های عملی استفاده کنید.',
    icon: 'HelpCircle',
    isActive: true
  },
  {
    title: 'راهنمای گام به گام',
    description: 'راهنمای کامل برای انجام کارهای پیچیده',
    category: 'آموزش',
    storyType: 'سوال و جواب تخصصی',
    template: '📋 راهنمای گام به گام:\n\n{مرحله 1}\n{مرحله 2}\n{مرحله 3}\n\n⚠️ نکته مهم: {هشدار}',
    guidelines: 'مراحل را به صورت منطقی و متوالی ارائه دهید. نکات مهم را برجسته کنید.',
    icon: 'HelpCircle',
    isActive: true
  }
];

async function seedCreativeContent() {
  try {
    console.log('🎨 Starting to seed creative story content...');

    // اضافه کردن انواع استوری خلاقانه
    console.log('📝 Adding creative story types...');
    for (const storyType of creativeStoryTypes) {
      const existing = await prisma.storyType.findFirst({
        where: { name: storyType.name }
      });
      
      if (!existing) {
        await prisma.storyType.create({
          data: storyType
        });
        console.log(`✅ Created story type: ${storyType.name}`);
      } else {
        console.log(`⏭️ Story type already exists: ${storyType.name}`);
      }
    }

    // اضافه کردن ایده‌های استوری خلاقانه
    console.log('💡 Adding creative story ideas...');
    for (const storyIdea of creativeStoryIdeas) {
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

    console.log('🎉 Creative story content seeded successfully!');
    
    // بررسی نهایی
    const storyTypesCount = await prisma.storyType.count();
    const storyIdeasCount = await prisma.storyIdea.count();
    console.log(`📊 Total story types: ${storyTypesCount}`);
    console.log(`📊 Total story ideas: ${storyIdeasCount}`);

  } catch (error) {
    console.error('❌ Error seeding creative content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCreativeContent();
