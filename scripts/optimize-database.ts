#!/usr/bin/env tsx

/**
 * Database Optimization Script
 * Adds missing indexes, optimizes table structures, and implements performance improvements
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database optimization...');

  try {
    // 1. Add missing composite indexes for better query performance
    console.log('📊 Adding composite indexes...');

    await prisma.$executeRaw`
      -- Projects: Status + Date range queries
      CREATE INDEX IF NOT EXISTS idx_projects_status_dates 
      ON projects (status, start_date, end_date);
    `;

    await prisma.$executeRaw`
      -- Projects: Access level + status for filtering
      CREATE INDEX IF NOT EXISTS idx_projects_access_status 
      ON projects (access_level, status);
    `;

    await prisma.$executeRaw`
      -- Stories: Project + Day + Status for storyboard queries
      CREATE INDEX IF NOT EXISTS idx_stories_project_day_status 
      ON stories (project_id, day, status);
    `;

    await prisma.$executeRaw`
      -- Stories: Story type + Day for type-based filtering
      CREATE INDEX IF NOT EXISTS idx_stories_type_day 
      ON stories (story_type_id, day);
    `;

    await prisma.$executeRaw`
      -- Tasks: Project + Status + Priority for project task views
      CREATE INDEX IF NOT EXISTS idx_tasks_project_status_priority 
      ON tasks (project_id, status, priority);
    `;

    await prisma.$executeRaw`
      -- Tasks: Assigned user + Status for user task views
      CREATE INDEX IF NOT EXISTS idx_tasks_user_status 
      ON tasks (assigned_to, status);
    `;

    await prisma.$executeRaw`
      -- Tasks: Due date + Status for overdue task queries
      CREATE INDEX IF NOT EXISTS idx_tasks_due_status 
      ON tasks (due_date, status);
    `;

    await prisma.$executeRaw`
      -- Documents: Author + Type + Public for user document queries
      CREATE INDEX IF NOT EXISTS idx_documents_author_type_public 
      ON documents (author_id, type, is_public);
    `;

    await prisma.$executeRaw`
      -- Documents: Parent + Type for nested document queries
      CREATE INDEX IF NOT EXISTS idx_documents_parent_type 
      ON documents (parent_id, type);
    `;

    await prisma.$executeRaw`
      -- Leave requests: User + Status + Date range for approval queries
      CREATE INDEX IF NOT EXISTS idx_leave_requests_user_status_dates 
      ON leave_requests (user_id, status, start_date, end_date);
    `;

    await prisma.$executeRaw`
      -- Attendance: User + Date range for time tracking queries
      CREATE INDEX IF NOT EXISTS idx_attendance_user_dates 
      ON attendances (user_id, clock_in, clock_out);
    `;

    // 2. Add partial indexes for active records
    console.log('🎯 Adding partial indexes...');

    await prisma.$executeRaw`
      -- Active projects only
      CREATE INDEX IF NOT EXISTS idx_projects_active 
      ON projects (created_at) 
      WHERE status = 'ACTIVE';
    `;

    await prisma.$executeRaw`
      -- Active users only
      CREATE INDEX IF NOT EXISTS idx_users_active 
      ON users (created_at) 
      WHERE is_active = true;
    `;

    await prisma.$executeRaw`
      -- Pending tasks only
      CREATE INDEX IF NOT EXISTS idx_tasks_pending 
      ON tasks (due_date) 
      WHERE status = 'pending';
    `;

    // 3. Add text search indexes for better search performance
    console.log('🔍 Adding text search indexes...');

    await prisma.$executeRaw`
      -- Project name search
      CREATE INDEX IF NOT EXISTS idx_projects_name_gin 
      ON projects USING gin (to_tsvector('english', name));
    `;

    await prisma.$executeRaw`
      -- Story title search
      CREATE INDEX IF NOT EXISTS idx_stories_title_gin 
      ON stories USING gin (to_tsvector('english', title));
    `;

    await prisma.$executeRaw`
      -- Task title search
      CREATE INDEX IF NOT EXISTS idx_tasks_title_gin 
      ON tasks USING gin (to_tsvector('english', title));
    `;

    await prisma.$executeRaw`
      -- Document title search
      CREATE INDEX IF NOT EXISTS idx_documents_title_gin 
      ON documents USING gin (to_tsvector('english', title));
    `;

    // 4. Add function-based indexes for date queries
    console.log('📅 Adding function-based indexes...');

    await prisma.$executeRaw`
      -- Stories by week (for weekly views)
      CREATE INDEX IF NOT EXISTS idx_stories_week 
      ON stories (date_trunc('week', day));
    `;

    await prisma.$executeRaw`
      -- Stories by month (for monthly views)
      CREATE INDEX IF NOT EXISTS idx_stories_month 
      ON stories (date_trunc('month', day));
    `;

    await prisma.$executeRaw`
      -- Tasks by week (for weekly planning)
      CREATE INDEX IF NOT EXISTS idx_tasks_week 
      ON tasks (date_trunc('week', due_date));
    `;

    // 5. Optimize table statistics
    console.log('📈 Updating table statistics...');

    await prisma.$executeRaw`ANALYZE projects;`;
    await prisma.$executeRaw`ANALYZE stories;`;
    await prisma.$executeRaw`ANALYZE tasks;`;
    await prisma.$executeRaw`ANALYZE users;`;
    await prisma.$executeRaw`ANALYZE documents;`;
    await prisma.$executeRaw`ANALYZE leave_requests;`;
    await prisma.$executeRaw`ANALYZE attendances;`;

    // 6. Add database-level optimizations
    console.log('⚡ Adding database optimizations...');

    // Set work_mem for better sort performance
    await prisma.$executeRaw`SET work_mem = '256MB';`;

    // Set shared_buffers for better caching
    await prisma.$executeRaw`SET shared_buffers = '256MB';`;

    // Set effective_cache_size for query planning
    await prisma.$executeRaw`SET effective_cache_size = '1GB';`;

    // 7. Create materialized views for complex queries
    console.log('🏗️ Creating materialized views...');

    await prisma.$executeRaw`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_summary AS
      SELECT 
        p.id,
        p.name,
        p.status,
        p.created_at,
        COUNT(s.id) as story_count,
        COUNT(t.id) as task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks
      FROM projects p
      LEFT JOIN stories s ON p.id = s.project_id
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id, p.name, p.status, p.created_at;
    `;

    await prisma.$executeRaw`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_activity AS
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(d.id) as total_documents,
        COUNT(lr.id) as total_leave_requests,
        MAX(a.clock_in) as last_attendance
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      LEFT JOIN documents d ON u.id = d.author_id
      LEFT JOIN leave_requests lr ON u.id = lr.user_id
      LEFT JOIN attendances a ON u.id = a.user_id
      GROUP BY u.id, u.first_name, u.last_name;
    `;

    // 8. Create indexes on materialized views
    console.log('🔗 Indexing materialized views...');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_mv_project_summary_status 
      ON mv_project_summary (status);
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_mv_project_summary_created 
      ON mv_project_summary (created_at);
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_mv_user_activity_name 
      ON mv_user_activity (first_name, last_name);
    `;

    console.log('✅ Database optimization completed successfully!');

    // 9. Show optimization results
    console.log('\n📊 Optimization Summary:');

    const indexCount = await prisma.$queryRaw<[{ total_indexes: bigint }]>`
      SELECT COUNT(*) as total_indexes
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `;

    const tableCount = await prisma.$queryRaw<[{ total_tables: bigint }]>`
      SELECT COUNT(*) as total_tables
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;

    const viewCount = await prisma.$queryRaw<[{ total_views: bigint }]>`
      SELECT COUNT(*) as total_views
      FROM information_schema.views 
      WHERE table_schema = 'public';
    `;

    console.log(`- Total indexes: ${indexCount[0]?.total_indexes || 0}`);
    console.log(`- Total tables: ${tableCount[0]?.total_tables || 0}`);
    console.log(`- Total views: ${viewCount[0]?.total_views || 0}`);
    console.log(`- Materialized views: 2 (project_summary, user_activity)`);
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the optimization
main().catch(console.error);
