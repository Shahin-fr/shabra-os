/**
 * User State Management Store
 *
 * This store manages all user-related state including authentication, profile information,
 * preferences, and session management. It's separated from the main consolidated store
 * to improve maintainability and reduce complexity.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

import { logUser } from '@/lib/logger';

// ============================================================================
// USER STATE INTERFACES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
  lastLogin?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    stories: boolean;
    tasks: boolean;
    projects: boolean;
  };
  ui: {
    sidebarCollapsed: boolean;
    compactMode: boolean;
    animations: boolean;
    highContrast: boolean;
  };
}

export interface UserState {
  // Core user data
  profile: UserProfile | null;
  preferences: UserPreferences;

  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: Date;

  // Session management
  sessionExpiry: Date | null;
  refreshToken: string | null;
}

export interface UserActions {
  // Authentication
  setUser: (profile: UserProfile | null) => void;
  setUserLoading: (loading: boolean) => void;
  logout: () => void;

  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;

  // Session
  updateLastActivity: () => void;
  setSessionExpiry: (expiry: Date | null) => void;
  setRefreshToken: (token: string | null) => void;

  // Utility actions
  reset: () => void;
}

export type UserStore = UserState & UserActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialUserState: UserState = {
  profile: null,
  preferences: {
    theme: 'system',
    language: 'fa',
    notifications: {
      email: true,
      push: true,
      stories: true,
      tasks: true,
      projects: true,
    },
    ui: {
      sidebarCollapsed: false,
      compactMode: false,
      animations: true,
      highContrast: false,
    },
  },
  isAuthenticated: false,
  isLoading: false,
  lastActivity: new Date(),
  sessionExpiry: null,
  refreshToken: null,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useUserStore = create<UserStore>()(
  persist(
    subscribeWithSelector(
      immer(set => ({
        // ========================================================================
        // INITIAL STATE
        // ========================================================================
        ...initialUserState,

        // ========================================================================
        // AUTHENTICATION ACTIONS
        // ========================================================================
        setUser: profile =>
          set(state => {
            state.profile = profile;
            state.isAuthenticated = !!profile;
            state.lastActivity = new Date();
            if (profile) {
              logUser('User authenticated', {
                userId: profile.id,
                email: profile.email,
              });
            } else {
              logUser('User logged out');
            }
          }),

        setUserLoading: loading =>
          set(state => {
            state.isLoading = loading;
          }),

        logout: () =>
          set(state => {
            state.profile = null;
            state.isAuthenticated = false;
            state.sessionExpiry = null;
            state.refreshToken = null;
            logUser('User logged out');
          }),

        // ========================================================================
        // PREFERENCES ACTIONS
        // ========================================================================
        updatePreferences: preferences =>
          set(state => {
            state.preferences = { ...state.preferences, ...preferences };
            logUser('Preferences updated', { preferences });
          }),

        resetPreferences: () =>
          set(state => {
            state.preferences = initialUserState.preferences;
            logUser('Preferences reset');
          }),

        // ========================================================================
        // SESSION ACTIONS
        // ========================================================================
        updateLastActivity: () =>
          set(state => {
            state.lastActivity = new Date();
          }),

        setSessionExpiry: expiry =>
          set(state => {
            state.sessionExpiry = expiry;
          }),

        setRefreshToken: token =>
          set(state => {
            state.refreshToken = token;
          }),

        // ========================================================================
        // UTILITY ACTIONS
        // ========================================================================
        reset: () =>
          set(state => {
            Object.assign(state, initialUserState);
            logUser('User state reset');
          }),
      }))
    ),
    {
      name: 'shabra-os-user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist user preferences and non-sensitive data
        preferences: state.preferences,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// ============================================================================
// SELECTORS FOR OPTIMIZED STATE ACCESS
// ============================================================================

// Profile selectors
export const useUserProfile = () => useUserStore(state => state.profile);
export const useUserId = () => useUserStore(state => state.profile?.id);
export const useUserEmail = () => useUserStore(state => state.profile?.email);
export const useUserName = () => useUserStore(state => state.profile?.name);
export const useUserRoles = () =>
  useUserStore(state => state.profile?.roles || []);
export const useUserAvatar = () => useUserStore(state => state.profile?.avatar);
export const useLastLogin = () =>
  useUserStore(state => state.profile?.lastLogin);

// Authentication selectors
export const useIsAuthenticated = () =>
  useUserStore(state => state.isAuthenticated);
export const useIsLoading = () => useUserStore(state => state.isLoading);
export const useLastActivity = () => useUserStore(state => state.lastActivity);

// Preferences selectors
export const useUserPreferences = () =>
  useUserStore(state => state.preferences);
export const useTheme = () => useUserStore(state => state.preferences.theme);
export const useLanguage = () =>
  useUserStore(state => state.preferences.language);
export const useNotificationSettings = () =>
  useUserStore(state => state.preferences.notifications);
export const useUISettings = () => useUserStore(state => state.preferences.ui);

// Session selectors
export const useSessionExpiry = () =>
  useUserStore(state => state.sessionExpiry);
export const useRefreshToken = () => useUserStore(state => state.refreshToken);
export const useIsSessionExpired = () =>
  useUserStore(state => {
    const expiry = state.sessionExpiry;
    return expiry ? new Date() > expiry : false;
  });

// Role-based selectors
export const useHasRole = (role: string) =>
  useUserStore(state => state.profile?.roles?.includes(role) ?? false);
export const useIsAdmin = () =>
  useUserStore(state => state.profile?.roles?.includes('ADMIN') ?? false);
export const useIsManager = () =>
  useUserStore(state => state.profile?.roles?.includes('MANAGER') ?? false);
export const useIsEmployee = () =>
  useUserStore(state => state.profile?.roles?.includes('EMPLOYEE') ?? false);
export const useHasAnyRole = (roles: string[]) =>
  useUserStore(
    state => roles.some(role => state.profile?.roles?.includes(role)) ?? false
  );

// Individual action selectors to prevent infinite re-renders
export const useSetUser = () => useUserStore(state => state.setUser);
export const useSetUserLoading = () =>
  useUserStore(state => state.setUserLoading);
export const useLogout = () => useUserStore(state => state.logout);
export const useUpdatePreferences = () =>
  useUserStore(state => state.updatePreferences);
export const useResetPreferences = () =>
  useUserStore(state => state.resetPreferences);
export const useUpdateLastActivity = () =>
  useUserStore(state => state.updateLastActivity);
export const useSetSessionExpiry = () =>
  useUserStore(state => state.setSessionExpiry);
export const useSetRefreshToken = () =>
  useUserStore(state => state.setRefreshToken);
export const useResetUser = () => useUserStore(state => state.reset);

// Action selector for backward compatibility (use individual selectors for better performance)
export const useUserActions = () => {
  const setUser = useSetUser();
  const setUserLoading = useSetUserLoading();
  const logout = useLogout();
  const updatePreferences = useUpdatePreferences();
  const resetPreferences = useResetPreferences();
  const updateLastActivity = useUpdateLastActivity();
  const setSessionExpiry = useSetSessionExpiry();
  const setRefreshToken = useSetRefreshToken();
  const reset = useResetUser();

  return {
    setUser,
    setUserLoading,
    logout,
    updatePreferences,
    resetPreferences,
    updateLastActivity,
    setSessionExpiry,
    setRefreshToken,
    reset,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a user profile with default values
 */
