import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Fix for Docker connection - use localhost instead of 127.0.0.1
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('127.0.0.1')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('127.0.0.1', 'localhost');
}

// For Docker with trust authentication, we need to use the correct format
// The container uses trust authentication for localhost connections
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  // Use the format that works with trust authentication - try postgres user
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/shabra_os?schema=public';
}

// Debug: Log the DATABASE_URL to see what's being used
console.log('🔍 Seed script DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('🔍 Environment check:');
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  // Reset database first to ensure compatibility
  console.log('🔄 Resetting database for compatibility...');
  
  // Delete all existing data
  await prisma.story.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storyIdea.deleteMany();
  await prisma.storyType.deleteMany();
  await prisma.contentSlot.deleteMany();
  await prisma.project.deleteMany();
  await prisma.document.deleteMany();
  
  console.log('✅ Database reset completed');

  // Create admin user
  console.log('Creating admin user...');
  const adminHashedPassword = await bcrypt.hash('admin-password-123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@shabra.com',
      firstName: 'Admin',
      lastName: 'User',
      password: adminHashedPassword,
      roles: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Admin user created successfully');

  // Create regular user
  console.log('Creating regular user...');
  const userHashedPassword = await bcrypt.hash('user-password-123', 12);
  await prisma.user.create({
    data: {
      email: 'user@shabra.com',
      firstName: 'Regular',
      lastName: 'User',
      password: userHashedPassword,
      roles: 'EMPLOYEE',
      isActive: true,
    },
  });
  console.log('Regular user created successfully');

  // Create checklist templates
  console.log('Creating checklist templates...');
  
  // Get the admin user ID for createdById
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@shabra.com' },
    select: { id: true },
  });

  if (adminUser) {
    // Create onboarding template
    const onboardingTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'فرآیند استخدام جدید',
        type: 'ONBOARDING',
        description: 'چک‌لیست کامل برای فرآیند استخدام کارمند جدید',
        createdById: adminUser.id,
        isActive: true,
      },
    });

    // Create onboarding tasks
    await prisma.checklistTemplateTask.createMany({
      data: [
        {
          templateId: onboardingTemplate.id,
          title: 'تکمیل فرم‌های استخدام',
          description: 'کارمند باید فرم‌های استخدام را تکمیل کند',
          defaultAssigneeRole: 'EMPLOYEE',
          order: 1,
          isRequired: true,
          estimatedDays: 1,
        },
        {
          templateId: onboardingTemplate.id,
          title: 'ارائه مدارک هویتی',
          description: 'ارائه کپی شناسنامه و کارت ملی',
          defaultAssigneeRole: 'EMPLOYEE',
          order: 2,
          isRequired: true,
          estimatedDays: 1,
        },
        {
          templateId: onboardingTemplate.id,
          title: 'تایید مدیر مستقیم',
          description: 'تایید نهایی توسط مدیر مستقیم',
          defaultAssigneeRole: 'MANAGER',
          order: 3,
          isRequired: true,
          estimatedDays: 1,
        },
        {
          templateId: onboardingTemplate.id,
          title: 'تنظیم دسترسی‌های سیستم',
          description: 'ایجاد حساب کاربری و تنظیم دسترسی‌ها',
          defaultAssigneeRole: 'ADMIN',
          order: 4,
          isRequired: true,
          estimatedDays: 1,
        },
      ],
    });

    // Create offboarding template
    const offboardingTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'فرآیند ترک کار',
        type: 'OFFBOARDING',
        description: 'چک‌لیست کامل برای فرآیند ترک کار کارمند',
        createdById: adminUser.id,
        isActive: true,
      },
    });

    // Create offboarding tasks
    await prisma.checklistTemplateTask.createMany({
      data: [
        {
          templateId: offboardingTemplate.id,
          title: 'تسویه حساب مالی',
          description: 'محاسبه و پرداخت حقوق و مزایای باقی‌مانده',
          defaultAssigneeRole: 'ADMIN',
          order: 1,
          isRequired: true,
          estimatedDays: 3,
        },
        {
          templateId: offboardingTemplate.id,
          title: 'تحویل تجهیزات',
          description: 'تحویل لپ‌تاپ، تلفن و سایر تجهیزات شرکت',
          defaultAssigneeRole: 'EMPLOYEE',
          order: 2,
          isRequired: true,
          estimatedDays: 1,
        },
        {
          templateId: offboardingTemplate.id,
          title: 'بازگردانی دسترسی‌ها',
          description: 'غیرفعال کردن دسترسی‌های سیستم و ایمیل',
          defaultAssigneeRole: 'ADMIN',
          order: 3,
          isRequired: true,
          estimatedDays: 1,
        },
        {
          templateId: offboardingTemplate.id,
          title: 'تایید نهایی مدیر',
          description: 'تایید نهایی فرآیند ترک کار توسط مدیر',
          defaultAssigneeRole: 'MANAGER',
          order: 4,
          isRequired: true,
          estimatedDays: 1,
        },
      ],
    });

    console.log('Checklist templates created successfully');
  } else {
    console.log('⚠️ Admin user not found, skipping checklist template creation');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
