const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function fixFrontendIds() {
  try {
    console.log('🔧 Fixing frontend IDs...\n');

    // Get current IDs
    const projects = await prisma.project.findMany();
    const storyTypes = await prisma.storyType.findMany();

    console.log('📁 Available Projects:');
    projects.forEach((p, i) => console.log(`  ${i + 1}. ${p.id}: ${p.name}`));

    console.log('\n📝 Available Story Types:');
    storyTypes.forEach((t, i) => console.log(`  ${i + 1}. ${t.id}: ${t.name}`));

    // Create a mapping file for frontend
    const mapping = {
      projects: projects.map(p => ({ id: p.id, name: p.name })),
      storyTypes: storyTypes.map(t => ({ id: t.id, name: t.name })),
      defaultProject: projects[0]?.id,
      defaultStoryType: storyTypes[0]?.id
    };

    console.log('\n📋 Frontend should use these IDs:');
    console.log('Default Project ID:', mapping.defaultProject);
    console.log('Default Story Type ID:', mapping.defaultStoryType);

    console.log('\n✅ Use these IDs in your frontend!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFrontendIds();
