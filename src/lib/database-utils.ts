import { prisma } from './prisma';

/**
 * Health check function for database connectivity
 * Safe to use in API routes (Node.js environment)
 */
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get connection pool status for PostgreSQL
 * Safe to use in API routes (Node.js environment)
 */
export async function getConnectionPoolStatus() {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        count(*) as active_connections,
        max_connections,
        (max_connections - count(*)) as available_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `;
    return result;
  } catch (error) {
    return { error: 'Unable to get connection pool status' };
  }
}

/**
 * Get basic database metrics
 * Safe to use in API routes (Node.js environment)
 */
export async function getDatabaseMetrics() {
  try {
    const startTime = Date.now();

    // Get basic metrics
    const [userCount, projectCount, storyCount, taskCount] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.story.count(),
      prisma.task.count(),
    ]);

    const endTime = Date.now();
    const queryTime = endTime - startTime;

    return {
      metrics: {
        users: userCount,
        projects: projectCount,
        stories: storyCount,
        tasks: taskCount,
      },
      performance: {
        queryTime: `${queryTime}ms`,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (_error) {
    return {
      error: 'Unable to get database metrics',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Gracefully disconnect from database
 * Safe to use in API routes (Node.js environment)
 */
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
  } catch (_error) {
    // Silently handle disconnection errors
  }
}
