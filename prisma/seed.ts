import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  DEFAULT_ADMIN_EMAIL, 
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_MANAGER_EMAIL,
  DEFAULT_USER_EMAIL
} from '../src/lib/config/constants';
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

// Sample data arrays
const departments = ['توسعه', 'طراحی', 'بازاریابی', 'فروش', 'منابع انسانی', 'مالی', 'عملیات'];
const jobTitles = [
  'توسعه‌دهنده ارشد', 'توسعه‌دهنده', 'طراح UI/UX', 'مدیر محصول', 'بازاریاب دیجیتال',
  'فروشنده', 'مدیر منابع انسانی', 'حسابدار', 'مدیر عملیات', 'تحلیلگر داده'
];

const taskTitles = [
  'پیاده‌سازی سیستم احراز هویت', 'طراحی رابط کاربری داشبورد', 'بهینه‌سازی عملکرد پایگاه داده',
  'تست واحدهای کد', 'مستندسازی API', 'پیاده‌سازی سیستم اعلانات', 'طراحی لوگو جدید',
  'تحلیل رقبا', 'برنامه‌ریزی کمپین بازاریابی', 'بررسی درخواست‌های استخدام',
  'محاسبه حقوق و دستمزد', 'بررسی گزارش‌های مالی', 'بهینه‌سازی فرآیندهای عملیاتی',
  'تحلیل داده‌های فروش', 'پیاده‌سازی سیستم گزارش‌گیری', 'تست امنیت سیستم',
  'بررسی کدهای موجود', 'طراحی معماری جدید', 'پیاده‌سازی ویژگی جدید',
  'رفع باگ‌های گزارش شده', 'به‌روزرسانی مستندات', 'آموزش تیم جدید',
  'بررسی عملکرد سرور', 'پیاده‌سازی سیستم بک‌آپ', 'تحلیل نیازهای کاربران',
  'طراحی پایگاه داده جدید', 'پیاده‌سازی سیستم لاگ', 'تست یکپارچگی سیستم',
  'بررسی امنیت شبکه', 'پیاده‌سازی سیستم مانیتورینگ', 'تحلیل عملکرد تیم',
  'طراحی فرآیندهای جدید', 'پیاده‌سازی سیستم اعلان‌رسانی', 'تست قابلیت‌های جدید',
  'بررسی کیفیت کد', 'پیاده‌سازی سیستم کش', 'تحلیل رفتار کاربران'
];

const projectNames = [
  'سیستم مدیریت منابع انسانی', 'پلتفرم تجارت الکترونیک', 'سیستم CRM',
  'اپلیکیشن موبایل', 'پورتال مشتریان', 'سیستم گزارش‌گیری', 'پلتفرم آموزش آنلاین'
];

const announcementTitles = [
  'برگزاری جلسه تیم هفتگی', 'به‌روزرسانی سیاست‌های شرکت', 'برنامه‌ریزی برای تعطیلات نوروزی',
  'راه‌اندازی سیستم جدید حضور و غیاب', 'آموزش امنیت سایبری برای همه کارمندان',
  'تغییرات در ساختار سازمانی', 'برنامه‌ریزی برای کنفرانس سالانه'
];

const announcementContents = [
  'جلسه تیم هفتگی ما هر دوشنبه ساعت ۱۰ صبح برگزار می‌شود. لطفاً حضور به موقع داشته باشید.',
  'سیاست‌های جدید شرکت در مورد کار از راه دور و مرخصی‌ها به‌روزرسانی شده است.',
  'برنامه‌ریزی برای تعطیلات نوروزی آغاز شده است. لطفاً درخواست‌های مرخصی خود را تا پایان ماه ارسال کنید.',
  'سیستم جدید حضور و غیاب از هفته آینده راه‌اندازی می‌شود. آموزش‌های لازم ارائه خواهد شد.',
  'دوره آموزش امنیت سایبری برای همه کارمندان اجباری است. لطفاً در زمان‌های تعیین شده شرکت کنید.',
  'تغییرات جدید در ساختار سازمانی اعلام می‌شود. جزئیات بیشتر در جلسه عمومی ارائه خواهد شد.',
  'کنفرانس سالانه شرکت در تاریخ ۱۵ اسفند برگزار می‌شود. ثبت‌نام تا ۱ اسفند ادامه دارد.'
];

