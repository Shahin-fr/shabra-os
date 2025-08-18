import { prisma } from './prisma'

export async function testPrismaClient() {
  try {
    await prisma.$connect()
    
    // Test creating a user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true
      }
    })
    
    console.log('✅ Prisma Client Test Successful')
    console.log('Created user:', user)
    
    // Test finding the user
    const foundUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    console.log('Found user:', foundUser)
    
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('❌ Prisma Client Test Failed:', error)
    return false
  }
}
