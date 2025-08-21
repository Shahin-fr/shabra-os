import { prisma } from './prisma'

export async function testPrismaClient() {
  try {
    await prisma.$connect()
    
    // Test creating a user
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        isActive: true
      }
    })
    
    // Test finding the user
    await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    await prisma.$disconnect()
    return true
  } catch {
    return false
  }
}
