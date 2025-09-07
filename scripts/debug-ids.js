const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function debugIds() {
  try {
    console.log('🔍 Checking database IDs...\n');

    // Check projects
    const projects = await prisma.project.findMany();
    console.log('📁 Projects:');
    projects.forEach(p => console.log(`  - ${p.id}: ${p.name}`));

    // Check story types
    const storyTypes = await prisma.storyType.findMany();
    console.log('\n📝 Story Types:');
    storyTypes.forEach(t => console.log(`  - ${t.id}: ${t.name}`));

    // Check users
    const users = await prisma.user.findMany();
    console.log('\n👥 Users:');
    users.forEach(u => console.log(`  - ${u.id}: ${u.email}`));

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugIds();