const requestReasons = [
  'درخواست مرخصی برای مسافرت خانوادگی', 'نیاز به مرخصی استعلاجی برای عمل جراحی',
  'درخواست اضافه‌کاری برای تکمیل پروژه', 'درخواست بازپرداخت هزینه‌های سفر کاری',
  'درخواست تجهیزات جدید برای کار', 'درخواست آموزش تخصصی', 'درخواست تغییر ساعت کاری',
  'درخواست مرخصی برای شرکت در کنفرانس', 'درخواست بازپرداخت هزینه‌های درمانی',
  'درخواست تجهیزات امنیتی جدید', 'درخواست مرخصی برای امتحانات دانشگاهی',
  'درخواست اضافه‌کاری برای پروژه فوری', 'درخواست بازپرداخت هزینه‌های آموزشی',
  'درخواست تجهیزات نرم‌افزاری جدید', 'درخواست مرخصی برای عروسی'
];

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
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

  // Check if data already exists to make script idempotent
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('⚠️ Database already contains data. Skipping seeding to avoid duplicates.');
    console.log('✅ Database has been successfully seeded with realistic demo data.');
    return;
  }

  // Reset database first to ensure compatibility
  console.log('🔄 Resetting database for compatibility...');
  
  // Delete all existing data in correct order (respecting foreign key constraints)
  await prisma.employeeChecklist.deleteMany();
  await prisma.checklistTemplateTask.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.employeeDocument.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.request.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.task.deleteMany();
  await prisma.story.deleteMany();
  await prisma.contentSlot.deleteMany();
  await prisma.project.deleteMany();
  await prisma.document.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database reset completed');

  // Create users with hierarchy
  console.log('👥 Creating diverse team...');
  
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  
  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: DEFAULT_ADMIN_EMAIL,
      firstName: 'احمد',
      lastName: 'محمدی',
      password: hashedPassword,
      roles: 'ADMIN',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Create Manager users
  const manager1 = await prisma.user.create({
    data: {
      email: DEFAULT_MANAGER_EMAIL,
      firstName: 'فاطمه',
      lastName: 'احمدی',
      password: hashedPassword,
      roles: 'MANAGER',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@shabra.com',
      firstName: 'علی',
      lastName: 'رضایی',
      password: hashedPassword,
      roles: 'MANAGER',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Create primary employee user first (for testing)
  const primaryEmployee = await prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
      firstName: 'کارمند',
      lastName: 'تست',
      password: hashedPassword,
      roles: 'EMPLOYEE',
      isActive: true,
      managerId: manager1.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Create Employee users
  const employees = [primaryEmployee];
  const employeeData = [
    { firstName: 'مریم', lastName: 'کریمی', email: 'maryam@shabra.com', managerId: manager1.id },
    { firstName: 'حسن', lastName: 'نوری', email: 'hasan@shabra.com', managerId: manager1.id },
    { firstName: 'زهرا', lastName: 'صادقی', email: 'zahra@shabra.com', managerId: manager1.id },
    { firstName: 'محمد', lastName: 'حسینی', email: 'mohammad@shabra.com', managerId: manager1.id },
    { firstName: 'نرگس', lastName: 'موسوی', email: 'narges@shabra.com', managerId: manager1.id },
    { firstName: 'رضا', lastName: 'جعفری', email: 'reza@shabra.com', managerId: manager2.id },
    { firstName: 'سارا', lastName: 'مهدوی', email: 'sara@shabra.com', managerId: manager2.id },
    { firstName: 'امیر', lastName: 'قاسمی', email: 'amir@shabra.com', managerId: manager2.id },
    { firstName: 'لیلا', lastName: 'اکبری', email: 'leila@shabra.com', managerId: manager2.id },
    { firstName: 'حامد', lastName: 'رحمانی', email: 'hamed@shabra.com', managerId: manager2.id },
    { firstName: 'مینا', lastName: 'فرهادی', email: 'mina@shabra.com', managerId: manager1.id },
    { firstName: 'بابک', lastName: 'کاظمی', email: 'babak@shabra.com', managerId: manager2.id },
  ];

  for (const emp of employeeData) {
    const employee = await prisma.user.create({
      data: {
        ...emp,
        password: hashedPassword,
        roles: 'EMPLOYEE',
        isActive: true,
        avatar: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=150&h=150&fit=crop&crop=face`,
      },
    });
    employees.push(employee);
  }

  console.log(`✅ Created ${employees.length + 3} users (1 Admin, 2 Managers, ${employees.length} Employees)`);

  // Create profiles for all users
  console.log('👤 Creating user profiles...');
  const allUsers = [admin, manager1, manager2, ...employees];
  
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    if (!user) continue;
    await prisma.profile.create({
      data: {
        userId: user.id,
        jobTitle: jobTitles[i % jobTitles.length],
        department: departments[i % departments.length],
        startDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        phoneNumber: `09${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: `تهران، منطقه ${Math.floor(Math.random() * 22) + 1}`,
        emergencyContactName: `تماس اضطراری ${user.firstName}`,
        emergencyContactPhone: `09${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      },
    });
  }

  // Create work schedules for all users
  console.log('📅 Creating work schedules...');
  for (const user of allUsers) {
    await prisma.workSchedule.create({
      data: {
        userId: user.id,
        saturday: true,
        sunday: true,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    });
  }

  // Create projects
  console.log('📁 Creating projects...');
  const projects = [];
  for (const projectName of projectNames) {
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: `پروژه ${projectName} برای بهبود فرآیندهای شرکت`,
        status: 'ACTIVE',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        accessLevel: 'PRIVATE',
      },
    });
    projects.push(project);
  }

  // Create realistic tasks
  console.log('📋 Creating realistic tasks...');
  const today = new Date();
  const tasks = [];
  
  for (let i = 0; i < 35; i++) {
    const taskTitle = taskTitles[i % taskTitles.length] || `وظیفه ${i + 1}`;
    const assignee = employees[Math.floor(Math.random() * employees.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    if (!assignee || !project) {
      console.warn('Skipping task creation - missing assignee or project');
      continue;
    }
    
    // Create tasks with different statuses and due dates
    let status, dueDate;
    const statusRand = Math.random();
    
    if (statusRand < 0.3) {
      status = 'DONE';
      dueDate = new Date(today.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    } else if (statusRand < 0.6) {
      status = 'IN_PROGRESS';
      dueDate = new Date(today.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
    } else {
      status = 'TODO';
      // Create some "Tasks at Risk" - overdue or due soon
      if (i < 5) {
        // Overdue tasks
        dueDate = new Date(today.getTime() - Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000);
      } else if (i < 8) {
        // Due in next 1-2 days
        dueDate = new Date(today.getTime() + Math.floor(Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
      } else {
        // Normal future tasks
        dueDate = new Date(today.getTime() + Math.floor(Math.random() * 14 + 3) * 24 * 60 * 60 * 1000);
      }
    }

    const task = await prisma.task.create({
      data: {
        title: taskTitle,
        description: `توضیحات کامل برای ${taskTitle}`,
        status: status,
        dueDate: dueDate,
        createdBy: Math.random() < 0.7 ? manager1.id : manager2.id,
        assignedTo: assignee.id,
        projectId: project.id,
      },
    });
    tasks.push(task);
  }

  console.log(`✅ Created ${tasks.length} tasks with realistic statuses and due dates`);

  // Create attendance records for the past week
  console.log('⏰ Creating attendance records...');
  for (const employee of employees) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Skip weekends (Friday = 5, Saturday = 6 in JavaScript)
      if (dayOfWeek === 5 || dayOfWeek === 6) continue;
      
      // 80% chance of attendance
      if (Math.random() < 0.8) {
        const checkIn = new Date(date);
        checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        
        const checkOut = new Date(checkIn);
        checkOut.setHours(16 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
        
        await prisma.attendance.create({
          data: {
            userId: employee.id,
            checkIn: checkIn,
            checkOut: checkOut,
          },
        });
      }
    }
  }

  // Create some current day attendance (for Team Presence widget)
  const currentDayEmployees = employees.slice(0, 6); // 6 employees clocked in today
  for (const employee of currentDayEmployees) {
    const checkIn = new Date();
    checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
    
    await prisma.attendance.create({
      data: {
        userId: employee.id,
        checkIn: checkIn,
        // No checkOut for current day (still clocked in)
      },
    });
  }

  console.log('✅ Created attendance records for past week and current day');

  // Create leave requests for current day (for Team Presence widget)
  console.log('🏖️ Creating leave requests...');
  const leaveEmployees = employees.slice(6, 8); // 2 employees on leave today
  for (const employee of leaveEmployees) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    await prisma.leaveRequest.create({
      data: {
        userId: employee.id,
        leaveType: ['ANNUAL', 'SICK', 'EMERGENCY'][Math.floor(Math.random() * 3)],
        startDate: startDate,
        endDate: endDate,
        reason: requestReasons[Math.floor(Math.random() * requestReasons.length)] || 'درخواست عمومی',
        status: 'APPROVED',
        reviewedBy: Math.random() < 0.5 ? manager1.id : manager2.id,
        reviewedAt: new Date(),
      },
    });
  }

  // Create pending leave requests (for Action Center)
  const pendingLeaveEmployees = employees.slice(8, 10); // 2 employees with pending leave requests
  for (const employee of pendingLeaveEmployees) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
    
    await prisma.leaveRequest.create({
      data: {
        userId: employee.id,
        leaveType: ['ANNUAL', 'SICK', 'EMERGENCY'][Math.floor(Math.random() * 3)],
        startDate: startDate,
        endDate: endDate,
        reason: requestReasons[Math.floor(Math.random() * requestReasons.length)] || 'درخواست عمومی',
        status: 'PENDING',
      },
    });
  }

  console.log('✅ Created leave requests (some approved for today, some pending)');

  // Create various requests (for Action Center)
  console.log('📝 Creating requests...');
  const requestTypes = ['LEAVE', 'OVERTIME', 'EXPENSE_CLAIM', 'GENERAL'];
  const requestStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  
  for (let i = 0; i < 20; i++) {
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const type = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    const status = requestStatuses[Math.floor(Math.random() * requestStatuses.length)];
    
    if (!employee) {
      console.warn('Skipping request creation - no employee available');
      continue;
    }
    
    let reviewedBy = null;
    let reviewedAt = null;
    
    if (status !== 'PENDING') {
      reviewedBy = Math.random() < 0.5 ? manager1.id : manager2.id;
      reviewedAt = new Date();
    }
    
    await prisma.request.create({
      data: {
        userId: employee.id,
        type: type,
        reason: requestReasons[Math.floor(Math.random() * requestReasons.length)] || 'درخواست عمومی',
        status: status,
        reviewedBy: reviewedBy,
        reviewedAt: reviewedAt,
        details: {
          amount: type === 'EXPENSE_CLAIM' ? Math.floor(Math.random() * 1000000) + 100000 : null,
          hours: type === 'OVERTIME' ? Math.floor(Math.random() * 20) + 5 : null,
        },
      },
    });
  }

  console.log('✅ Created 20 requests with mixed statuses');

  // Create announcements
  console.log('📢 Creating announcements...');
  for (let i = 0; i < announcementTitles.length; i++) {
    await prisma.announcement.create({
      data: {
        title: announcementTitles[i] || `اعلان ${i + 1}`,
        content: announcementContents[i] || `محتوای اعلان ${i + 1}`,
        category: ['GENERAL', 'TECHNICAL', 'EVENT', 'IMPORTANT'][Math.floor(Math.random() * 4)],
        isPinned: i < 2, // First 2 announcements are pinned
        authorId: Math.random() < 0.5 ? manager1.id : manager2.id,
      },
    });
  }

  console.log('✅ Created announcements');

  // Create content slots for calendar events
  console.log('📅 Creating content slots...');
  const eventTypes = ['MEETING', 'EVENT', 'DEADLINE'];
  for (let i = 0; i < 10; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 4) + 1);
    
    await prisma.contentSlot.create({
      data: {
        title: `رویداد ${i + 1}`,
        description: `توضیحات رویداد ${i + 1}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        startDate: startDate,
        endDate: endDate,
        projectId: projects[Math.floor(Math.random() * projects.length)]?.id || projects[0]?.id,
      },
    });
  }

  console.log('✅ Created content slots for calendar events');

  // Create checklist templates
  console.log('📋 Creating checklist templates...');
  
  // Create onboarding template
  const onboardingTemplate = await prisma.checklistTemplate.create({
    data: {
      name: 'فرآیند استخدام جدید',
      type: 'ONBOARDING',
      description: 'چک‌لیست کامل برای فرآیند استخدام کارمند جدید',
      createdById: admin.id,
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
      createdById: admin.id,
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

  console.log('✅ Created checklist templates');

  // Create specific data for primary employee (employee@shabra.com)
  console.log('🎯 Creating specific data for primary employee...');
  
  // Create 5 tasks specifically for the primary employee
  const primaryEmployeeTasks = [
    {
      title: 'تکمیل گزارش ماهانه',
      description: 'تهیه و ارسال گزارش عملکرد ماهانه',
      status: 'InProgress',
      dueDate: new Date(), // Due today
      createdBy: manager1.id,
      assignedTo: primaryEmployee.id,
      projectId: projects[0]?.id,
    },
    {
      title: 'بررسی درخواست‌های مشتریان',
      description: 'پاسخ به درخواست‌های دریافتی از مشتریان',
      status: 'Todo',
      dueDate: new Date(), // Due today
      createdBy: manager1.id,
      assignedTo: primaryEmployee.id,
      projectId: projects[1]?.id,
    },
    {
      title: 'آپدیت مستندات پروژه',
      description: 'به‌روزرسانی مستندات فنی پروژه',
      status: 'Todo',
      dueDate: new Date(), // Due today
      createdBy: manager1.id,
      assignedTo: primaryEmployee.id,
      projectId: projects[2]?.id,
    },
    {
      title: 'تست عملکرد سیستم',
      description: 'اجرای تست‌های عملکردی سیستم جدید',
      status: 'Done',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      createdBy: manager1.id,
      assignedTo: primaryEmployee.id,
      projectId: projects[0]?.id,
    },
    {
      title: 'آماده‌سازی ارائه هفتگی',
      description: 'تهیه اسلایدهای ارائه هفتگی تیم',
      status: 'Todo',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      createdBy: manager1.id,
      assignedTo: primaryEmployee.id,
      projectId: projects[1]?.id,
    },
  ];

  for (const taskData of primaryEmployeeTasks) {
    await prisma.task.create({
      data: taskData,
    });
  }

  // Create a pending leave request for primary employee
  await prisma.leaveRequest.create({
    data: {
      userId: primaryEmployee.id,
      leaveType: 'ANNUAL',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 2 days later
      reason: 'مسافرت خانوادگی برای تعطیلات',
      status: 'PENDING',
    },
  });

  // Create a general request for primary employee
  await prisma.request.create({
    data: {
      userId: primaryEmployee.id,
      type: 'EXPENSE_CLAIM',
      reason: 'بازپرداخت هزینه‌های سفر کاری',
      status: 'PENDING',
      details: {
        amount: 500000,
        description: 'هزینه‌های حمل و نقل و اقامت',
      },
    },
  });

  // Create attendance record for primary employee (yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(8, 30, 0, 0);
  
  const yesterdayCheckOut = new Date(yesterday);
  yesterdayCheckOut.setHours(17, 15, 0, 0);

  await prisma.attendance.create({
    data: {
      userId: primaryEmployee.id,
      checkIn: yesterday,
      checkOut: yesterdayCheckOut,
    },
  });

  // Create work schedule for primary employee
  await prisma.workSchedule.create({
    data: {
      userId: primaryEmployee.id,
      saturday: true,
      sunday: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
    },
  });

  // Create profile for primary employee
  await prisma.profile.create({
    data: {
      userId: primaryEmployee.id,
      jobTitle: 'توسعه‌دهنده',
      department: 'توسعه',
      startDate: new Date(2023, 5, 1),
      phoneNumber: '09123456789',
      address: 'تهران، منطقه ۱۲',
      emergencyContactName: 'تماس اضطراری کارمند',
      emergencyContactPhone: '09123456788',
    },
  });

  console.log('✅ Created specific data for primary employee');

  // Create sample meetings for testing the NextUpWidget
  const now = new Date();
  const todayForMeetings = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Meeting 1: Today at 2:00 PM
  const meeting1Start = new Date(todayForMeetings);
  meeting1Start.setHours(14, 0, 0, 0);
  const meeting1End = new Date(todayForMeetings);
  meeting1End.setHours(15, 0, 0, 0);

  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'جلسه تیم توسعه',
      creatorId: primaryEmployee.id,
      startTime: meeting1Start,
      endTime: meeting1End,
      type: 'TEAM_MEETING',
      status: 'SCHEDULED',
      notes: 'بررسی پیشرفت پروژه و برنامه‌ریزی هفته آینده',
    },
  });

  // Add attendees to meeting 1
  const meeting1Attendees = [
    { meetingId: meeting1.id, userId: primaryEmployee.id },
  ];
  
  if (employees.length > 0) {
    meeting1Attendees.push({ meetingId: meeting1.id, userId: employees[0].id });
  }
  if (employees.length > 1) {
    meeting1Attendees.push({ meetingId: meeting1.id, userId: employees[1].id });
  }
  
  await prisma.meetingAttendee.createMany({
    data: meeting1Attendees,
  });

  // Meeting 2: Tomorrow at 10:00 AM
  const tomorrow = new Date(todayForMeetings);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const meeting2Start = new Date(tomorrow);
  meeting2Start.setHours(10, 0, 0, 0);
  const meeting2End = new Date(tomorrow);
  meeting2End.setHours(11, 0, 0, 0);

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'جلسه یک به یک با مدیر',
      creatorId: primaryEmployee.id,
      startTime: meeting2Start,
      endTime: meeting2End,
      type: 'ONE_ON_ONE',
      status: 'SCHEDULED',
      notes: 'بررسی عملکرد و اهداف فردی',
    },
  });

  // Add attendees to meeting 2
  await prisma.meetingAttendee.createMany({
    data: [
      { meetingId: meeting2.id, userId: primaryEmployee.id },
      { meetingId: meeting2.id, userId: manager1.id },
    ],
  });

  // Meeting 3: Next week
  const nextWeek = new Date(todayForMeetings);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const meeting3Start = new Date(nextWeek);
  meeting3Start.setHours(9, 0, 0, 0);
  const meeting3End = new Date(nextWeek);
  meeting3End.setHours(10, 30, 0, 0);

  const meeting3 = await prisma.meeting.create({
    data: {
      title: 'جلسه بررسی پروژه',
      creatorId: primaryEmployee.id,
      startTime: meeting3Start,
      endTime: meeting3End,
      type: 'TEAM_MEETING',
      status: 'SCHEDULED',
      notes: 'بررسی وضعیت پروژه و تعیین اهداف جدید',
    },
  });

  // Add attendees to meeting 3
  const meeting3Attendees = [
    { meetingId: meeting3.id, userId: primaryEmployee.id },
  ];
  
  if (employees.length > 2) {
    meeting3Attendees.push({ meetingId: meeting3.id, userId: employees[2].id });
  }
  if (employees.length > 3) {
    meeting3Attendees.push({ meetingId: meeting3.id, userId: employees[3].id });
  }
  
  await prisma.meetingAttendee.createMany({
    data: meeting3Attendees,
  });

  console.log('✅ Created sample meetings for testing');

  console.log('🎉 Database seeding completed successfully!');
  console.log('✅ Database has been successfully seeded with realistic demo data.');
  console.log('');
  console.log('📊 Summary of created data:');
  console.log(`  👥 Users: ${allUsers.length} (1 Admin, 2 Managers, ${employees.length} Employees)`);
  console.log(`  📋 Tasks: ${tasks.length} (with realistic statuses and due dates)`);
  console.log(`  📁 Projects: ${projects.length}`);
  console.log(`  ⏰ Attendance: Past week + current day records`);
  console.log(`  🏖️ Leave Requests: Some approved for today, some pending`);
  console.log(`  📝 Requests: 20 with mixed statuses`);
  console.log(`  📢 Announcements: ${announcementTitles.length}`);
  console.log(`  📅 Content Slots: 10 calendar events`);
  console.log(`  📋 Checklist Templates: 2 (onboarding/offboarding)`);
  console.log(`  🤝 Meetings: 3 sample meetings (today, tomorrow, next week)`);
  console.log('');
  console.log('🚀 Your dashboards are now ready with realistic demo data!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });