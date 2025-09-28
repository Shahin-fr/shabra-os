const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting wiki seeding...');

  // Find the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!adminUser) {
    console.log('Admin user not found. Please run the main seed script first.');
    return;
  }

  // Create sample wiki documents
  const sampleDocuments = [
    {
      title: 'راهنمای شروع کار',
      content:
        '# راهنمای شروع کار\n\nاین یک سند نمونه برای شروع کار با سیستم است.\n\n## بخش اول\n\nمحتوای نمونه...',
      type: 'DOCUMENT',
      isPublic: true,
    },
    {
      title: 'قوانین و مقررات',
      content:
        '# قوانین و مقررات\n\nاین سند شامل قوانین و مقررات شرکت است.\n\n## بخش اول\n\nمحتوای نمونه...',
      type: 'DOCUMENT',
      isPublic: true,
    },
    {
      title: 'پروژه‌های نمونه',
      content:
        '# پروژه‌های نمونه\n\nاین سند شامل اطلاعات پروژه‌های نمونه است.\n\n## بخش اول\n\nمحتوای نمونه...',
      type: 'DOCUMENT',
      isPublic: true,
    },
  ];

  for (const doc of sampleDocuments) {
    // Check if document already exists
    const existingDoc = await prisma.document.findFirst({
      where: { title: doc.title },
    });

    if (!existingDoc) {
      await prisma.document.create({
        data: {
          ...doc,
          authorId: adminUser.id,
        },
      });
      console.log(`Created document: ${doc.title}`);
    } else {
      console.log(`Document already exists: ${doc.title}`);
    }
  }

  console.log('Wiki seeding completed!');
}

main()
  .catch(e => {
    console.error('Error during wiki seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
