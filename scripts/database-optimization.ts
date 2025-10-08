#!/usr/bin/env tsx

/**
 * Database Optimization Script
 * Implements comprehensive database optimizations including:
 * - Additional composite indexes
 * - Full-text search indexes
 * - Query performance monitoring
 * - Database statistics updates
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive database optimization...');

  try {
    // 1. Add additional composite indexes for complex queries
    console.log('📊 Adding composite indexes for complex queries...');

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
      -- Documents: Author + Type + Public for user document queries
      CREATE INDEX IF NOT EXISTS idx_documents_author_type_public 
      ON documents (author_id, type, is_public);
    `;

    await prisma.$executeRaw`
      -- Documents: Parent + Order for hierarchical queries
      CREATE INDEX IF NOT EXISTS idx_documents_parent_order 
      ON documents (parent_id, "order");
    `;

    await prisma.$executeRaw`
      -- Attendance: User + Date range queries
      CREATE INDEX IF NOT EXISTS idx_attendances_user_date 
      ON attendances (user_id, check_in);
    `;

    await prisma.$executeRaw`
      -- Employee checklists: Employee + Status + Start date
      CREATE INDEX IF NOT EXISTS idx_employee_checklists_employee_status_start 
      ON employee_checklists (employee_id, status, start_date);
    `;

    await prisma.$executeRaw`
      -- Requests: User + Type + Status for user request views
      CREATE INDEX IF NOT EXISTS idx_requests_user_type_status 
      ON requests (user_id, type, status);
    `;

    await prisma.$executeRaw`
      -- Meeting attendees: Meeting + User for attendee queries
      CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_user 
      ON meeting_attendees (meeting_id, user_id);
    `;

    await prisma.$executeRaw`
      -- Talking points: Meeting + Created date for chronological order
      CREATE INDEX IF NOT EXISTS idx_talking_points_meeting_created 
      ON talking_points (meeting_id, created_at);
    `;

    await prisma.$executeRaw`
      -- Action items: Meeting + Assignee + Status for task management
      CREATE INDEX IF NOT EXISTS idx_action_items_meeting_assignee_status 
      ON action_items (meeting_id, assignee_id, is_completed);
    `;

    // 2. Add full-text search indexes for better search performance
    console.log('🔍 Adding full-text search indexes...');

    await prisma.$executeRaw`
      -- User name search
      CREATE INDEX IF NOT EXISTS idx_users_name_gin 
      ON users USING gin (to_tsvector('english', first_name || ' ' || last_name));
    `;

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

    await prisma.$executeRaw`
      -- Meeting title search
      CREATE INDEX IF NOT EXISTS idx_meetings_title_gin 
      ON meetings USING gin (to_tsvector('english', title));
    `;

    // 3. Add function-based indexes for date queries
    console.log('📅 Adding function-based indexes...');

    await prisma.$executeRaw`
      -- Stories by week (for weekly views)
      CREATE INDEX IF NOT EXISTS idx_stories_week 
      ON stories (date_trunc('week', day::date));
    `;

    await prisma.$executeRaw`
      -- Stories by month (for monthly views)
      CREATE INDEX IF NOT EXISTS idx_stories_month 
      ON stories (date_trunc('month', day::date));
    `;

    await prisma.$executeRaw`
      -- Tasks by week (for weekly planning)
      CREATE INDEX IF NOT EXISTS idx_tasks_week 
      ON tasks (date_trunc('week', due_date));
    `;

    await prisma.$executeRaw`
      -- Meetings by week (for calendar views)
      CREATE INDEX IF NOT EXISTS idx_meetings_week 
      ON meetings (date_trunc('week', start_time));
    `;

    // 4. Add partial indexes for common filtered queries
    console.log('🎯 Adding partial indexes...');

    await prisma.$executeRaw`
      -- Active users only
      CREATE INDEX IF NOT EXISTS idx_users_active 
      ON users (email, first_name, last_name) 
      WHERE is_active = true;
    `;

    await prisma.$executeRaw`
      -- Pinned announcements only
      CREATE INDEX IF NOT EXISTS idx_announcements_pinned 
      ON announcements (created_at DESC) 
      WHERE is_pinned = true;
    `;

    await prisma.$executeRaw`
      -- Pending leave requests only
      CREATE INDEX IF NOT EXISTS idx_leave_requests_pending 
      ON leave_requests (created_at DESC) 
      WHERE status = 'PENDING';
    `;

    await prisma.$executeRaw`
      -- Incomplete tasks only
      CREATE INDEX IF NOT EXISTS idx_tasks_incomplete 
      ON tasks (due_date, priority) 
      WHERE status IN ('Todo', 'InProgress');
    `;

    // 5. Optimize table statistics
    console.log('📈 Updating table statistics...');

    const tables = [
      'users', 'profiles', 'projects', 'tasks', 'stories', 'documents',
      'announcements', 'meetings', 'leave_requests', 'requests',
      'employee_documents', 'checklist_templates', 'employee_checklists',
      'attendances', 'content_slots', 'story_types', 'story_ideas',
      'tracked_instagram_pages', 'instagram_reels', 'work_schedules',
      'holidays', 'meeting_attendees', 'talking_points', 'action_items',
      'audit_logs'
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRaw`ANALYZE ${Prisma.raw(table)};`;
        console.log(`  ✅ Analyzed ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Skipped ${table} (table may not exist)`);
      }
    }

    // 6. Add database-level optimizations
    console.log('⚡ Adding database optimizations...');

    // Set work_mem for better sort performance
    await prisma.$executeRaw`SET work_mem = '256MB';`;

    // Set shared_buffers for better caching
    await prisma.$executeRaw`SET shared_buffers = '256MB';`;

    // Set effective_cache_size for query planning
    await prisma.$executeRaw`SET effective_cache_size = '1GB';`;

    // Enable query optimization
    await prisma.$executeRaw`SET random_page_cost = 1.1;`;

    // 7. Create materialized views for complex queries
    console.log('📊 Creating materialized views...');

    await prisma.$executeRaw`
      CREATE MATERIALIZED VIEW IF NOT EXISTS user_task_summary AS
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'Todo' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN t.status = 'InProgress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'Done' THEN 1 END) as overdue_tasks
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      WHERE u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name;
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_task_summary_user_id 
      ON user_task_summary (user_id);
    `;

    await prisma.$executeRaw`
      CREATE MATERIALIZED VIEW IF NOT EXISTS project_story_summary AS
      SELECT 
        p.id as project_id,
        p.name as project_name,
        COUNT(s.id) as total_stories,
        COUNT(CASE WHEN s.status = 'DRAFT' THEN 1 END) as draft_stories,
        COUNT(CASE WHEN s.status = 'PUBLISHED' THEN 1 END) as published_stories,
        COUNT(CASE WHEN s.status = 'ARCHIVED' THEN 1 END) as archived_stories
      FROM projects p
      LEFT JOIN stories s ON p.id = s.project_id
      GROUP BY p.id, p.name;
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_project_story_summary_project_id 
      ON project_story_summary (project_id);
    `;

    // 8. Create refresh functions for materialized views
    console.log('🔄 Creating refresh functions...');

    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION refresh_user_task_summary()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY user_task_summary;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION refresh_project_story_summary()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY project_story_summary;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // 9. Create performance monitoring views
    console.log('📊 Creating performance monitoring views...');

    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW slow_queries AS
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements
      WHERE mean_time > 1000
      ORDER BY mean_time DESC;
    `;

    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW table_sizes AS
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    // 10. Create indexes on materialized views
    console.log('🔗 Creating indexes on materialized views...');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_task_summary_pending 
      ON user_task_summary (pending_tasks DESC);
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_task_summary_overdue 
      ON user_task_summary (overdue_tasks DESC);
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_project_story_summary_published 
      ON project_story_summary (published_stories DESC);
    `;

    console.log('✅ Database optimization completed successfully!');
    console.log('');
    console.log('📋 Summary of optimizations:');
    console.log('  • Added composite indexes for complex queries');
    console.log('  • Added full-text search indexes');
    console.log('  • Added function-based indexes for date queries');
    console.log('  • Added partial indexes for filtered queries');
    console.log('  • Updated table statistics');
    console.log('  • Applied database-level optimizations');
    console.log('  • Created materialized views for complex aggregations');
    console.log('  • Created performance monitoring views');
    console.log('');
    console.log('🚀 Database is now optimized for better performance!');

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
