import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Utility class for resolving project IDs and handling legacy project ID mappings
 */
export class ProjectIdResolver {
  /**
   * Legacy project ID that needs to be mapped to the first available project
   * This is a temporary compatibility layer for old data
   */
  private static readonly LEGACY_PROJECT_ID = 'cmf5o9m110001u35cldria860';

  /**
   * Resolves a project ID, handling legacy mappings and validation
   * @param projectId - The project ID to resolve
   * @returns The resolved project ID or null if invalid
   */
  static async resolve(projectId: string): Promise<string | null> {
    try {
      // Handle legacy project ID mapping
      if (projectId === this.LEGACY_PROJECT_ID) {
        logger.warn('Legacy project ID detected, mapping to first available project', {
          legacyProjectId: projectId,
          operation: 'ProjectIdResolver.resolve'
        });
        
        const firstProject = await prisma.project.findFirst({
          select: { id: true },
          orderBy: { createdAt: 'asc' }
        });
        
        if (firstProject) {
          logger.info('Legacy project ID successfully mapped', {
            legacyProjectId: projectId,
            mappedProjectId: firstProject.id,
            operation: 'ProjectIdResolver.resolve'
          });
          return firstProject.id;
        } else {
          logger.error(`No projects found for legacy project ID mapping: ${projectId}`);
          return null;
        }
      }

      // Validate that the project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true }
      });

      if (!project) {
        logger.warn('Invalid project ID provided', {
          projectId,
          operation: 'ProjectIdResolver.resolve'
        });
        return null;
      }

      return projectId;
    } catch (error) {
      logger.error(`Error resolving project ID: ${projectId}`, error as Error);
      return null;
    }
  }

  /**
   * Gets the first available project ID as a fallback
   * @returns The first project ID or null if none exists
   */
  static async getFirstAvailableProjectId(): Promise<string | null> {
    try {
      const firstProject = await prisma.project.findFirst({
        select: { id: true },
        orderBy: { createdAt: 'asc' }
      });
      
      return firstProject?.id || null;
    } catch (error) {
      logger.error('Error getting first available project ID', error as Error);
      return null;
    }
  }

  /**
   * Validates if a project ID is valid
   * @param projectId - The project ID to validate
   * @returns True if the project exists, false otherwise
   */
  static async isValidProjectId(projectId: string): Promise<boolean> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true }
      });
      
      return !!project;
    } catch (error) {
      logger.error(`Error validating project ID: ${projectId}`, error as Error);
      return false;
    }
  }
}
