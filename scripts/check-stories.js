const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function checkStories() {
  try {
    console.log('🔍 Checking stories in database...\n');

    const stories = await prisma.story.findMany({
      include: {
        storyType: {
          select: {
            id: true,
            name: true,
          }
        },
        storyIdea: {
          select: {
            id: true,
            title: true,
          }
        },
        project: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (stories.length > 0) {
      console.log(`✅ Found ${stories.length} stories:`);
      stories.forEach((story, index) => {
        console.log(`${index + 1}. ${story.title}`);
        console.log(`   ID: ${story.id}`);
        console.log(`   Day: ${story.day}`);
        console.log(`   Story Type: ${story.storyType?.name || 'None'}`);
        console.log(`   Story Idea: ${story.storyIdea?.title || 'None'}`);
        console.log(`   Project: ${story.project?.name || 'None'}`);
        console.log('');
      });
    } else {
      console.log('❌ No stories found in database!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStories();
