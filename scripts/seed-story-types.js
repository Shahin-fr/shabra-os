const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const storyTypes = [
  {
    name: 'خبر و اطلاع‌رسانی',
    icon: 'Newspaper',
    isActive: true,
  },
  {
    name: 'محتوای آموزشی',
    icon: 'BookOpen',
    isActive: true,
  },
  {
    name: 'معرفی محصول',
    icon: 'Package',
    isActive: true,
  },
  {
    name: 'پشت صحنه',
    icon: 'Camera',
    isActive: true,
  },
  {
    name: 'نظرسنجی',
    icon: 'MessageCircle',
    isActive: true,
  },
  {
    name: 'رویداد و مناسبت',
    icon: 'Calendar',
    isActive: true,
  },
  {
    name: 'داستان برند',
    icon: 'Heart',
    isActive: true,
  },
  {
    name: 'محتوی سرگرمی',
    icon: 'Smile',
    isActive: true,
  },
  {
    name: 'نکات و ترفند',
    icon: 'Lightbulb',
    isActive: true,
  },
  {
    name: 'مقایسه و بررسی',
    icon: 'BarChart3',
    isActive: true,
  },
];

async function main() {
  console.log('🌱 شروع به کاشت انواع استوری...');

  try {
    // Clear existing story types
    await prisma.storyType.deleteMany({});
    console.log('✅ انواع قبلی پاک شدند');

    // Create new story types
    for (const storyType of storyTypes) {
      await prisma.storyType.create({
        data: storyType,
      });
    }

    console.log(`✅ ${storyTypes.length} نوع استوری با موفقیت ایجاد شدند`);
    console.log('📊 انواع استوری:');

    storyTypes.forEach(storyType => {
      console.log(`   - ${storyType.name} (${storyType.icon})`);
    });
  } catch (error) {
    console.error('❌ خطا در ایجاد انواع استوری:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
