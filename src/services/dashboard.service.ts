import { logger } from '@/lib/logger';

// Types for dashboard snapshot data
export interface SnapshotItem {
  title: string;
  value: string;
  total: string;
  percentage: number;
  icon: string; // Icon name for mapping
  trend: string;
}

export interface SnapshotResponse {
  data: SnapshotItem[];
  summary: {
    status: string;
    message: string;
  };
}

// Types for activity feed data
export interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_created' | 'comment' | 'meeting' | 'document' | 'project_update' | 'attendance';
  user: string;
  action: string;
  fullAction: string;
  time: string;
  icon: string; // Icon name for mapping
  color: string;
  bgColor: string;
}

export interface ActivityResponse {
  data: ActivityItem[];
}

/**
 * Dashboard Service
 * Handles fetching dashboard statistics and activity data
 */
export class DashboardService {
  /**
   * Fetch today's snapshot data
   */
  static async getTodaysSnapshot(): Promise<SnapshotResponse> {
    try {
      logger.info('Fetching today\'s snapshot data', {
        operation: 'DashboardService.getTodaysSnapshot',
      });

      // Fetch data from multiple APIs in parallel
      const [attendanceStats, tasksData, projectsData, requestsData] = await Promise.all([
        this.fetchAttendanceStats(),
        this.fetchTasksData(),
        this.fetchProjectsData(),
        this.fetchRequestsData(),
      ]);

      // Transform data into snapshot items
      const snapshotItems: SnapshotItem[] = [
        {
          title: 'ساعات کار امروز',
          value: attendanceStats.today.totalHours.toFixed(1),
          total: '8.0',
          percentage: Math.min((attendanceStats.today.totalHours / 8) * 100, 100),
          icon: 'Clock',
          trend: attendanceStats.today.totalHours >= 8 ? 'عالی' : 'در حال پیشرفت',
        },
        {
          title: 'تسک‌های تکمیل شده',
          value: tasksData.completed.toString(),
          total: tasksData.total.toString(),
          percentage: tasksData.total > 0 ? (tasksData.completed / tasksData.total) * 100 : 0,
          icon: 'CheckCircle',
          trend: tasksData.completed >= tasksData.total * 0.8 ? 'عالی' : 'در حال پیشرفت',
        },
        {
          title: 'پروژه‌های فعال',
          value: projectsData.active.toString(),
          total: projectsData.total.toString(),
          percentage: projectsData.total > 0 ? (projectsData.active / projectsData.total) * 100 : 0,
          icon: 'Target',
          trend: projectsData.active > 0 ? 'عالی' : 'نیاز به توجه',
        },
        {
          title: 'درخواست‌های در انتظار',
          value: requestsData.pending.toString(),
          total: requestsData.total.toString(),
          percentage: requestsData.total > 0 ? (requestsData.pending / requestsData.total) * 100 : 0,
          icon: 'Users',
          trend: requestsData.pending === 0 ? 'عالی' : 'نیاز به بررسی',
        },
      ];

      // Calculate overall status
      const overallPercentage = snapshotItems.reduce((sum, item) => sum + item.percentage, 0) / snapshotItems.length;
      const status = overallPercentage >= 80 ? 'عالی' : overallPercentage >= 60 ? 'خوب' : 'نیاز به بهبود';
      const message = overallPercentage >= 80 
        ? 'همه چیز طبق برنامه پیش می‌رود' 
        : 'برخی موارد نیاز به توجه دارند';

      logger.info('Today\'s snapshot data fetched successfully', {
        itemCount: snapshotItems.length,
        overallPercentage: overallPercentage.toFixed(1),
        operation: 'DashboardService.getTodaysSnapshot',
      });

      return {
        data: snapshotItems,
        summary: {
          status,
          message,
        },
      };
    } catch (error) {
      logger.error(`Error fetching today's snapshot data: ${error instanceof Error ? error.message : 'Unknown error'}`, error as Error);
      throw error;
    }
  }

