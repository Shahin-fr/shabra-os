import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting robust database seeding...');
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('⚠️ Database already contains users. Skipping seeding to avoid duplicates.');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('Password123', 12);

  // Create Admin user (without managerId initially)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      roles: 'ADMIN',
      isActive: true,
    },
  });

  // Create Employee user (without managerId initially)
  const employee = await prisma.user.create({
    data: {
      email: 'employee@example.com',
      firstName: 'Employee',
      lastName: 'User',
      password: hashedPassword,
      roles: 'EMPLOYEE',
      isActive: true,
    },
  });

  // Now try to update the employee with managerId if the column exists
  try {
    await prisma.user.update({
      where: { id: employee.id },
      data: { managerId: admin.id }
    });
    console.log('✅ Updated employee with manager relationship');
  } catch (error) {
    console.log('⚠️ Could not set manager relationship (column may not exist yet):', error instanceof Error ? error.message : String(error));
  }

  console.log('✅ Created users:');
  console.log(`  👤 Admin: ${admin.email} (${admin.firstName} ${admin.lastName})`);
  console.log(`  👤 Employee: ${employee.email} (${employee.firstName} ${employee.lastName})`);
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('  Admin: admin@example.com / Password123');
  console.log('  Employee: employee@example.com / Password123');
  console.log('');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
