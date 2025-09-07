const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function checkStoryIdeas() {
  try {
    console.log('🔍 Checking story ideas...\n');

    const storyIdeas = await prisma.storyIdea.findMany({
      orderBy: { title: 'asc' }
    });

    if (storyIdeas.length > 0) {
      console.log(`✅ Found ${storyIdeas.length} story ideas:`);
      storyIdeas.forEach((idea, index) => {
        console.log(`${index + 1}. ${idea.title}`);
        console.log(`   Category: ${idea.category}`);
        console.log(`   Story Type: ${idea.storyType}`);
        console.log(`   Active: ${idea.isActive}`);
        console.log('');
      });
    } else {
      console.log('❌ No story ideas found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStoryIdeas();
