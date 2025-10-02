import { useQuery } from '@tanstack/react-query';
import { useMeetingsErrorHandler } from './useMeetingsErrorHandler';

interface OptimizedMeeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'ONE_ON_ONE' | 'TEAM_MEETING';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  attendees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  talkingPointsCount: number;
  actionItemsCount: number;
}

interface UseOptimizedMeetingsOptions {
  startDate?: string;
  endDate?: string;
  type?: 'ONE_ON_ONE' | 'TEAM_MEETING';
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface OptimizedMeetingsResponse {
  success: boolean;
  data: OptimizedMeeting[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useOptimizedMeetings(options: UseOptimizedMeetingsOptions = {}) {
  const { handleApiError } = useMeetingsErrorHandler();
  
  const {
    startDate,
    endDate,
    type,
    limit = 50,
    offset = 0,
    enabled = true,
  } = options;

  return useQuery<OptimizedMeetingsResponse>({
    queryKey: ['meetings', 'optimized', { startDate, endDate, type, limit, offset }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (type) params.append('type', type);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        const response = await fetch(`/api/meetings/optimized?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'خطا در بارگذاری جلسات');
        }

        return result;
      } catch (error) {
        handleApiError(error, 'fetch-optimized-meetings');
        throw error;
      }
    },
    enabled,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for calendar events specifically
export function useOptimizedCalendarEvents(options: UseOptimizedMeetingsOptions = {}) {
  const { data, isLoading, error, refetch } = useOptimizedMeetings(options);
  
  const events = data?.data.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    start: new Date(meeting.startTime),
    end: new Date(meeting.endTime),
    resource: meeting,
  })) || [];

  return {
    events,
    isLoading,
    error,
    refetch,
    pagination: data?.pagination,
  };
}

// Hook for meeting statistics
export function useMeetingStats() {
  const { data, isLoading, error } = useOptimizedMeetings({ limit: 1000 });
  
  const stats = data ? {
    total: data.pagination.total,
    thisWeek: data.data.filter(m => {
      const start = new Date(m.startTime);
      const now = new Date();
      const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return start >= weekStart && start < weekEnd;
    }).length,
    completed: data.data.filter(m => m.status === 'COMPLETED').length,
    scheduled: data.data.filter(m => m.status === 'SCHEDULED').length,
    cancelled: data.data.filter(m => m.status === 'CANCELLED').length,
  } : null;

  return {
    stats,
    isLoading,
    error,
  };
}
