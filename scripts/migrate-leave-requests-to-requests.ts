import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLeaveRequestsToRequests() {
  console.log('Starting migration of LeaveRequest data to Request model...');

  try {
    // Get all existing leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        user: true,
        reviewer: true,
      },
    });

    console.log(`Found ${leaveRequests.length} leave requests to migrate`);

    // Migrate each leave request to the new Request model
    for (const leaveRequest of leaveRequests) {
      const requestDetails = {
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
      };

      await prisma.request.create({
        data: {
          userId: leaveRequest.userId,
          type: 'LEAVE',
          details: requestDetails,
          reason: leaveRequest.reason,
          status: leaveRequest.status as any, // Map LeaveStatus to RequestStatus
          rejectionReason: leaveRequest.rejectionReason,
          reviewedBy: leaveRequest.reviewedBy,
          reviewedAt: leaveRequest.reviewedAt,
          createdAt: leaveRequest.createdAt,
          updatedAt: leaveRequest.updatedAt,
        },
      });

      console.log(`Migrated leave request ${leaveRequest.id} for user ${leaveRequest.user.firstName} ${leaveRequest.user.lastName}`);
    }

    console.log('Migration completed successfully!');
    console.log(`Migrated ${leaveRequests.length} leave requests to the new Request model`);

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateLeaveRequestsToRequests()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
