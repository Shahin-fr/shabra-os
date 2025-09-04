# Date Format Debugging Implementation

## Problem Analysis

The user identified that the root cause of the UI update issue is likely a **date format mismatch** between the Jalali (Persian) calendar used in the UI and the Gregorian calendar used in the backend/database.

## Symptoms Explained

1. **User selects Jalali date** (e.g., 1403/06/12) in UI
2. **Frontend sends Jalali date** to backend
3. **Backend incorrectly processes** the date (converts to wrong Gregorian date or stores in wrong format)
4. **Story is saved** but under a different date key
5. **Frontend refetches** for original Jalali date but finds nothing
6. **UI doesn't update** until hard refresh

## Comprehensive Logging Implementation

### 1. Frontend Logging

#### A. Main Storyboard Page (`src/app/storyboard/page.tsx`)

```typescript
// Log the selected date whenever it changes
console.log('🗓️ StoryboardPage - selectedDate:', selectedDate);
console.log('🗓️ StoryboardPage - selectedDate type:', typeof selectedDate);
console.log(
  '🗓️ StoryboardPage - selectedDate ISO:',
  selectedDate.toISOString()
);
```

#### B. useStoryboardData Hook (`src/hooks/useStoryboardData.ts`)

```typescript
console.log('📅 useStoryboardData - selectedDate:', selectedDate);
console.log('📅 useStoryboardData - selectedDate type:', typeof selectedDate);
console.log(
  '📅 useStoryboardData - selectedDate ISO:',
  selectedDate.toISOString()
);
console.log('📅 useStoryboardData - dateString (Jalali):', dateString);
console.log('📅 useStoryboardData - queryKey:', storiesKeys.byDay(dateString));
```

#### C. fetchStoriesByDay Function (`src/lib/queries.ts`)

```typescript
console.log('🌐 fetchStoriesByDay - day parameter:', day);
console.log('🌐 fetchStoriesByDay - day type:', typeof day);
console.log('🌐 fetchStoriesByDay - URL:', url);
console.log('🌐 fetchStoriesByDay - API response:', result);
console.log('🌐 fetchStoriesByDay - response type:', typeof result);
console.log('🌐 fetchStoriesByDay - is array:', Array.isArray(result));
```

#### D. StoryManagement Component (`src/components/storyboard/StoryManagementNew.tsx`)

```typescript
console.log('📝 createStoryMutation - storyData:', storyData);
console.log('📝 createStoryMutation - storyData.day:', storyData.day);
console.log(
  '📝 createStoryMutation - storyData.day type:',
  typeof storyData.day
);
console.log('📝 createStoryMutation - dateString from component:', dateString);
```

### 2. Backend Logging

#### A. GET /api/stories (`src/app/api/stories/route.ts`)

```typescript
console.log('🔍 GET /api/stories - Raw dayParam from URL:', dayParam);
console.log('🔍 GET /api/stories - dayParam type:', typeof dayParam);
console.log('🔍 GET /api/stories - Full URL:', request.url);
console.log('🔍 GET /api/stories - dayDate after new Date():', dayDate);
console.log(
  '🔍 GET /api/stories - dayDate.toISOString():',
  dayDate.toISOString()
);
console.log('🔍 GET /api/stories - dayDate.getTime():', dayDate.getTime());
console.log(
  '🔍 GET /api/stories - isNaN(dayDate.getTime()):',
  isNaN(dayDate.getTime())
);
```

#### B. POST /api/stories (`src/app/api/stories/route.ts`)

```typescript
console.log('📝 POST /api/stories - Raw request body:', body);
console.log('📝 POST /api/stories - day field:', day);
console.log('📝 POST /api/stories - day type:', typeof day);
console.log('📝 POST /api/stories - day value:', day);
```

#### C. Database Query Optimizer (`src/lib/database/query-optimizer.ts`)

**getStoriesByDay method:**

```typescript
console.log('🗄️ getStoriesByDay - Input day parameter:', day);
console.log('🗄️ getStoriesByDay - day type:', typeof day);
console.log('🗄️ getStoriesByDay - day.toISOString():', day.toISOString());
console.log('🗄️ getStoriesByDay - dayString (Jalali formatted):', dayString);
console.log('🗄️ getStoriesByDay - dayString type:', typeof dayString);
console.log('🗄️ getStoriesByDay - Database query WHERE day =', dayString);
```

**createStory method:**

```typescript
console.log('🗄️ createStory - storyData:', storyData);
console.log('🗄️ createStory - storyData.day:', storyData.day);
console.log('🗄️ createStory - storyData.day type:', typeof storyData.day);
console.log('🗄️ createStory - dayString:', dayString);
console.log('🗄️ createStory - dayString type:', typeof dayString);
```

## Expected Log Flow

### When User Selects a Date:

1. `🗓️ StoryboardPage` - Shows the selected Date object
2. `📅 useStoryboardData` - Shows the Jalali formatted dateString
3. `🌐 fetchStoriesByDay` - Shows the day parameter being sent to API
4. `🔍 GET /api/stories` - Shows how backend receives and processes the date
5. `🗄️ getStoriesByDay` - Shows the database query with the formatted date

### When User Creates a Story:

1. `📝 createStoryMutation` - Shows the storyData with day field
2. `📝 POST /api/stories` - Shows the raw request body received by backend
3. `🗄️ createStory` - Shows the data being saved to database

## Key Questions to Answer

1. **Date Format Consistency**: Are the same date strings used in:
   - Frontend query keys
   - API request parameters
   - Database WHERE clauses
   - Database INSERT operations

2. **Date Conversion Issues**: Is the backend incorrectly converting:
   - Jalali dates to Gregorian dates
   - Date strings to Date objects incorrectly
   - Date objects back to strings in wrong format

3. **Database Storage**: Are stories being saved with:
   - The correct date format
   - The same date format used in queries

## Testing Instructions

1. **Open browser console** to see all the logging
2. **Navigate to Storyboard page**
3. **Select a Jalali date** (e.g., 1403/06/12)
4. **Observe the log flow** from frontend to backend
5. **Click on an empty slot** and assign a template
6. **Observe the creation logs** from frontend to database
7. **Check if the UI updates** immediately
8. **Compare the date strings** used in queries vs. creation

## Files Modified

1. `src/app/storyboard/page.tsx` - Added date selection logging
2. `src/hooks/useStoryboardData.ts` - Added date formatting logging
3. `src/lib/queries.ts` - Added API call logging
4. `src/components/storyboard/StoryManagementNew.tsx` - Added mutation logging
5. `src/app/api/stories/route.ts` - Added GET and POST endpoint logging
6. `src/lib/database/query-optimizer.ts` - Added database operation logging

## Next Steps

After implementing this comprehensive logging, we can:

1. **Identify the exact point** where date format mismatch occurs
2. **Standardize the date format** across the entire flow
3. **Fix the conversion logic** to ensure consistency
4. **Remove the logging** once the issue is resolved

This debugging approach will reveal the exact date strings being passed between frontend and backend, allowing us to identify and fix the format mismatch that's causing the UI update issue.
