const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function seedStoryIdeas() {
  try {
    console.log('🌱 Starting to seed story ideas...');

    // Clear existing story ideas
    await prisma.storyIdea.deleteMany({});
    console.log('🗑️ Cleared existing story ideas');

    // Create story ideas
    const storyIdeas = [
      {
        title: 'نکات روزانه پول',
        description: 'اشتراک نکات کوتاه و مفید درباره مدیریت پول و سرمایه‌گذاری',
        category: 'Education',
        storyType: 'تعامل با مخاطب',
        template: 'نکته پولی امروز: {موضوع}',
        guidelines: 'از اعداد و آمار استفاده کنید. متن کوتاه و مفید باشد.',
        icon: 'money',
        isActive: true
      },
      {
        title: 'اخبار ورزشی',
        description: 'خلاصه اخبار مهم ورزشی روز',
        category: 'News',
        storyType: 'اطلاع‌رسانی',
        template: 'اخبار ورزشی: {رویداد}',
        guidelines: 'از تصاویر و ویدیوهای مرتبط استفاده کنید.',
        icon: 'sport',
        isActive: true
      },
      {
        title: 'تکنولوژی جدید',
        description: 'معرفی تکنولوژی‌های جدید و نوآوری‌ها',
        category: 'Technology',
        storyType: 'آموزشی',
        template: 'تکنولوژی جدید: {نام}',
        guidelines: 'توضیح ساده و قابل فهم ارائه دهید.',
        icon: 'tech',
        isActive: true
      },
      {
        title: 'نکات سلامتی',
        description: 'توصیه‌های سلامتی و پزشکی',
        category: 'Health',
        storyType: 'آموزشی',
        template: 'نکته سلامتی: {موضوع}',
        guidelines: 'از منابع معتبر استفاده کنید.',
        icon: 'health',
        isActive: true
      },
      {
        title: 'دستور پخت',
        description: 'دستور پخت غذاهای ساده و خوشمزه',
        category: 'Lifestyle',
        storyType: 'سرگرمی',
        template: 'دستور پخت: {نام غذا}',
        guidelines: 'مراحل را به صورت تصویری نشان دهید.',
        icon: 'food',
        isActive: true
      },
      {
        title: 'نکات سفر',
        description: 'راهنمای سفر و نکات مفید برای مسافرت',
        category: 'Travel',
        storyType: 'تجربه‌شخصی',
        template: 'نکته سفر: {مقصد}',
        guidelines: 'از تجربیات شخصی استفاده کنید.',
        icon: 'travel',
        isActive: true
      },
      {
        title: 'انگیزشی',
        description: 'متن‌های انگیزشی و مثبت‌اندیشی',
        category: 'Motivation',
        storyType: 'انگیزشی',
        template: 'انگیزه امروز: {پیام}',
        guidelines: 'از تصاویر الهام‌بخش استفاده کنید.',
        icon: 'motivation',
        isActive: true
      },
      {
        title: 'طرفداری',
        description: 'محتواهای طرفداری از تیم‌های محبوب',
        category: 'Sports',
        storyType: 'سرگرمی',
        template: 'طرفداری: {تیم}',
        guidelines: 'از رنگ‌های تیم استفاده کنید.',
        icon: 'fan',
        isActive: true
      }
    ];

    // Insert story ideas
    for (const storyIdea of storyIdeas) {
      await prisma.storyIdea.create({
        data: storyIdea
      });
      console.log(`✅ Created story idea: ${storyIdea.title}`);
    }

    console.log('🎉 Story ideas seeded successfully!');
    
    // Verify the data
    const count = await prisma.storyIdea.count();
    console.log(`📊 Total story ideas in database: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding story ideas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStoryIdeas();