import { useQuery } from '@tanstack/react-query';

import { StoryIdea } from '@/types/story';

interface UseStoryIdeasOptions {
  category?: string;
  search?: string;
}

export function useStoryIdeas(options: UseStoryIdeasOptions = {}) {
  const { category, search } = options;

  return useQuery<StoryIdea[], Error>({
    queryKey: ['story-ideas', category, search],
    queryFn: async (): Promise<StoryIdea[]> => {
      const params = new URLSearchParams();

      if (category && category !== 'all') {
        params.append('category', category);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/story-ideas?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch story ideas');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
