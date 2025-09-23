import { logger } from '@/lib/logger';

// Types for mobile dashboard data
export interface MobileStatData {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string; // Icon name for mapping
  color: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface MobileQuickAction {
  id: string;
  title: string;
  icon: string; // Icon name for mapping
  color: string;
  href: string;
}

export interface MobileActivity {
  id: string;
  text: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

export interface MobileDashboardData {
  stats: MobileStatData[];
  quickActions: MobileQuickAction[];
  recentActivity: MobileActivity[];
}

/**
 * Mobile Service
 * Handles fetching mobile dashboard data including stats, quick actions, and activity
 */
export class MobileService {
  /**
   * Fetch all mobile dashboard data in one call
   */
  static async getMobileDashboardData(): Promise<MobileDashboardData> {
    try {
      logger.info('Fetching mobile dashboard data', {
        operation: 'MobileService.getMobileDashboardData',
      });

      // Fetch data from multiple APIs in parallel
      const [attendanceStats, tasksData, projectsData, requestsData] = await Promise.all([
        this.fetchAttendanceStats(),
        this.fetchTasksData(),
        this.fetchProjectsData(),
        this.fetchRequestsData(),
      ]);

      // Generate stats data
      const stats = this.generateStatsData(attendanceStats, tasksData, projectsData, requestsData);

      // Generate quick actions based on user role and data
      const quickActions = this.generateQuickActions(requestsData, tasksData);

      // Generate recent activity
      const recentActivity = this.generateRecentActivity(tasksData, projectsData, requestsData);

      logger.info('Mobile dashboard data fetched successfully', {
        statsCount: stats.length,
        quickActionsCount: quickActions.length,
        activityCount: recentActivity.length,
        operation: 'MobileService.getMobileDashboardData',
      });

      return {
        stats,
        quickActions,
        recentActivity,
      };
    } catch (error) {
      logger.error('Error fetching mobile dashboard data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'MobileService.getMobileDashboardData',
      });
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
    const inProgress = tasks.filter((task: any) => task.status === 'In Progress').length;
    
    return { total, completed, inProgress, tasks: tasks.slice(0, 5) };
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
    
    return { total, active, projects: data.projects?.slice(0, 3) || [] };
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
    
    return { total, pending, requests: data.data?.slice(0, 3) || [] };
  }

  private static generateStatsData(attendanceStats: any, tasksData: any, projectsData: any, requestsData: any): MobileStatData[] {
    const stats: MobileStatData[] = [];

    // Today's work hours
    stats.push({
      id: 'work-hours',
      title: 'ساعات کار امروز',
      value: attendanceStats.today.totalHours.toFixed(1),
      subtitle: `از 8 ساعت هدف`,
      icon: 'Clock',
      color: 'blue',
      trend: attendanceStats.today.totalHours >= 8 ? '+12%' : '-5%',
      trendDirection: attendanceStats.today.totalHours >= 8 ? 'up' : 'down',
    });

    // Completed tasks
    stats.push({
      id: 'completed-tasks',
      title: 'تسک‌های تکمیل شده',
      value: tasksData.completed.toString(),
      subtitle: `از ${tasksData.total} تسک`,
      icon: 'CheckSquare',
      color: 'green',
      trend: tasksData.completed > 0 ? '+8%' : '0%',
      trendDirection: tasksData.completed > 0 ? 'up' : 'neutral',
    });

    // Active projects
    stats.push({
      id: 'active-projects',
      title: 'پروژه‌های فعال',
      value: projectsData.active.toString(),
      subtitle: `از ${projectsData.total} پروژه`,
      icon: 'Target',
      color: 'purple',
      trend: projectsData.active > 0 ? '+3%' : '0%',
      trendDirection: projectsData.active > 0 ? 'up' : 'neutral',
    });

    // Pending requests
    stats.push({
      id: 'pending-requests',
      title: 'درخواست‌های در انتظار',
      value: requestsData.pending.toString(),
      subtitle: `از ${requestsData.total} درخواست`,
      icon: 'FileText',
      color: 'orange',
      trend: requestsData.pending === 0 ? '-15%' : '+5%',
      trendDirection: requestsData.pending === 0 ? 'down' : 'up',
    });

    return stats;
  }

  private static generateQuickActions(requestsData: any, tasksData: any): MobileQuickAction[] {
    const actions: MobileQuickAction[] = [];

    // Clock in/out (always available for employees)
    actions.push({
      id: 'clock-in',
      title: 'ثبت حضور',
      icon: 'Clock',
      color: 'bg-blue-500',
      href: '/attendance',
    });

    // Leave request
    actions.push({
      id: 'leave-request',
      title: 'درخواست مرخصی',
      icon: 'Calendar',
      color: 'bg-green-500',
      href: '/leave',
    });

    // View tasks
    if (tasksData.total > 0) {
      actions.push({
        id: 'view-tasks',
        title: 'مشاهده تسک‌ها',
        icon: 'CheckSquare',
        color: 'bg-purple-500',
        href: '/tasks',
      });
    }

    // Submit request
    actions.push({
      id: 'submit-request',
      title: 'ارسال درخواست',
      icon: 'Plus',
      color: 'bg-orange-500',
      href: '/requests',
    });

    // Team members
    actions.push({
      id: 'team-members',
      title: 'اعضای تیم',
      icon: 'Users',
      color: 'bg-pink-500',
      href: '/team',
    });

    // Projects
    actions.push({
      id: 'projects',
      title: 'پروژه‌ها',
      icon: 'Target',
      color: 'bg-indigo-500',
      href: '/projects',
    });

    return actions;
  }

  private static generateRecentActivity(tasksData: any, projectsData: any, requestsData: any): MobileActivity[] {
    const activities: MobileActivity[] = [];

    // Add task activities
    tasksData.tasks.slice(0, 2).forEach((task: any, index: number) => {
      const timeAgo = this.getTimeAgo(new Date(task.createdAt));
      activities.push({
        id: `task-${task.id}`,
        text: `تسک "${task.title}" ${task.status === 'Done' ? 'تکمیل شد' : 'ایجاد شد'}`,
        time: timeAgo,
        type: task.status === 'Done' ? 'success' : 'info',
      });
    });

    // Add project activities
    projectsData.projects.slice(0, 1).forEach((project: any) => {
      const timeAgo = this.getTimeAgo(new Date(project.updatedAt));
      activities.push({
        id: `project-${project.id}`,
        text: `پروژه "${project.name}" به‌روزرسانی شد`,
        time: timeAgo,
        type: 'info',
      });
    });

    // Add request activities
    requestsData.requests.slice(0, 1).forEach((request: any) => {
      const timeAgo = this.getTimeAgo(new Date(request.createdAt));
      activities.push({
        id: `request-${request.id}`,
        text: `درخواست ${request.type} ارسال شد`,
        time: timeAgo,
        type: 'info',
      });
    });

    // Sort by time and return top 3
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 3);
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
