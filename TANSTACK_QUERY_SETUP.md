# TanStack Query Integration

This document describes the TanStack Query (React Query) integration in the Shabra OS project.

## Overview

TanStack Query has been integrated to provide:

- **Efficient data fetching** with automatic caching
- **Background updates** and synchronization
- **Error handling** and retry logic
- **Loading states** management
- **Mutations** with automatic cache invalidation
- **Optimistic updates** for better user experience

## Installation

The following packages have been installed:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Setup

### 1. Query Client Provider

The Query Client is configured in `src/app/providers.tsx` with the following defaults:

- **Stale Time**: 1 minute (queries are considered fresh for 1 minute)
- **Retry**: 1 attempt on failure
- **DevTools**: Disabled for clean UI

### 2. Query Keys Structure

Query keys are organized in a hierarchical structure for better cache management:

```typescript
// Projects
projectsKeys.all = ['projects'];
projectsKeys.lists() = ['projects', 'list'];
projectsKeys.list(filters) = ['projects', 'list', { filters }];
projectsKeys.details() = ['projects', 'detail'];
projectsKeys.detail(id) = ['projects', 'detail', id];

// Tasks
tasksKeys.all = ['tasks'];
tasksKeys.lists() = ['tasks', 'list'];
tasksKeys.list(filters) = ['tasks', 'list', { filters }];
tasksKeys.details() = ['tasks', 'detail'];
tasksKeys.detail(id) = ['tasks', 'detail', id];

// Stories
storiesKeys.all = ['stories'];
storiesKeys.lists() = ['stories', 'list'];
storiesKeys.list(filters) = ['stories', 'list', { filters }];
storiesKeys.details() = ['stories', 'detail'];
storiesKeys.detail(id) = ['stories', 'detail', id];
storiesKeys.byDay(day) = ['stories', 'day', day];

// Story Types
storyTypesKeys.all = ['storyTypes'];
storyTypesKeys.lists() = ['storyTypes', 'list'];
storyTypesKeys.list(filters) = ['storyTypes', 'list', { filters }];
storyTypesKeys.details() = ['storyTypes', 'detail'];
storyTypesKeys.detail(id) = ['storyTypes', 'detail', id];
```

## Usage Examples

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchProjects, projectsKeys } from '@/lib/queries';

const {
  data: projects,
  isLoading,
  isError,
} = useQuery({
  queryKey: projectsKeys.all,
  queryFn: fetchProjects,
  enabled: status === 'authenticated',
});
```

### Query with Parameters

```typescript
const { data: project } = useQuery({
  queryKey: projectsKeys.detail(projectId),
  queryFn: () => fetchProject(projectId),
  enabled: !!projectId,
});
```

### Date-based Query (Stories)

```typescript
const {
  data: stories,
  isLoading,
  isError,
} = useQuery({
  queryKey: storiesKeys.byDay(format(selectedDate, 'yyyy-MM-dd')),
  queryFn: () => fetchStoriesByDay(format(selectedDate, 'yyyy-MM-dd')),
});
```

### Mutations with Cache Invalidation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const createProject = useMutation({
  mutationFn: newProject =>
    fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProject),
    }),
  onSuccess: () => {
    // Invalidate and refetch projects
    queryClient.invalidateQueries({ queryKey: projectsKeys.all });
  },
});
```

### Advanced Mutations with Optimistic Updates

```typescript
const updateStoryOrderMutation = useMutation({
  mutationFn: async ({ storyId, order }) => {
    const response = await fetch(`/api/stories/${storyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ order }),
    });
    if (!response.ok) throw new Error('Failed to update story order');
    return response.json();
  },
  onMutate: async ({ storyId, order }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: storiesKeys.byDay(selectedDate),
    });

    // Snapshot previous value
    const previousStories = queryClient.getQueryData(
      storiesKeys.byDay(selectedDate)
    );

    // Optimistically update
    queryClient.setQueryData(storiesKeys.byDay(selectedDate), old =>
      old?.map(story => (story.id === storyId ? { ...story, order } : story))
    );

    return { previousStories };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousStories) {
      queryClient.setQueryData(
        storiesKeys.byDay(selectedDate),
        context.previousStories
      );
    }
  },
  onSettled: () => {
    // Always refetch to ensure sync
    queryClient.invalidateQueries({
      queryKey: storiesKeys.byDay(selectedDate),
    });
  },
});
```

## File Structure

```
src/
├── lib/
│   └── queries.ts          # Centralized query functions and keys
├── types/
│   ├── project.ts          # Project interface
│   └── story.ts            # Story and StoryType interfaces
└── app/
    ├── projects/
    │   └── page.tsx        # Projects page using TanStack Query
    └── storyboard/
        └── page.tsx        # Storyboard page using TanStack Query with mutations
