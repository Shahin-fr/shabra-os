import { useQuery } from '@tanstack/react-query';

import { CompanyStats } from '@/types/admin-dashboard';

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

export function useCompanyStats() {
  return useQuery({
    queryKey: ['company-stats'],
    queryFn: fetchCompanyStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}
