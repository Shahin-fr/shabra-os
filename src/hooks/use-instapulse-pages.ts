import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { instapulseKeys } from '@/lib/queries';
import { logger } from '@/lib/logger';

// Type definition for TrackedInstagramPage
export interface TrackedInstagramPage {
  id: number;
  username: string;
  profileUrl: string;
  followerCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
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

// API functions
const fetchPages = async (): Promise<TrackedInstagramPage[]> => {
  const response = await fetch('/api/instapulse/pages');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`);
  }
  
  const result: ApiResponse<TrackedInstagramPage[]> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch pages');
  }
  
  return result.data;
};

const addPage = async (username: string): Promise<TrackedInstagramPage> => {
  console.log('Hook: About to send username to API:', username);
  console.log('Hook: Request body will be:', JSON.stringify({ username }));
  
  const response = await fetch('/api/instapulse/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to add page: ${response.statusText}`);
  }
  
  const result: ApiResponse<TrackedInstagramPage> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to add page');
  }
  
  return result.data;
};

const deletePage = async (id: number): Promise<void> => {
  const response = await fetch(`/api/instapulse/pages?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete page: ${response.statusText}`);
  }
  
  const result: ApiResponse<{ id: number; username: string }> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to delete page');
  }
};

// Custom hook
export function useInstapulsePages() {
  const queryClient = useQueryClient();

  // Fetch pages query
  const {
    data: pages = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: instapulseKeys.pages(),
    queryFn: fetchPages,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    retry: 2,
  });

  // Add page mutation
  const addPageMutation = useMutation({
    mutationFn: addPage,
    onSuccess: (newPage) => {
      // Invalidate and refetch pages
      queryClient.invalidateQueries({ queryKey: instapulseKeys.pages() });
      
      logger.info('Page added successfully', {
        context: 'use-instapulse-pages',
        operation: 'addPage',
        username: newPage.username,
        pageId: newPage.id,
      });
    },
    onError: (error) => {
      logger.error('Failed to add page', error, {
        context: 'use-instapulse-pages',
        operation: 'addPage',
      });
    },
  });

  // Delete page mutation with optimistic updates
  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onMutate: async (pageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: instapulseKeys.pages() });

      // Snapshot the previous value
      const previousPages = queryClient.getQueryData<TrackedInstagramPage[]>(
        instapulseKeys.pages()
      );

      // Optimistically update to the new value
      if (previousPages) {
        queryClient.setQueryData<TrackedInstagramPage[]>(
          instapulseKeys.pages(),
          previousPages.filter(page => page.id !== pageId)
        );
      }

      // Return a context object with the snapshotted value
      return { previousPages };
    },
    onError: (error, pageId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPages) {
        queryClient.setQueryData(instapulseKeys.pages(), context.previousPages);
      }
      
      logger.error('Failed to delete page', error, {
        context: 'use-instapulse-pages',
        operation: 'deletePage',
        pageId,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: instapulseKeys.pages() });
    },
  });

  return {
    // Data
    pages,
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Mutations
    addPage: addPageMutation.mutate,
    deletePage: deletePageMutation.mutate,
    
    // Mutation states
    isAddingPage: addPageMutation.isPending,
    isDeletingPage: deletePageMutation.isPending,
    
    // Mutation errors
    addPageError: addPageMutation.error,
    deletePageError: deletePageMutation.error,
  };
}
