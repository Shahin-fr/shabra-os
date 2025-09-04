const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map existing ideas to their appropriate story types
const ideaStoryTypeMapping = {
  // تعامل با مخاطب
  'نظرسنجی از مخاطبان': 'تعامل با مخاطب',
  'سوال و جواب با مخاطبان': 'تعامل با مخاطب',
  'چالش روزانه': 'تعامل با مخاطب',
  'نظرخواهی درباره محتوا': 'تعامل با مخاطب',
  'کوئیز و مسابقه': 'تعامل با مخاطب',
  'نظرخواهی درباره محصول': 'تعامل با مخاطب',
  'نظرخواهی درباره خدمات': 'تعامل با مخاطب',

  // معرفی محصول
  'معرفی محصول جدید': 'معرفی محصول',
  'ویژگی‌های کلیدی محصول': 'معرفی محصول',
  'مقایسه محصولات': 'معرفی محصول',
  'نحوه استفاده از محصول': 'معرفی محصول',
  'مزایای محصول': 'معرفی محصول',

  // آموزشی
  'نکات آموزشی': 'آموزشی',
  'راهنمای گام به گام': 'آموزشی',
  'اشتباهات رایج': 'آموزشی',
  'سوالات متداول': 'آموزشی',
  'نکات حرفه‌ای': 'آموزشی',
  'آموزش استفاده از ابزار': 'آموزشی',

  // پشت صحنه
  'روز کاری تیم': 'پشت صحنه',
  'فرآیند تولید': 'پشت صحنه',
  'چالش‌های کاری': 'پشت صحنه',
  'تیم و همکاران': 'پشت صحنه',
  'فضای کاری': 'پشت صحنه',

  // فروش ویژه
  'تخفیف ویژه': 'فروش ویژه',
  'پیشنهاد محدود': 'فروش ویژه',
  'کد تخفیف': 'فروش ویژه',

  // سرگرمی
  'داستان برند': 'سرگرمی',
  'نکات جالب': 'سرگرمی',
  'معما و چالش': 'سرگرمی',

  // اخبار و رویداد
  'ارزش‌های برند': 'اخبار و رویداد',
  'رویدادهای مهم': 'اخبار و رویداد',
  'دستاوردهای شرکت': 'اخبار و رویداد',

  // شروع/پایان روز
  'شروع روز': 'شروع/پایان روز',
  'پایان روز': 'شروع/پایان روز',
};

async function main() {
  console.log('🔄 شروع به به‌روزرسانی ایده‌های استوری...');

  try {
    // Get all existing story ideas
    const ideas = await prisma.storyIdea.findMany();
    console.log(`📊 ${ideas.length} ایده موجود یافت شد`);

    let updatedCount = 0;

    for (const idea of ideas) {
      const newStoryType = ideaStoryTypeMapping[idea.title];

      if (newStoryType) {
        await prisma.storyIdea.update({
          where: { id: idea.id },
          data: { storyType: newStoryType },
        });
        console.log(`✅ ${idea.title} -> ${newStoryType}`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${idea.title} -> بدون تطبیق (استفاده از پیش‌فرض)`);
      }
    }

    console.log(`\n🎉 ${updatedCount} ایده با موفقیت به‌روزرسانی شدند`);

    // Show summary by story type
    const summary = await prisma.storyIdea.groupBy({
      by: ['storyType'],
      _count: { storyType: true },
    });

    console.log('\n📈 خلاصه بر اساس نوع استوری:');
    summary.forEach(item => {
      console.log(`${item.storyType}: ${item._count.storyType} ایده`);
    });
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی ایده‌ها:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
