const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function seedStoryTypes() {
  try {
    console.log('🌱 Starting to seed story types...');

    // Clear existing story types
    await prisma.storyType.deleteMany({});
    console.log('🗑️ Cleared existing story types');

    // Create story types
    const storyTypes = [
      {
        name: 'متن',
        description: 'استوری‌های متنی برای انتشار در شبکه‌های اجتماعی',
        icon: 'text',
        isActive: true
      },
      {
        name: 'تصویر',
        description: 'استوری‌های تصویری و عکس',
        icon: 'image',
        isActive: true
      },
      {
        name: 'ویدیو',
        description: 'استوری‌های ویدیویی کوتاه',
        icon: 'video',
        isActive: true
      },
      {
        name: 'اینفوگرافیک',
        description: 'استوری‌های اینفوگرافیک و نمودار',
        icon: 'chart',
        isActive: true
      },
      {
        name: 'پول',
        description: 'استوری‌های مربوط به پول و اقتصاد',
        icon: 'money',
        isActive: true
      },
      {
        name: 'ورزش',
        description: 'استوری‌های ورزشی و مسابقات',
        icon: 'sport',
        isActive: true
      },
      {
        name: 'سیاست',
        description: 'استوری‌های سیاسی و اخبار',
        icon: 'politics',
        isActive: true
      },
      {
        name: 'فناوری',
        description: 'استوری‌های تکنولوژی و فناوری',
        icon: 'tech',
        isActive: true
      }
    ];

    // Insert story types
    for (const storyType of storyTypes) {
      await prisma.storyType.create({
        data: storyType
      });
      console.log(`✅ Created story type: ${storyType.name}`);
    }

    console.log('🎉 Story types seeded successfully!');
    
    // Verify the data
    const count = await prisma.storyType.count();
    console.log(`📊 Total story types in database: ${count}`);

  } catch (error) {
    console.error('❌ Error seeding story types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStoryTypes();