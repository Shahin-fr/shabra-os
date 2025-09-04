const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define high-level Story Types for quick planning
const storyTypes = [
  {
    name: 'شروع/پایان روز',
    icon: 'Sunrise',
    isActive: true,
    description: 'استوری‌های مربوط به شروع یا پایان روز کاری'
  },
  {
    name: 'معرفی محصول',
    icon: 'Package',
    isActive: true,
    description: 'معرفی محصولات و خدمات جدید'
  },
  {
    name: 'تعامل با مخاطب',
    icon: 'MessageCircle',
    isActive: true,
    description: 'نظرسنجی، پرسش و پاسخ و تعامل با فالوورها'
  },
  {
    name: 'آموزشی',
    icon: 'BookOpen',
    isActive: true,
    description: 'محتوای آموزشی و راهنما'
  },
  {
    name: 'پشت صحنه',
    icon: 'Camera',
    isActive: true,
    description: 'نمایش فرآیند کار و پشت صحنه'
  },
  {
    name: 'فروش ویژه',
    icon: 'Tag',
    isActive: true,
    description: 'تخفیفات و پیشنهادات ویژه'
  },
  {
    name: 'سرگرمی',
    icon: 'Smile',
    isActive: true,
    description: 'محتوای سرگرم‌کننده و جذاب'
  },
  {
    name: 'اخبار و رویداد',
    icon: 'Newspaper',
    isActive: true,
    description: 'اخبار شرکت و رویدادهای مهم'
  }
];

async function main() {
  console.log('🌱 شروع به کاشت انواع استوری جدید...');
  
  try {
    // Clear existing story types
    await prisma.storyType.deleteMany({});
    console.log('✅ انواع قبلی پاک شدند');

    // Create new story types
    for (const type of storyTypes) {
      await prisma.storyType.create({
        data: {
          name: type.name,
          icon: type.icon,
          isActive: type.isActive
        }
      });
    }
    
    console.log(`✅ ${storyTypes.length} نوع استوری با موفقیت ایجاد شدند`);
    
    // Log created types
    console.log('\n📋 انواع استوری ایجاد شده:');
    storyTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.name} (${type.icon}) - ${type.description}`);
    });
    
  } catch (error) {
    console.error('❌ خطا در ایجاد انواع استوری:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
