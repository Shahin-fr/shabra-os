# Manual Refetching Implementation - Storyboard UI Update Fix

## Problem Solved

The previous cache invalidation approach was not working reliably. The UI was not updating after successful mutations (template assignment, story creation, deletion) without manual page refresh.

## Solution: Direct Manual Refetching

Implemented a direct manual refetching pattern that bypasses React Query's automatic cache invalidation and forces an immediate data refresh from the server.

## Implementation Details

### 1. Modified `useStoryboardData` Hook

**File:** `src/hooks/useStoryboardData.ts`

**Changes:**

- Added `refetch: refetchStories` to the stories query
- Exported `refetchStories` function in the return object

```typescript
const {
  data: stories = [],
  isLoading: storiesLoading,
  isError: storiesError,
  error: storiesErrorDetails,
  refetch: refetchStories, // ← Added this
} = useQuery({
  queryKey: storiesKeys.byDay(dateString),
  queryFn: () => fetchStoriesByDay(dateString),
  retry: 2,
  retryDelay: 1000,
});

return {
  storyTypes,
  stories,
  storyTypesLoading,
  storiesLoading,
  storyTypesError,
  storiesError,
  storiesErrorDetails,
  refetchStories, // ← Exported this
};
```

### 2. Updated Main Storyboard Page

**File:** `src/app/storyboard/page.tsx`

**Changes:**

- Destructured `refetchStories` from `useStoryboardData`
- Passed `refetchStories` as prop to `StoryManagement` component

```typescript
const {
  storyTypes,
  stories,
  storyTypesLoading,
  storiesLoading,
  storyTypesError,
  storiesError,
  storiesErrorDetails,
  refetchStories, // ← Added this
} = useStoryboardData(selectedDate);

// Passed to StoryManagement component
<StoryManagement
  // ... other props
  refetchStories={refetchStories} // ← Added this
/>
```

### 3. Updated StoryManagement Component Interface

**File:** `src/components/storyboard/StoryManagementNew.tsx`

**Changes:**

- Added `refetchStories: () => Promise<any>` to the props interface
- Updated component function signature to accept the new prop
- Removed unused `useQueryClient` import

```typescript
interface StoryManagementProps {
  // ... existing props
  refetchStories: () => Promise<any>; // ← Added this
}

export function StoryManagementNew({
  // ... existing props
  refetchStories, // ← Added this
}: StoryManagementProps) {
```

### 4. Replaced Cache Invalidation with Direct Refetch

**File:** `src/components/storyboard/StoryManagementNew.tsx`

**Before (Cache Invalidation):**

```typescript
onSuccess: async () => {
  // Complex cache invalidation logic
  await queryClient.invalidateQueries({
    queryKey: storiesKeys.byDay(dateString),
  });
  await queryClient.invalidateQueries({
    queryKey: storiesKeys.all,
  });
  await queryClient.refetchQueries({
    queryKey: storiesKeys.byDay(dateString),
  });
};
```

**After (Direct Refetch):**

```typescript
onSuccess: async () => {
  showStatusMessage('استوری با موفقیت ایجاد شد!', 3000);
  console.log('🔄 Mutation successful. Manually refetching storyboard data...');

  // Direct refetch of the main storyboard query
  await refetchStories();

  console.log('✅ Manual refetch completed');
  onSelectedSlotIndexChange(null);
};
```

### 5. Updated Operations Hook

**File:** `src/hooks/useStoryboardOperationsNew.ts`

**Changes:**

- Added `refetchStories` parameter to the hook
- Replaced cache invalidation with direct refetch in `applyTemplate`
- Removed unused imports (`useMutation`, `useQueryClient`, `storiesKeys`)

```typescript
export function useStoryboardOperationsNew(
  selectedDate: Date,
  selectedSlotIndex: number | null,
  stories: any[],
  storyTypes: any[],
  createStoryMutation: any,
  updateStoryMutation: any,
  deleteStoryMutation: any,
  refetchStories: () => Promise<any> // ← Added this
) {
  // ... existing code

  const applyTemplate = async (storyTypeId: string) => {
    // ... existing logic

    // Force refetch of stories after template application
    await refetchStories(); // ← Simplified to direct refetch
  };
}
```

## Key Benefits

### ✅ **Reliability**

- Direct refetch bypasses any cache invalidation issues
- Guarantees fresh data from the server
- No dependency on React Query's cache management

### ✅ **Simplicity**

- Single function call: `await refetchStories()`
- No complex cache invalidation logic
- Clear and predictable behavior

### ✅ **Immediate UI Updates**

- UI updates immediately after successful mutations
- No need for manual page refresh
- Consistent behavior across all operations

### ✅ **Debugging**

- Clear console logs show when refetch occurs
- Easy to track the flow of data updates
- Simple to troubleshoot if issues arise

## Mutation Success Flow

1. **User Action** → Click template, create story, delete story, etc.
2. **Mutation Executes** → API call to backend
3. **Backend Success** → Data saved to database
4. **onSuccess Callback** → Shows success message
5. **Manual Refetch** → `await refetchStories()` called
6. **Fresh Data** → New data fetched from server
7. **UI Updates** → Component re-renders with new data
8. **User Sees Changes** → Immediate visual feedback

## Testing Instructions

1. **Navigate to Storyboard page**
2. **Select a date** using the date picker
3. **Click on an empty slot** (should show selection)
4. **Click on a template** from the palette
5. **Verify immediate UI update** - slot should show the template immediately
6. **Check browser console** for refetch logs:
   - `🔄 Mutation successful. Manually refetching storyboard data...`
   - `✅ Manual refetch completed`
7. **Test other operations** - create, update, delete should all work the same way

## Files Modified

1. `src/hooks/useStoryboardData.ts` - Added refetchStories export
2. `src/app/storyboard/page.tsx` - Passed refetchStories to component
3. `src/components/storyboard/StoryManagementNew.tsx` - Implemented direct refetch
4. `src/hooks/useStoryboardOperationsNew.ts` - Updated to use direct refetch

## Result

The UI now updates immediately upon any successful mutation without requiring manual page refresh. The direct refetching approach is more reliable and predictable than cache invalidation, ensuring users always see the most current data from the server.
