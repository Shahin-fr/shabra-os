const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function testStoryCreation() {
  try {
    console.log('🧪 Testing story creation...\n');

    // Get valid IDs
    const projects = await prisma.project.findMany();
    const storyTypes = await prisma.storyType.findMany();
    const users = await prisma.user.findMany();

    if (projects.length === 0 || storyTypes.length === 0 || users.length === 0) {
      console.log('❌ Missing required data!');
      return;
    }

    const projectId = projects[0].id;
    const storyTypeId = storyTypes[0].id;
    const userId = users[0].id;

    console.log(`Using Project ID: ${projectId}`);
    console.log(`Using StoryType ID: ${storyTypeId}`);
    console.log(`Using User ID: ${userId}\n`);

    // Test story creation
    const story = await prisma.story.create({
      data: {
        title: 'تست استوری',
        content: 'محتوای تست',
        day: '1404-06-16',
        order: 1,
        status: 'DRAFT',
        projectId: projectId,
        storyTypeId: storyTypeId,
        authorId: userId,
      },
      include: {
        project: true,
        storyType: true,
      }
    });

    console.log('✅ Story created successfully!');
    console.log('Story details:', {
      id: story.id,
      title: story.title,
      project: story.project?.name,
      storyType: story.storyType?.name,
    });

  } catch (error) {
    console.error('❌ Error creating story:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStoryCreation();
