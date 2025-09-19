import { useQuery } from '@tanstack/react-query';

import { TeamActivity } from '@/types/admin-dashboard';

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
    {
      id: '3',
      type: 'meeting_scheduled',
      user: {
        id: '3',
        name: 'علی رضایی',
        avatar: '/avatars/ali.jpg',
      },
      description: 'جلسه تیم برای بررسی پیشرفت پروژه برنامه‌ریزی کرد',
      timestamp: new Date('2024-01-10T08:45:00'),
    },
    {
      id: '4',
      type: 'milestone_reached',
      user: {
        id: '4',
        name: 'مریم حسینی',
        avatar: '/avatars/maryam.jpg',
      },
      description: 'به مرحله 50% تکمیل پروژه رسید',
      timestamp: new Date('2024-01-09T16:20:00'),
    },
  ];
};

export function useTeamActivity() {
  return useQuery({
    queryKey: ['team-activity'],
    queryFn: fetchTeamActivity,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}
