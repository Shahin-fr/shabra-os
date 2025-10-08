import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponseBuilder } from '@/types';
import { withAuthorization } from '@/lib/middleware/authorization-middleware';

/**
 * GET /api/admin/database-performance - Get database performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check authorization - only admins can access performance metrics
    const authResult = await withAuthorization(['ADMIN'])(session);
    if (!authResult.authorized) {
      return ApiResponseBuilder.unauthorized(authResult.message);
    }

    // Get performance metrics
    const [
      slowQueries,
      tableSizes,
      indexUsage,
      connectionStats,
      queryStats
    ] = await Promise.all([
      getSlowQueries(),
      getTableSizes(),
      getIndexUsage(),
      getConnectionStats(),
      getQueryStats()
    ]);

    const performanceData = {
      slowQueries,
      tableSizes,
      indexUsage,
      connectionStats,
      queryStats,
      timestamp: new Date().toISOString(),
    };

    return ApiResponseBuilder.success(performanceData, 'Database performance metrics retrieved successfully');
  } catch (error) {
    console.error('Error fetching database performance metrics:', error);
    return ApiResponseBuilder.internalError('Failed to fetch database performance metrics');
  }
}

/**
 * Get slow queries from pg_stat_statements
 */
async function getSlowQueries() {
  try {
    const slowQueries = await prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements
      WHERE mean_time > 1000
      ORDER BY mean_time DESC
      LIMIT 20;
    `;
    return slowQueries;
  } catch (error) {
    console.warn('Could not fetch slow queries (pg_stat_statements may not be enabled):', error);
    return [];
  }
}

/**
 * Get table sizes
 */
async function getTableSizes() {
  try {
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;
    return tableSizes;
  } catch (error) {
    console.error('Error fetching table sizes:', error);
    return [];
  }
}

/**
 * Get index usage statistics
 */
async function getIndexUsage() {
  try {
    const indexUsage = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 50;
    `;
    return indexUsage;
  } catch (error) {
    console.error('Error fetching index usage:', error);
    return [];
  }
}

/**
 * Get connection statistics
 */
async function getConnectionStats() {
  try {
    const connectionStats = await prisma.$queryRaw`
      SELECT 
        state,
        count(*) as connections
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
      ORDER BY connections DESC;
    `;
    return connectionStats;
  } catch (error) {
    console.error('Error fetching connection stats:', error);
    return [];
  }
}

/**
 * Get query statistics
 */
async function getQueryStats() {
  try {
    const queryStats = await prisma.$queryRaw`
      SELECT 
        datname,
        numbackends,
        xact_commit,
        xact_rollback,
        blks_read,
        blks_hit,
        tup_returned,
        tup_fetched,
        tup_inserted,
        tup_updated,
        tup_deleted
      FROM pg_stat_database
      WHERE datname = current_database();
    `;
    return queryStats;
  } catch (error) {
    console.error('Error fetching query stats:', error);
    return [];
  }
}
