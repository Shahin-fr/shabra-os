import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns-jalali';

import { logger } from '@/lib/logger';
import {
  fetchStoriesByDay,
  fetchStoryTypes,
  storiesKeys,
  storyTypesKeys,
} from '@/lib/queries';

export function useStoryboardData(selectedDate: Date) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Fetch story types
  const {
    data: storyTypes = [],
    isLoading: storyTypesLoading,
    isError: storyTypesError,
  } = useQuery({
    queryKey: storyTypesKeys.all,
    queryFn: fetchStoryTypes,
  });

  // Fetch stories for the selected date
  const {
    data: stories = [],
    isLoading: storiesLoading,
    isError: storiesError,
    error: storiesErrorDetails,
    refetch: refetchStories,
  } = useQuery({
    queryKey: storiesKeys.byDay(dateString),
    queryFn: () => fetchStoriesByDay(dateString),
    retry: 2,
    retryDelay: 1000,
  });

  // Debug logging for stories error
  if (storiesError) {
    logger.error('Stories error detected:', storiesErrorDetails);
  }

  return {
    storyTypes,
    stories,
    storyTypesLoading,
    storiesLoading,
    storyTypesError,
    storiesError,
    storiesErrorDetails,
    refetchStories,
  };
}
