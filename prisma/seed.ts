import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Hash the password
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shabra.com' },
    update: {},
    create: {
      email: 'admin@shabra.com',
      password: hashedPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      isActive: true,
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create admin role for the user
  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: adminUser.id,
        role: 'admin',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'admin',
    },
  });

  console.log('Admin role assigned to:', adminUser.email);

  // Create a regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@shabra.com' },
    update: {},
    create: {
      email: 'user@shabra.com',
      password: hashedPassword, // Same password for testing
      firstName: 'کاربر',
      lastName: 'عادی',
      isActive: true,
    },
  });

  console.log('Regular user created:', regularUser.email);

  // Create user role for the regular user
  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: regularUser.id,
        role: 'employee',
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      role: 'employee',
    },
  });

  console.log('Employee role assigned to:', regularUser.email);

  // Create sample projects
  const projects = [
    {
      name: 'توسعه وب سایت شرکت',
      description: 'طراحی و توسعه وب سایت جدید برای شرکت با استفاده از تکنولوژی‌های مدرن',
      status: 'active',
    },
    {
      name: 'سیستم مدیریت مشتریان',
      description: 'پیاده‌سازی سیستم CRM برای مدیریت بهتر مشتریان و فروش',
      status: 'active',
    },
    {
      name: 'اپلیکیشن موبایل',
      description: 'توسعه اپلیکیشن موبایل برای iOS و Android',
      status: 'on-hold',
    },
    {
      name: 'بهینه‌سازی پایگاه داده',
      description: 'بهینه‌سازی عملکرد پایگاه داده و بهبود سرعت سیستم',
      status: 'completed',
    },
  ];

  for (const projectData of projects) {
    await prisma.project.create({
      data: projectData,
    });
  }

  console.log('Sample projects created successfully!');

  // Create sample tasks for the first project
  const firstProject = await prisma.project.findFirst({
    where: { name: 'توسعه وب سایت شرکت' }
  });

  if (firstProject) {
    const tasks = [
      {
        title: 'طراحی رابط کاربری',
        description: 'طراحی UI/UX برای صفحات اصلی سایت',
        status: 'PENDING' as const,
        priority: 'high',
        projectId: firstProject.id,
      },
      {
        title: 'پیاده‌سازی فرانت‌اند',
        description: 'توسعه صفحات با React و Next.js',
        status: 'IN_PROGRESS' as const,
        priority: 'high',
        projectId: firstProject.id,
      },
      {
        title: 'تست عملکرد',
        description: 'تست سرعت و عملکرد سایت',
        status: 'COMPLETED' as const,
        priority: 'medium',
        projectId: firstProject.id,
      },
      {
        title: 'بهینه‌سازی SEO',
        description: 'بهینه‌سازی برای موتورهای جستجو',
        status: 'PENDING' as const,
        priority: 'medium',
        projectId: firstProject.id,
      },
    ];

    for (const taskData of tasks) {
      await prisma.task.create({
        data: taskData,
      });
    }

    console.log('Sample tasks created successfully!');
  }

  // Create story types
  const storyTypes = [
    "سلام و صبح بخیر",
    "معرفی محصول",
    "اعلام ساعت کاری",
    "خدمات پیرسینگ",
    "فضای داخلی فروشگاه",
    "وارم آپ",
    "اتمام موجودی"
  ];

  for (const storyTypeName of storyTypes) {
    await prisma.storyType.upsert({
      where: { name: storyTypeName },
      update: {},
      create: {
        name: storyTypeName,
      },
    });
  }

  console.log('Story types created successfully!');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
