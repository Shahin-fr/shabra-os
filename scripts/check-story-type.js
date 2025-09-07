const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function checkStoryType() {
  try {
    console.log('🔍 Checking story type "تست"...\n');

    const storyType = await prisma.storyType.findFirst({
      where: {
        name: 'تست'
      }
    });

    if (storyType) {
      console.log('✅ Story type found:');
      console.log('ID:', storyType.id);
      console.log('Name:', storyType.name);
      console.log('Icon:', storyType.icon);
      console.log('Description:', storyType.description);
      console.log('Is Active:', storyType.isActive);
    } else {
      console.log('❌ Story type "تست" not found!');
    }

    // Check all active story types
    console.log('\n📋 All active story types:');
    const activeTypes = await prisma.storyType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    activeTypes.forEach(type => {
      console.log(`- ${type.name} (${type.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStoryType();