```

## Refactored Components

### 1. Projects Page (`/projects`)

- ✅ Refactored to use TanStack Query
- ✅ Automatic caching and background updates
- ✅ Proper error handling and loading states
- ✅ Clean component without manual state management

### 2. Storyboard Page (`/storyboard`)

- ✅ Refactored to use TanStack Query
- ✅ Two separate queries: stories by date and story types
- ✅ Automatic refetching when date changes
- ✅ **NEW: Mutations for all data-changing operations**
- ✅ **NEW: Proper optimistic updates with server confirmation**
- ✅ **NEW: Instant UI feedback for all CRUD operations**
- ✅ **NEW: Comprehensive error handling with rollback capability**
- ✅ **NEW: User-friendly success/error messages**
- ✅ Clean component without manual state management

## Benefits

1. **Automatic Caching**: Queries are cached and shared across components
2. **Background Updates**: Data stays fresh with automatic background refetching
3. **Error Handling**: Built-in error states and retry logic
4. **Loading States**: Consistent loading state management
5. **Type Safety**: Full TypeScript support with proper typing
6. **Performance**: Instant loading from cache on subsequent visits
7. **Clean Code**: No more manual useEffect and useState for data fetching
8. **Real-time Updates**: UI automatically updates after mutations
9. **Optimistic Updates**: Instant feedback for better user experience
10. **Error Recovery**: Automatic rollback on failed operations

## Best Practices

1. **Use centralized query keys** from `src/lib/queries.ts`
2. **Implement proper error boundaries** for error states
3. **Use the `enabled` option** to control when queries should run
4. **Always invalidate related queries** after mutations
5. **Leverage automatic refetching** instead of manual refresh calls
6. **Use proper TypeScript interfaces** for type safety
7. **Implement optimistic updates** for better UX
8. **Handle rollbacks** in mutation error callbacks
9. **Use `onSettled`** to ensure data consistency

## Mutation Patterns

### Basic Mutation

```typescript
const mutation = useMutation({
  mutationFn: data => apiCall(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: relatedQueryKey });
  },
});
```

### Optimistic Update Mutation (Improved)

```typescript
const mutation = useMutation({
  mutationFn: data => apiCall(data),
  onMutate: async variables => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKey });

    // Snapshot previous value
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update
    queryClient.setQueryData(queryKey, optimisticData);

    return { previousData };
  },
  onSuccess: () => {
    // Only invalidate on success to confirm optimistic update
    queryClient.invalidateQueries({ queryKey: queryKey });

    // Show success message
    setSuccessMessage('Operation completed successfully!');
    setShowSuccess(true);
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousData) {
      queryClient.setQueryData(queryKey, context.previousData);
    }

    // Show error message
    showError('Operation failed. Please try again.');
  },
});
```

### Key Improvements in Storyboard Implementation

1. **Persistent Optimistic Updates**: Updates persist until server confirmation
2. **Selective Cache Invalidation**: Only invalidate on success, not on error
3. **User Feedback**: Success and error messages for all operations
4. **Proper Rollback**: Automatic UI restoration on server failures
5. **Performance**: No unnecessary refetches during optimistic updates

## Next Steps

Consider implementing TanStack Query in other components:

- Tasks page
- User management
- Any other data-fetching components

This will provide a consistent data-fetching pattern across the entire application.

## Migration Notes

When refactoring components from the old pattern to TanStack Query:

1. **Remove manual state**: Replace `useState` for data with `useQuery` data
2. **Remove manual effects**: Replace `useEffect` with `useQuery` enabled option
3. **Remove manual loading**: Use `isLoading` from `useQuery`
4. **Remove manual errors**: Use `isError` from `useQuery`
5. **Remove manual refresh**: TanStack Query handles this automatically
6. **Add proper error UI**: Implement error states for better UX
7. **Convert mutations**: Replace direct fetch calls with `useMutation` hooks
8. **Add cache invalidation**: Invalidate related queries after mutations
9. **Implement optimistic updates**: For better user experience
10. **Handle rollbacks**: Provide error recovery mechanisms
