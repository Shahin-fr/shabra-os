import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { logger } from '@/lib/logger';
import {
  CompanyStats,
  PerformanceMetrics,
  TeamActivity,
  QuarterlyGoal,
  DashboardData,
  DashboardState,
  DashboardActions,
} from '@/types/admin-dashboard';

// Mock API functions - replace with actual API calls
const fetchCompanyStats = async (): Promise<CompanyStats> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    totalEmployees: 24,
    activeProjects: 18,
    completedTasks: 156,
    attendanceRate: 92,
    employeeGrowth: {
      percentage: 12,
      period: 'این ماه',
      isPositive: true,
    },
    projectGrowth: {
      percentage: 3,
      period: 'این هفته',
      isPositive: true,
    },
    taskGrowth: {
      percentage: 28,
      period: 'این هفته',
      isPositive: true,
    },
    attendanceGrowth: {
      percentage: 5,
      period: 'این ماه',
      isPositive: true,
    },
  };
};

const fetchPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    weeklyPerformance: {
      labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
      data: [85, 92, 78, 95, 88, 91, 87],
      target: [90, 90, 90, 90, 90, 90, 90],
    },
    taskBottlenecks: [
      {
        id: '1',
        title: 'تکمیل طراحی UI',
        severity: 'high',
        assignedTo: 'احمد محمدی',
        dueDate: new Date('2024-01-15'),
        progress: 75,
      },
      {
        id: '2',
        title: 'تست عملکرد سیستم',
        severity: 'medium',
        assignedTo: 'فاطمه احمدی',
        dueDate: new Date('2024-01-20'),
        progress: 45,
      },
    ],
    keyPerformanceIndicators: [
      {
        id: '1',
        name: 'نرخ تکمیل پروژه',
        value: 87,
        target: 90,
        unit: '%',
        trend: 'up',
        change: 3,
      },
      {
        id: '2',
        name: 'رضایت مشتری',
        value: 4.2,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        change: 0.1,
      },
    ],
  };
};

const fetchTeamActivity = async (): Promise<TeamActivity[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return [
    {
      id: '1',
      type: 'task_completed',
      user: {
        id: '1',
        name: 'احمد محمدی',
        avatar: '/avatars/ahmad.jpg',
      },
      description: 'تسک "طراحی صفحه اصلی" را تکمیل کرد',
      timestamp: new Date('2024-01-10T10:30:00'),
    },
    {
      id: '2',
      type: 'project_created',
      user: {
        id: '2',
        name: 'فاطمه احمدی',
        avatar: '/avatars/fatemeh.jpg',
      },
      description: 'پروژه جدید "سیستم مدیریت محتوا" را ایجاد کرد',
      timestamp: new Date('2024-01-10T09:15:00'),
    },
  ];
};

const fetchQuarterlyGoals = async (): Promise<QuarterlyGoal[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return [
    {
      id: '1',
      title: 'افزایش فروش',
      description: 'افزایش 25% فروش در سه‌ماهه اول',
      target: 1000000,
      current: 750000,
      unit: 'تومان',
      deadline: new Date('2024-03-31'),
      status: 'on_track',
      progress: 75,
    },
    {
      id: '2',
      title: 'توسعه محصول',
      description: 'تکمیل 3 ویژگی جدید محصول',
      target: 3,
      current: 2,
      unit: 'ویژگی',
      deadline: new Date('2024-03-31'),
      status: 'on_track',
      progress: 67,
    },
  ];
};

export function useAdminDashboard() {
  const [state, setState] = useState<DashboardState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    refreshInterval: 30000, // 30 seconds
  });

  // Company Stats Query
  const {
    data: companyStats,
    isLoading: companyStatsLoading,
    error: companyStatsError,
    refetch: refetchCompanyStats,
  } = useQuery({
    queryKey: ['admin-dashboard', 'company-stats'],
    queryFn: fetchCompanyStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: state.refreshInterval,
  });

  // Performance Metrics Query
  const {
    data: performanceMetrics,
    isLoading: performanceMetricsLoading,
    error: performanceMetricsError,
    refetch: refetchPerformanceMetrics,
  } = useQuery({
    queryKey: ['admin-dashboard', 'performance-metrics'],
    queryFn: fetchPerformanceMetrics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: state.refreshInterval,
  });

  // Team Activity Query
  const {
    data: teamActivity,
    isLoading: teamActivityLoading,
    error: teamActivityError,
    refetch: refetchTeamActivity,
  } = useQuery({
    queryKey: ['admin-dashboard', 'team-activity'],
    queryFn: fetchTeamActivity,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: state.refreshInterval,
  });

  // Quarterly Goals Query
  const {
    data: quarterlyGoals,
    isLoading: quarterlyGoalsLoading,
    error: quarterlyGoalsError,
    refetch: refetchQuarterlyGoals,
  } = useQuery({
    queryKey: ['admin-dashboard', 'quarterly-goals'],
    queryFn: fetchQuarterlyGoals,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: state.refreshInterval,
  });

  // Combined loading state
  const isLoading = companyStatsLoading || performanceMetricsLoading || teamActivityLoading || quarterlyGoalsLoading;

  // Combined error state
  const error = companyStatsError || performanceMetricsError || teamActivityError || quarterlyGoalsError;

  // Actions
  const actions: DashboardActions = {
    refresh: useCallback(async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        await Promise.all([
          refetchCompanyStats(),
          refetchPerformanceMetrics(),
          refetchTeamActivity(),
          refetchQuarterlyGoals(),
        ]);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          lastUpdated: new Date(),
        }));
        
        logger.info('Dashboard data refreshed successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh dashboard data';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        
        logger.error('Failed to refresh dashboard data:', err as Error);
      }
    }, [refetchCompanyStats, refetchPerformanceMetrics, refetchTeamActivity, refetchQuarterlyGoals]),

    setRefreshInterval: useCallback((interval: number) => {
      setState(prev => ({ ...prev, refreshInterval: interval }));
    }, []),

    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, []),
  };

  // Combined data
  const data: DashboardData = {
    companyStats: companyStats || {
      totalEmployees: 0,
      activeProjects: 0,
      completedTasks: 0,
      attendanceRate: 0,
      employeeGrowth: { percentage: 0, period: '', isPositive: false },
      projectGrowth: { percentage: 0, period: '', isPositive: false },
      taskGrowth: { percentage: 0, period: '', isPositive: false },
      attendanceGrowth: { percentage: 0, period: '', isPositive: false },
    },
    performanceMetrics: performanceMetrics || {
      weeklyPerformance: { labels: [], data: [], target: [] },
      taskBottlenecks: [],
      keyPerformanceIndicators: [],
    },
    teamActivity: teamActivity || [],
    quarterlyGoals: quarterlyGoals || [],
    isLoading,
    error: error?.message || null,
    lastUpdated: state.lastUpdated,
  };

  return {
    data,
    state,
    actions,
  };
}
