import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { logAuth, logUser, logError } from '@/lib/logger';
import {
  useSetUser,
  useLogout,
  useSetUserLoading,
  useIsLoading,
} from '@/stores/userStore';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
  preferences: {
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
  };
}

export function useAuth() {
  const { data: session, status } = useSession();
  const setUser = useSetUser();
  const logoutFromStore = useLogout();
  const setUserLoading = useSetUserLoading();
  const storeLoading = useIsLoading();

  // Use useRef to store timeout ID to avoid dependency issues
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add a force override state to break out of infinite loading
  const [forceLoading, setForceLoading] = useState(false);

  // Debug logging
  logAuth('useAuth hook status update', {
    status,
    hasSession: !!session,
    storeLoading,
    forceLoading,
  });

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    logAuth('useAuth useEffect triggered', { status, hasSession: !!session });

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (status === 'loading') {
      logAuth('Setting loading to true (NextAuth loading)');
      setUserLoading(true);

      // Set a timeout to prevent infinite loading - more aggressive
      const timeout = setTimeout(() => {
        logAuth('Loading timeout reached, forcing loading to false');
        setUserLoading(false);
        setForceLoading(true); // Force override the loading state
        loadingTimeoutRef.current = null;
      }, 3000); // Reduced to 3 seconds

      loadingTimeoutRef.current = timeout;
      return;
    }

    if (status === 'authenticated' && session?.user) {
      logAuth('User authenticated, setting user in store');
      logUser('Session user object received', {
        userId: session.user.id,
        email: session.user.email,
        hasRoles: !!(session.user as any).roles?.length,
      });

      // Transform NextAuth session to our User format
      const user: AuthUser = {
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        roles: (session.user as any).roles || ['EMPLOYEE'],
        avatar: (session.user as any).avatar,
        preferences: {
          theme: 'light',
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
      };

      logUser('Transformed user object created', {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });
      setUser(user);
      logAuth('Setting loading to false (user authenticated)');
      setUserLoading(false);
      setForceLoading(false);
    } else if (status === 'unauthenticated') {
      logAuth('User unauthenticated, logging out from store');
      logoutFromStore();
      logAuth('Setting loading to false (user unauthenticated)');
      setUserLoading(false);
      setForceLoading(false);
    } else {
      // For any other status, ensure loading is false
      logAuth('Other status encountered, setting loading to false', { status });
      setUserLoading(false);
      setForceLoading(false);
    }
  }, [session, status, setUser, logoutFromStore, setUserLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    logAuth('Login function called', { email, hasPassword: !!password });
    setUserLoading(true);
    setForceLoading(false); // Reset force loading when attempting login

    try {
      logAuth('Calling signIn...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      logAuth('signIn result received', {
        success: result?.ok,
        hasError: !!result?.error,
      });

      if (result?.error) {
        logError('Login error occurred', new Error(result.error), {
          email,
          error: result.error,
          result,
        });
        setUserLoading(false);
        return { success: false, error: result.error };
      }

      if (result?.ok) {
        logAuth('Login successful, waiting for session update');
        // Don't set loading to false here - let the useEffect handle it
        // The session update will trigger the useEffect above
        return { success: true };
      }

      logAuth('Login result unknown, setting loading to false');
      setUserLoading(false);
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      logError(
        'Login exception occurred',
        error instanceof Error ? error : new Error(String(error)),
        {
          email,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      setUserLoading(false);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    logAuth('Logout function called');
    await signOut({ redirect: false });
    logoutFromStore();
  };

  // Use force loading override to break out of infinite loading
  const isLoading = forceLoading ? false : status === 'loading' || storeLoading;

  logAuth('useAuth returning state', {
    isLoading,
    status,
    storeLoading,
    forceLoading,
  });

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading,
    login,
    logout,
    status,
  };
}
