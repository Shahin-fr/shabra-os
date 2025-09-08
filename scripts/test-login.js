const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testLogin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing login...');
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: 'admin@shabra.com' },
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isActive: user.isActive,
      hasPassword: !!user.password
    });
    
    // Test password
    const testPassword = 'admin-password-123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔐 Password test:', {
      testPassword,
      isValid: isPasswordValid
    });
    
    // Test with different password
    const testPassword2 = 'admin-password-123';
    const isPasswordValid2 = await bcrypt.compare(testPassword2, user.password);
    
    console.log('🔐 Password test 2:', {
      testPassword2,
      isValid2: isPasswordValid2
    });
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();