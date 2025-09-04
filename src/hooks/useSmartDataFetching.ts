import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

export interface SmartFetchingOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  manualRefresh?: boolean;
  userActivityDetection?: boolean;
  criticalData?: boolean;
}

export interface SmartFetchingReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  isRefetching: boolean;
  lastUpdated: Date | null;
}

/**
 * Smart data fetching hook that replaces inefficient polling with intelligent strategies
 */
export function useSmartDataFetching<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus = true,
  refetchOnMount = true,
  refetchOnReconnect = true,
  // manualRefresh = false,
  userActivityDetection = true,
  criticalData = false,
}: SmartFetchingOptions): SmartFetchingReturn<T> {
  const queryClient = useQueryClient();
  const lastActivityRef = useRef<number>(Date.now());
  const lastRefetchRef = useRef<number>(Date.now());

  // User activity detection
  useEffect(() => {
    if (!userActivityDetection) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [userActivityDetection]);

  // Smart refetch on user activity for critical data
  useEffect(() => {
    if (!criticalData || !userActivityDetection) return;

    const checkAndRefetch = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const timeSinceLastRefetch = now - lastRefetchRef.current;

      // Refetch if user has been active in the last 2 minutes and it's been more than 5 minutes since last refetch
      if (
        timeSinceLastActivity < 2 * 60 * 1000 &&
        timeSinceLastRefetch > 5 * 60 * 1000
      ) {
        queryClient.invalidateQueries({ queryKey });
        lastRefetchRef.current = now;
      }
    };

    const interval = setInterval(checkAndRefetch, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [criticalData, userActivityDetection, queryClient, queryKey]);

  // Main query with smart configuration
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    // Disable automatic refetching - we'll handle it intelligently
    refetchInterval: false,
    // Only refetch when data is stale
    refetchOnMount,
    // Refetch when window regains focus (user returns to tab)
    refetchOnWindowFocus,
    // Refetch when network reconnects
    refetchOnReconnect,
  });

  // Enhanced refetch with activity tracking
  const enhancedRefetch = useCallback(async () => {
    lastRefetchRef.current = Date.now();
    return refetch();
  }, [refetch]);

  // Get last updated time from query state
  const lastUpdated = data ? new Date() : null;

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: enhancedRefetch,
    isRefetching,
    lastUpdated,
  };
}

/**
 * Hook for critical data that needs more frequent updates (like attendance)
 */
export function useCriticalDataFetching<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: Partial<SmartFetchingOptions> = {}
): SmartFetchingReturn<T> {
  return useSmartDataFetching({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000, // 2 minutes for critical data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    manualRefresh: true,
    userActivityDetection: true,
    criticalData: true,
    ...options,
  });
}

/**
 * Hook for static data that rarely changes (like user profile, team info)
 */
export function useStaticDataFetching<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: Partial<SmartFetchingOptions> = {}
): SmartFetchingReturn<T> {
  return useSmartDataFetching({
    queryKey,
    queryFn,
    staleTime: 30 * 60 * 1000, // 30 minutes for static data
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    manualRefresh: false,
    userActivityDetection: false,
    criticalData: false,
    ...options,
  });
}
