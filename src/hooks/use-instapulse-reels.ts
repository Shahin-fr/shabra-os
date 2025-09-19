import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { instapulseKeys } from '@/lib/queries';
import { fetchWithCache } from '@/lib/queries';
import { logger } from '@/lib/logger';

export interface InstagramReel {
  id: number;
  postUrl: string;
  shortCode: string;
  thumbnailUrl: string | null;
  viewCount: number;
  publishedAt: string;
  viralityScore: number;
  trackedPage: {
    id: number;
    username: string;
    profileUrl: string;
    followerCount: number;
    status: string;
  };
}

export interface ReelsFilters {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  sortBy: string;
  sortOrder: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface ReelsResponse {
  reels: InstagramReel[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalRecords: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    filters: {
      startDate?: string;
      endDate?: string;
      sortBy: string;
      sortOrder: string;
    };
  };
}

export function useInstapulseReels(filters: ReelsFilters) {
  const buildQueryParams = (filters: ReelsFilters): URLSearchParams => {
    const params = new URLSearchParams();

    // Add date range parameters
    if (filters.dateRange?.from) {
      params.set('startDate', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      params.set('endDate', filters.dateRange.to.toISOString());
    }

    // Add sort parameters
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);

    // Add pagination parameters (default values)
    params.set('page', '1');
    params.set('pageSize', '20');

    return params;
  };

  const {
    data: reelsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ReelsResponse, Error>({
    queryKey: instapulseKeys.reelsList(JSON.stringify(filters)),
    queryFn: async () => {
      const params = buildQueryParams(filters);
      const url = `/api/instapulse/reels?${params.toString()}`;

      const response = await fetchWithCache<ApiResponse<ReelsResponse>>(url);
      return response.data;
    },
    staleTime: 0, // Consider data stale immediately
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Handle errors with useEffect
  React.useEffect(() => {
    if (isError && error) {
      logger.error('Failed to fetch InstaPulse reels', error);
      toast.error('Failed to load Instagram reels', {
        description: error.message || 'Please try again later.',
      });
    }
  }, [isError, error]);

  return {
    reels: reelsResponse?.reels || [],
    meta: reelsResponse?.meta,
    isLoading,
    isError,
    error,
    refetch,
  };
}