export const createUserProfile = (
  id: string,
  email: string,
  name: string,
  roles: string[] = ['EMPLOYEE'],
  avatar?: string
): UserProfile => ({
  id,
  email,
  name,
  roles,
  avatar,
  lastLogin: new Date(),
});

/**
 * Create user preferences with default values
 */
export const createUserPreferences = (
  overrides: Partial<UserPreferences> = {}
): UserPreferences => ({
  theme: 'system',
  language: 'fa',
  notifications: {
    email: true,
    push: true,
    stories: true,
    tasks: true,
    projects: true,
  },
  ui: {
    sidebarCollapsed: false,
    compactMode: false,
    animations: true,
    highContrast: false,
  },
  ...overrides,
});

/**
 * Check if user has required permissions
 */
export const hasPermission = (
  userRoles: string[],
  requiredRoles: string[]
): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Get user's highest privilege level
 */
export const getHighestPrivilege = (roles: string[]): string => {
  const privilegeHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    EMPLOYEE: 1,
  };

  const highestLevel = Math.max(
    ...roles.map(
      role => privilegeHierarchy[role as keyof typeof privilegeHierarchy] || 0
    )
  );

  return (
    Object.keys(privilegeHierarchy).find(
      key =>
        privilegeHierarchy[key as keyof typeof privilegeHierarchy] ===
        highestLevel
    ) || 'EMPLOYEE'
  );
};

// ============================================================================
// AUTOMATIC SESSION MANAGEMENT
// ============================================================================

// Set up automatic session expiry check
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useUserStore.getState();
    const expiry = state.sessionExpiry;

    if (expiry && new Date() > expiry) {
      logUser('Session expired, logging out user');
      state.logout();
    }
  }, 60 * 1000); // Check every minute
}

// Set up activity tracking
if (typeof window !== 'undefined') {
  const updateActivity = () => {
    const state = useUserStore.getState();
    if (state.isAuthenticated) {
      state.updateLastActivity();
    }
  };

  // Update activity on user interactions
  [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ].forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });
}
