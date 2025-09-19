import { logger } from './logger';

// Query key factories for consistent cache management
export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  list: (filters: string) => [...projectsKeys.lists(), { filters }] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
  byPage: (page: number) => [...projectsKeys.all, 'page', page] as const,
};

export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters: string) => [...tasksKeys.lists(), { filters }] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
  byProject: (projectId: string) =>
    [...tasksKeys.all, 'project', projectId] as const,
};

export const storiesKeys = {
  all: ['stories'] as const,
  lists: () => [...storiesKeys.all, 'list'] as const,
  list: (filters: string) => [...storiesKeys.lists(), { filters }] as const,
  details: () => [...storiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...storiesKeys.details(), id] as const,
  byDay: (day: string) => [...storiesKeys.all, 'day', day] as const,
  byProject: (projectId: string) =>
    [...storiesKeys.all, 'project', projectId] as const,
};

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: string) => [...usersKeys.lists(), { filters }] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  byRole: (role: string) => [...usersKeys.all, 'role', role] as const,
};

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (filters: string) => [...attendanceKeys.lists(), { filters }] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  byUser: (userId: string) => [...attendanceKeys.all, 'user', userId] as const,
  byDate: (date: string) => [...attendanceKeys.all, 'date', date] as const,
  byWeek: (weekStart: string) =>
    [...attendanceKeys.all, 'week', weekStart] as const,
};

export const storyTypesKeys = {
  all: ['storyTypes'] as const,
  lists: () => [...storyTypesKeys.all, 'list'] as const,
  list: (filters: string) => [...storyTypesKeys.lists(), { filters }] as const,
  details: () => [...storyTypesKeys.all, 'detail'] as const,
  detail: (id: string) => [...storyTypesKeys.details(), id] as const,
};

export const instapulseKeys = {
  all: ['instapulse'] as const,
  pages: () => [...instapulseKeys.all, 'pages'] as const,
  reels: () => [...instapulseKeys.all, 'reels'] as const,
  reelsList: (filters: string) =>
    [...instapulseKeys.reels(), 'list', { filters }] as const,
};

// Generic fetch function with error handling and caching
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      logger.error('HTTP Error', error, {
        status: response.status,
        statusText: response.statusText,
        url,
      });
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Improve error logging with more context
    if (error instanceof Error) {
      logger.error('Query error', error, {
        url,
        timestamp: new Date().toISOString(),
      });
    } else {
      const unknownError = new Error(`Unknown error: ${String(error)}`);
      logger.error('Query error (unknown type)', unknownError, {
        error: String(error),
        url,
        timestamp: new Date().toISOString(),
      });
    }
    throw error;
  }
}

// Project queries
export async function fetchProjects(page: number = 1, limit: number = 20) {
  const url = `/api/projects?page=${page}&limit=${limit}`;
  const response = await fetchWithCache(url, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });

  // Extract data from the API response structure
  const typedResponse = response as any;
  if (typedResponse.success && typedResponse.data) {
    return typedResponse.data;
  }

  throw new Error('Invalid response structure from projects API');
}

export async function fetchProject(id: string) {
  const url = `/api/projects/${id}`;
  const response = await fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=300, stale-while-revalidate=600',
    },
  });

  // Extract data from the API response structure
  const typedResponse = response as any;
  if (typedResponse.success && typedResponse.data) {
    return typedResponse.data;
  }

  throw new Error('Invalid response structure from project API');
}

// Project mutations
export async function updateProject(
  id: string,
  projectData: {
    name: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    await response.json().catch(() => ({}));
    throw new Error(
      `خطا در به‌روزرسانی پروژه: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Extract data from the API response structure
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error('Invalid response structure from project update API');
}

export async function deleteProject(id: string) {
  const response = await fetch(`/api/projects?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });

  if (!response.ok) {
    await response.json().catch(() => ({}));
    throw new Error(
      `خطا در حذف پروژه: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Extract data from the API response structure
  if (result.success && result.data) {
    return result.data;
  }

  throw new Error('Invalid response structure from project delete API');
}

// Task queries
export async function fetchTasks(projectId?: string) {
  const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=30, stale-while-revalidate=60',
    },
  });
}

export async function fetchTask(id: string) {
  const url = `/api/tasks/${id}`;
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=120',
    },
  });
}

// Story queries
export async function fetchStories(day?: string, projectId?: string) {
  const params = new URLSearchParams();
  if (day) params.append('day', day);
  if (projectId) params.append('projectId', projectId);

  const url = `/api/stories${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=30, stale-while-revalidate=60',
    },
  });
}

export async function fetchStory(id: string) {
  const url = `/api/stories/${id}`;
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=120',
    },
  });
}

export async function fetchStoriesByDay(day: string) {
  const url = `/api/stories?day=${day}`;
  const result = await fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=30, stale-while-revalidate=60',
    },
  });
  // Return the stories array directly since API now returns it directly
  return Array.isArray(result) ? result : [];
}

export async function fetchStoryTypes() {
  const url = '/api/story-types';
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=300, stale-while-revalidate=600',
    },
  });
}

// User queries
export async function fetchUsers() {
  const url = '/api/users';
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=300, stale-while-revalidate=600',
    },
  });
}

export async function fetchUser(id: string) {
  const url = `/api/users/${id}`;
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=300, stale-while-revalidate=600',
    },
  });
}

// Attendance queries
export async function fetchAttendance(userId?: string, date?: string) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (date) params.append('date', date);

  const url = `/api/attendance${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=30, stale-while-revalidate=60',
    },
  });
}

export async function fetchAttendanceByWeek(weekStart: string) {
  const url = `/api/attendance?weekStart=${weekStart}`;
  return fetchWithCache(url, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=120',
    },
  });
}

// Batch queries for performance
export async function fetchDashboardData(userId: string) {
  try {
    const [tasks, attendance, stories] = await Promise.all([
      fetchTasks(),
      fetchAttendance(userId),
      fetchStories(),
    ]);

    return {
      tasks,
      attendance,
      stories,
    };
  } catch (error) {
    // Improve error logging with more context
    if (error instanceof Error) {
      logger.error('Batch query error', error, {
        userId,
        timestamp: new Date().toISOString(),
      });
    } else {
      const unknownError = new Error(`Unknown error: ${String(error)}`);
      logger.error('Batch query error (unknown type)', unknownError, {
        error: String(error),
        userId,
        timestamp: new Date().toISOString(),
      });
    }
    throw error;
  }
}

// Cache invalidation
export async function invalidateCache(keys: string[]) {
  try {
    // This would typically call an API endpoint to invalidate cache
    // For now, we'll just log the invalidation
    logger.info(`Cache invalidation requested for keys: ${keys.join(', ')}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Cache invalidation error', error, {
        keys,
        timestamp: new Date().toISOString(),
      });
    } else {
      const unknownError = new Error(`Unknown error: ${String(error)}`);
      logger.error('Cache invalidation error (unknown type)', unknownError, {
        error: String(error),
        keys,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