  /**
   * Fetch recent team activity data
   */
  static async getRecentTeamActivity(): Promise<ActivityResponse> {
    try {
      logger.info('Fetching recent team activity data', {
        operation: 'DashboardService.getRecentTeamActivity',
      });

      // Fetch data from multiple sources
      const [tasksData, projectsData, requestsData] = await Promise.all([
        this.fetchRecentTasks(),
        this.fetchRecentProjects(),
        this.fetchRecentRequests(),
      ]);

      // Combine and sort all activities by creation date
      const allActivities = [
        ...tasksData,
        ...projectsData,
        ...requestsData,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Transform to activity items
      const activityItems: ActivityItem[] = allActivities.slice(0, 10).map((activity, _index) => {
        const timeAgo = this.getTimeAgo(new Date(activity.createdAt));
        
        return {
          id: activity.id,
          type: activity.type as any,
          user: activity.user,
          action: activity.action,
          fullAction: activity.fullAction,
          time: timeAgo,
          icon: activity.icon,
          color: activity.color,
          bgColor: activity.bgColor,
        };
      });

      logger.info('Recent team activity data fetched successfully', {
        activityCount: activityItems.length,
        operation: 'DashboardService.getRecentTeamActivity',
      });

      return {
        data: activityItems,
      };
    } catch (error) {
      logger.error(`Error fetching recent team activity data: ${error instanceof Error ? error.message : 'Unknown error'}`, error as Error);
      throw error;
    }
  }

  // Helper methods for fetching specific data

  private static async fetchAttendanceStats() {
    const response = await fetch('/api/attendance/stats', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch attendance stats');
    }
    const data = await response.json();
    return data.data;
  }

  private static async fetchTasksData() {
    const response = await fetch('/api/tasks', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tasks data');
    }
    const tasks = await response.json();
    
    const total = tasks.length;
    const completed = tasks.filter((task: any) => task.status === 'Done').length;
    
    return { total, completed };
  }

  private static async fetchProjectsData() {
    const response = await fetch('/api/projects', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch projects data');
    }
    const data = await response.json();
    
    const total = data.projects?.length || 0;
    const active = data.projects?.filter((project: any) => project.status === 'ACTIVE').length || 0;
    
    return { total, active };
  }

  private static async fetchRequestsData() {
    const response = await fetch('/api/requests', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch requests data');
    }
    const data = await response.json();
    
    const total = data.data?.length || 0;
    const pending = data.data?.filter((request: any) => request.status === 'PENDING').length || 0;
    
    return { total, pending };
  }

  private static async fetchRecentTasks() {
    const response = await fetch('/api/tasks', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recent tasks');
    }
    const tasks = await response.json();
    
    return tasks.slice(0, 5).map((task: any) => ({
      id: task.id,
      type: task.status === 'Done' ? 'task_completed' : 'task_created',
      user: `${task.assignee?.firstName || task.creator?.firstName} ${task.assignee?.lastName || task.creator?.lastName}`,
      action: task.status === 'Done' ? 'تسک تکمیل شد' : 'تسک جدید ایجاد شد',
      fullAction: `"${task.title}" ${task.status === 'Done' ? 'تکمیل شد' : 'ایجاد شد'}`,
      createdAt: task.createdAt,
      icon: task.status === 'Done' ? 'CheckCircle' : 'Plus',
      color: task.status === 'Done' ? 'text-green-600' : 'text-blue-600',
      bgColor: task.status === 'Done' ? 'bg-green-100' : 'bg-blue-100',
    }));
  }

  private static async fetchRecentProjects() {
    const response = await fetch('/api/projects', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recent projects');
    }
    const data = await response.json();
    
    return (data.projects || []).slice(0, 3).map((project: any) => ({
      id: project.id,
      type: 'project_update',
      user: 'سیستم',
      action: 'پروژه به‌روزرسانی شد',
      fullAction: `پروژه "${project.name}" به‌روزرسانی شد`,
      createdAt: project.updatedAt,
      icon: 'Target',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    }));
  }

  private static async fetchRecentRequests() {
    const response = await fetch('/api/requests', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recent requests');
    }
    const data = await response.json();
    
    return (data.data || []).slice(0, 3).map((request: any) => ({
      id: request.id,
      type: 'attendance',
      user: `${request.user?.firstName} ${request.user?.lastName}`,
      action: 'درخواست جدید ارسال شد',
      fullAction: `درخواست ${request.type} ارسال شد`,
      createdAt: request.createdAt,
      icon: 'FileText',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    }));
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'همین الان';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} دقیقه پیش`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ساعت پیش`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} روز پیش`;
    }
  }
}
