# State Management Migration Guide

## Overview

This guide explains how to migrate from the old, overlapping state management system to the new consolidated state management system.

## What Changed

### Before (Old System)

- **useUserStore**: User state, preferences, authentication
- **useUIStore**: UI state, notifications, modals
- **useCacheStore**: Data caching (overlapped with TanStack Query)
- **Multiple overlapping responsibilities**

### After (New System)

- **useAppStore**: Single, consolidated store with clear separation of concerns
- **User State**: Authentication, profile, preferences
- **UI State**: Navigation, modals, notifications (ephemeral)
- **App State**: Global settings, feature flags
- **Cache State**: Optimized caching with TanStack Query integration

## Migration Steps

### Step 1: Update Imports

#### Old Way

```typescript
import { useUserStore, useUIStore, useCacheStore } from '@/stores';
```

#### New Way

```typescript
import {
  useUser,
  useIsAuthenticated,
  useUserPreferences,
  useSidebarOpen,
  useNotifications,
  useAppSettings,
  useCache,
} from '@/stores/consolidated-store';
```

### Step 2: Update Store Usage

#### User State Migration

##### Old Way

```typescript
const { user, isAuthenticated, isLoading } = useUserStore();
const { setUser, updateUserPreferences, logout } = useUserStore();
```

##### New Way

```typescript
const user = useUser();
const isAuthenticated = useIsAuthenticated();
const isLoading = useIsLoading();
const { setUser, updatePreferences, logout } = useUserActions();
```

#### UI State Migration

##### Old Way

```typescript
const { sidebarOpen, notifications, modals } = useUIStore();
const { toggleSidebar, addNotification, openModal } = useUIStore();
```

##### New Way

```typescript
const sidebarOpen = useSidebarOpen();
const notifications = useNotifications();
const modals = useModals();
const { toggleSidebar, addNotification, openModal } = useUIActions();
```

#### Cache State Migration

##### Old Way

```typescript
const { stories, projects, users } = useCacheStore();
const { updateCache, clearCache, invalidateCache } = useCacheStore();
```

##### New Way

```typescript
const storiesCache = useCache('stories');
const projectsCache = useCache('projects');
const usersCache = useCache('users');
const { set, delete, clear, invalidate } = useCacheActions();
```

### Step 3: Update Component Logic

#### Example: User Profile Component

##### Old Way

```typescript
import { useUserStore } from '@/stores';

export function UserProfile() {
  const { user, preferences, updateUserPreferences } = useUserStore();

  const handleThemeChange = (theme: string) => {
    updateUserPreferences({ theme });
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <select value={preferences.theme} onChange={(e) => handleThemeChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
```

##### New Way

```typescript
import { useUser, useUserPreferences, useUserActions } from '@/stores/consolidated-store';

export function UserProfile() {
  const user = useUser();
  const preferences = useUserPreferences();
  const { updatePreferences } = useUserActions();

  const handleThemeChange = (theme: string) => {
    updatePreferences({ theme: theme as 'light' | 'dark' | 'system' });
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <select value={preferences.theme} onChange={(e) => handleThemeChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
```

#### Example: Sidebar Component

##### Old Way

```typescript
import { useUIStore } from '@/stores';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
}
```

##### New Way

```typescript
import { useSidebarOpen, useUIActions } from '@/stores/consolidated-store';

export function Sidebar() {
  const sidebarOpen = useSidebarOpen();
  const { toggleSidebar } = useUIActions();

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
}
```

### Step 4: Update Cache Usage

#### Old Way

```typescript
import { useCacheStore } from '@/stores';

export function ProjectList() {
  const { projects, updateCache } = useCacheStore();

  const handleProjectUpdate = (project: Project) => {
    updateCache('projects', { ...projects, [project.id]: project });
  };

  return (
    <div>
      {Object.values(projects).map(project => (
        <ProjectCard key={project.id} project={project} onUpdate={handleProjectUpdate} />
      ))}
    </div>
  );
}
```

#### New Way

```typescript
import { useCache, useCacheActions } from '@/stores/consolidated-store';

export function ProjectList() {
  const projectsCache = useCache('projects');
  const { set } = useCacheActions();

  const handleProjectUpdate = (project: Project) => {
    const currentProjects = projectsCache?.data || {};
    set('projects', { ...currentProjects, [project.id]: project });
  };

  return (
    <div>
      {Object.values(projectsCache?.data || {}).map(project => (
        <ProjectCard key={project.id} project={project} onUpdate={handleProjectUpdate} />
      ))}
    </div>
  );
}
```

## Benefits of the New System

### 1. **Clear Separation of Concerns**

- User state is separate from UI state
- Cache state is optimized and doesn't overlap with TanStack Query
- App settings are centralized

### 2. **Better Performance**

- Selective persistence (only essential state is persisted)
- Optimized selectors prevent unnecessary re-renders
- Automatic cache cleanup and memory management

### 3. **Improved Developer Experience**

- Single import source for all state
- Consistent API across all state types
- Better TypeScript support and type safety

### 4. **Reduced Bundle Size**

- Eliminates duplicate state management code
- Single store instead of multiple stores
- Better tree-shaking support

## Testing the Migration

### 1. **Run TypeScript Check**

```bash
npm run type-check
```

### 2. **Test Core Functionality**

- User authentication
- UI state changes
- Cache operations
- App settings

### 3. **Verify Performance**

- Check for unnecessary re-renders
- Monitor memory usage
- Verify cache cleanup

## Rollback Plan

If issues arise during migration, you can temporarily revert by:

1. **Keep both systems running** during transition
2. **Gradually migrate components** one by one
3. **Use feature flags** to enable/disable new system
4. **Maintain backward compatibility** in the new store

## Support

For migration issues or questions:

1. Check the TypeScript errors for import issues
2. Verify that all required selectors are imported
3. Ensure component logic matches the new API
4. Test thoroughly before deploying to production
