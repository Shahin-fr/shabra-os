import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedProductionDatabase() {
  try {
    console.log('🌱 Seeding production database...\n');

    // Test database connection first
    console.log('1. Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Check if users already exist
    console.log('2. Checking existing users...');
    const existingUsers = await prisma.user.findMany({
      select: { email: true, roles: true },
    });

    if (existingUsers.length > 0) {
      console.log(`   Found ${existingUsers.length} existing user(s):`);
      existingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.roles})`);
      });
      console.log('');
    }

    // Create admin user
    console.log('3. Creating/updating admin user...');
    const adminEmail = 'admin@shabra.com';
    const adminPassword = 'admin-password-123';
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`   ✅ Admin user already exists: ${adminEmail}`);
    } else {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          email: adminEmail,
          firstName: 'Admin',
          lastName: 'User',
          password: hashedAdminPassword,
          roles: 'ADMIN',
          isActive: true,
        },
      });
      console.log(`   ✅ Admin user created: ${adminEmail}`);
    }

    // Create regular user
    console.log('4. Creating/updating regular user...');
    const userEmail = 'user@shabra.com';
    const userPassword = 'user-password-123';
    
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      console.log(`   ✅ Regular user already exists: ${userEmail}`);
    } else {
      const hashedUserPassword = await bcrypt.hash(userPassword, 12);
      await prisma.user.create({
        data: {
          email: userEmail,
          firstName: 'Regular',
          lastName: 'User',
          password: hashedUserPassword,
          roles: 'EMPLOYEE',
          isActive: true,
        },
      });
      console.log(`   ✅ Regular user created: ${userEmail}`);
    }

    // Create manager user
    console.log('5. Creating/updating manager user...');
    const managerEmail = 'manager@shabra.com';
    const managerPassword = 'manager-password-123';
    
    const existingManager = await prisma.user.findUnique({
      where: { email: managerEmail },
    });

    if (existingManager) {
      console.log(`   ✅ Manager user already exists: ${managerEmail}`);
    } else {
      const hashedManagerPassword = await bcrypt.hash(managerPassword, 12);
      await prisma.user.create({
        data: {
          email: managerEmail,
          firstName: 'Manager',
          lastName: 'User',
          password: hashedManagerPassword,
          roles: 'MANAGER',
          isActive: true,
        },
      });
      console.log(`   ✅ Manager user created: ${managerEmail}`);
    }

    // Verify all users
    console.log('\n6. Verifying all users...');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        isActive: true,
      },
    });

    console.log(`   Total users: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`      📧 Email: ${user.email}`);
      console.log(`      🔑 Roles: ${user.roles}`);
      console.log(`      ✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
    });

    console.log('\n✅ Production database seeded successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('   Admin:   admin@shabra.com / admin-password-123');
    console.log('   User:    user@shabra.com / user-password-123');
    console.log('   Manager: manager@shabra.com / manager-password-123');

  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    console.log('\n🔧 Possible solutions:');
    console.log('   1. Check PRISMA_DATABASE_URL environment variable');
    console.log('   2. Verify database connection string');
    console.log('   3. Check if database is accessible');
    console.log('   4. Run database migrations: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

seedProductionDatabase();
