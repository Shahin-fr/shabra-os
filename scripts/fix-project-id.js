const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function fixProjectId() {
  try {
    console.log('🔧 Fixing project ID issue...\n');

    // Get the first project ID
    const project = await prisma.project.findFirst();
    if (!project) {
      console.log('❌ No projects found!');
      return;
    }

    console.log('📁 Using project:', project.name, 'ID:', project.id);

    // Create a story with the correct project ID
    const story = await prisma.story.create({
      data: {
        title: 'تست استوری',
        content: 'محتوای تست',
        day: '1404-06-16',
        order: 1,
        status: 'DRAFT',
        projectId: project.id,
        storyTypeId: 'cmfa3vtpk0000u3e0v3yx95rd', // متن
        authorId: 'cmfa17mvc0000u31w64dgoid9', // admin user
      }
    });

    console.log('✅ Story created successfully with correct project ID!');
    console.log('Story ID:', story.id);

    // Now let's create a simple API endpoint to get the correct project ID
    console.log('\n📋 Frontend should use this project ID:', project.id);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProjectId();
