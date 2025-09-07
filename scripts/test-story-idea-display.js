const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function testStoryIdeaDisplay() {
  try {
    console.log('🧪 Testing story idea display functionality...\n');

    // 1. Get a story with storyIdea
    console.log('1️⃣ Getting stories with story ideas...');
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
            description: true,
            category: true,
            storyType: true,
            guidelines: true,
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
      },
      take: 3
    });

    if (stories.length > 0) {
      console.log(`✅ Found ${stories.length} stories:`);
      stories.forEach((story, index) => {
        console.log(`${index + 1}. ${story.title}`);
        console.log(`   ID: ${story.id}`);
        console.log(`   Story Type: ${story.storyType?.name || 'None'}`);
        console.log(`   Story Idea: ${story.storyIdea?.title || 'None'}`);
        if (story.storyIdea) {
          console.log(`   Idea Description: ${story.storyIdea.description}`);
          console.log(`   Idea Guidelines: ${story.storyIdea.guidelines}`);
        }
        console.log('');
      });

      // 2. Test updating a story with story idea
      const testStory = stories[0];
      console.log('2️⃣ Testing story update with story idea...');
      
      // Get a story idea to assign
      const storyIdeas = await prisma.storyIdea.findMany({
        where: { isActive: true },
        take: 1
      });

      if (storyIdeas.length > 0) {
        const storyIdea = storyIdeas[0];
        console.log(`📝 Assigning story idea: ${storyIdea.title}`);
        
        const updatedStory = await prisma.story.update({
          where: { id: testStory.id },
          data: {
            storyIdeaId: storyIdea.id
          },
          include: {
            storyIdea: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                storyType: true,
                guidelines: true,
              }
            }
          }
        });

        console.log('✅ Story updated successfully!');
        console.log(`📋 New Story Idea: ${updatedStory.storyIdea?.title || 'None'}`);
        console.log(`📝 Description: ${updatedStory.storyIdea?.description || 'None'}`);
        console.log(`📋 Guidelines: ${updatedStory.storyIdea?.guidelines || 'None'}`);
      } else {
        console.log('❌ No story ideas found to assign');
      }
    } else {
      console.log('❌ No stories found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStoryIdeaDisplay();
