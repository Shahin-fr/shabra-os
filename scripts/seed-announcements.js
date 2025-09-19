const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

// Fix for Docker connection - use localhost instead of 127.0.0.1 and postgres user
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('127.0.0.1')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('127.0.0.1', 'localhost');
}

// For Docker with trust authentication, use postgres user without password
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/shabra_os?schema=public';
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding announcement data...');

  try {
    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { roles: 'ADMIN' },
    });

    if (!adminUser) {
      console.log('❌ No admin user found. Please run the main seed script first.');
      return;
    }

    console.log(`Found admin user: ${adminUser.firstName} ${adminUser.lastName}`);

    // Sample announcements
    const announcements = [
      {
        title: 'به‌روزرسانی سیستم مدیریت پروژه',
        content: `# به‌روزرسانی مهم سیستم

ما سیستم مدیریت پروژه را به‌روزرسانی کرده‌ایم تا تجربه بهتری برای شما فراهم کنیم.

## تغییرات جدید:
- رابط کاربری بهبود یافته
- عملکرد سریع‌تر
- ویژگی‌های جدید برای مدیریت تسک‌ها

لطفاً در صورت بروز هرگونه مشکل، با تیم فنی تماس بگیرید.`,
        category: 'TECHNICAL',
        isPinned: true,
        authorId: adminUser.id,
      },
      {
        title: 'جلسه تیم هفتگی',
        content: `# جلسه تیم هفتگی

جلسه تیم هفتگی ما در روز چهارشنبه ساعت 10 صبح برگزار خواهد شد.

## موضوعات جلسه:
- بررسی پیشرفت پروژه‌ها
- برنامه‌ریزی هفته آینده
- بحث در مورد چالش‌ها و راه‌حل‌ها

لطفاً حضور به موقع داشته باشید.`,
        category: 'EVENT',
        isPinned: false,
        authorId: adminUser.id,
      },
      {
        title: 'سیاست‌های جدید کار از راه دور',
        content: `# سیاست‌های جدید کار از راه دور

با توجه به تغییرات اخیر، سیاست‌های جدید کار از راه دور اعلام می‌شود.

## نکات مهم:
- حداکثر 3 روز در هفته کار از راه دور
- حضور اجباری در جلسات مهم
- گزارش روزانه فعالیت‌ها

این سیاست‌ها از هفته آینده اجرایی خواهد شد.`,
        category: 'IMPORTANT',
        isPinned: true,
        authorId: adminUser.id,
      },
      {
        title: 'برگزاری کارگاه آموزشی',
        content: `# کارگاه آموزشی "مدیریت زمان"

کارگاه آموزشی مدیریت زمان در روز شنبه ساعت 2 بعدازظهر برگزار خواهد شد.

## محتوای کارگاه:
- تکنیک‌های مدیریت زمان
- ابزارهای مفید
- تمرین‌های عملی

شرکت در این کارگاه برای همه اعضای تیم توصیه می‌شود.`,
        category: 'EVENT',
        isPinned: false,
        authorId: adminUser.id,
      },
      {
        title: 'تعطیلات رسمی هفته آینده',
        content: `# تعطیلات رسمی

با توجه به تعطیلات رسمی، دفتر در روزهای دوشنبه و سه‌شنبه تعطیل خواهد بود.

## برنامه کاری:
- یکشنبه: کار عادی
- دوشنبه: تعطیل
- سه‌شنبه: تعطیل
- چهارشنبه: کار عادی

لطفاً برنامه‌های خود را بر این اساس تنظیم کنید.`,
        category: 'GENERAL',
        isPinned: false,
        authorId: adminUser.id,
      },
    ];

    // Create announcements
    for (const announcementData of announcements) {
      const createdAnnouncement = await prisma.announcement.create({
        data: announcementData,
      });

      console.log(`✅ Created announcement: ${createdAnnouncement.title}`);
    }

    console.log('🎉 Announcement seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding announcements:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
