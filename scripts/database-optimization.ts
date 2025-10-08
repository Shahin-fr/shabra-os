#!/usr/bin/env tsx

/**
 * Simple Database Optimization Script
 * Adds essential indexes for better query performance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database optimization...');

  try {
    // Add essential composite indexes
    console.log('📊 Adding composite indexes...');

    await prisma.$executeRaw`
      -- Projects: Status + Date range queries
      CREATE INDEX IF NOT EXISTS idx_projects_status_dates 
      ON projects (status, start_date, end_date);
    `;

    await prisma.$executeRaw`
      -- Documents: Author + Type + Public for user document queries
      CREATE INDEX IF NOT EXISTS idx_documents_author_type_public 
      ON documents (author_id, type, is_public);
    `;

    await prisma.$executeRaw`
      -- Attendance: User + Date range queries
      CREATE INDEX IF NOT EXISTS idx_attendances_user_date 
      ON attendances (user_id, check_in);
    `;

    await prisma.$executeRaw`
      -- Meeting attendees: Meeting + User for attendee queries
      CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_user 
      ON meeting_attendees (meeting_id, user_id);
    `;

    // Update table statistics
    console.log('📈 Updating table statistics...');

    const tables = ['users', 'projects', 'tasks', 'stories', 'documents', 'meetings', 'leave_requests'];

    for (const table of tables) {
      try {
        await prisma.$executeRaw`ANALYZE ${Prisma.raw(table)};`;
        console.log(`  ✅ Analyzed ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Skipped ${table} (table may not exist)`);
      }
    }

    console.log('✅ Database optimization completed successfully!');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the optimization
main()
  .catch((error) => {
    console.error('Fatal error during database optimization:', error);
    process.exit(1);
  });
