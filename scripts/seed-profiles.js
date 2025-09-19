const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

// Fix for Docker connection - use localhost instead of 127.0.0.1 and postgres user
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('127.0.0.1')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('127.0.0.1', 'localhost');
}

// For Docker with trust authentication, use postgres user without password
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5432/shabra_os?schema=public';
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding profile data...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
      },
    });

    console.log(`Found ${users.length} users to create profiles for`);

    // Create profiles for each user
    for (const user of users) {
      // Check if profile already exists
      const existingProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      if (existingProfile) {
        console.log(`Profile already exists for ${user.firstName} ${user.lastName}`);
        continue;
      }

      // Create profile based on user role
      const profileData = {
        userId: user.id,
        jobTitle: getJobTitleByRole(user.roles),
        department: getDepartmentByRole(user.roles),
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
        phoneNumber: generatePhoneNumber(),
        address: generateAddress(),
        emergencyContactName: generateEmergencyContactName(),
        emergencyContactPhone: generatePhoneNumber(),
      };

      await prisma.profile.create({
        data: profileData,
      });

      console.log(`✅ Created profile for ${user.firstName} ${user.lastName}`);
    }

    // Set up manager-subordinate relationships
    await setupManagerSubordinateRelationships(users);

    console.log('🎉 Profile seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding profiles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getJobTitleByRole(role) {
  const jobTitles = {
    ADMIN: ['مدیر سیستم', 'مدیر فنی', 'مدیر ارشد'],
    MANAGER: ['مدیر پروژه', 'مدیر تیم', 'مدیر بخش'],
    EMPLOYEE: ['توسعه‌دهنده', 'طراح', 'تحلیل‌گر', 'کارشناس', 'کارمند'],
  };
  
  const titles = jobTitles[role] || jobTitles.EMPLOYEE;
  return titles[Math.floor(Math.random() * titles.length)];
}

function getDepartmentByRole(role) {
  const departments = {
    ADMIN: ['مدیریت', 'فناوری اطلاعات'],
    MANAGER: ['توسعه', 'طراحی', 'بازاریابی', 'فروش'],
    EMPLOYEE: ['توسعه', 'طراحی', 'بازاریابی', 'فروش', 'پشتیبانی', 'مالی'],
  };
  
  const depts = departments[role] || departments.EMPLOYEE;
  return depts[Math.floor(Math.random() * depts.length)];
}

function generatePhoneNumber() {
  const prefixes = ['0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
}

function generateAddress() {
  const cities = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز'];
  const districts = ['منطقه 1', 'منطقه 2', 'منطقه 3', 'منطقه 4', 'منطقه 5'];
  const streets = ['خیابان اصلی', 'خیابان فرعی', 'کوچه', 'بلوار'];
  
  const city = cities[Math.floor(Math.random() * cities.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  
  return `${city}، ${district}، ${street} ${number}`;
}

function generateEmergencyContactName() {
  const firstNames = ['احمد', 'محمد', 'علی', 'حسن', 'حسین', 'فاطمه', 'زهرا', 'مریم', 'فریبا'];
  const lastNames = ['احمدی', 'محمدی', 'علی‌زاده', 'حسینی', 'رضایی', 'کریمی', 'نوری', 'صادقی'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

async function setupManagerSubordinateRelationships(users) {
  console.log('Setting up manager-subordinate relationships...');
  
  const managers = users.filter(user => user.roles === 'MANAGER' || user.roles === 'ADMIN');
  const employees = users.filter(user => user.roles === 'EMPLOYEE');
  
  if (managers.length === 0 || employees.length === 0) {
    console.log('No managers or employees found for relationships');
    return;
  }
  
  // Assign each employee to a random manager
  for (const employee of employees) {
    const randomManager = managers[Math.floor(Math.random() * managers.length)];
    
    await prisma.user.update({
      where: { id: employee.id },
      data: { managerId: randomManager.id },
    });
    
    console.log(`✅ Assigned ${employee.firstName} ${employee.lastName} to ${randomManager.firstName} ${randomManager.lastName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
