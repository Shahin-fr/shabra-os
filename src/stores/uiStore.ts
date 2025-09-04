/**
 * UI State Management Store
 *
 * This store manages all UI-related state including navigation, modals, notifications,
 * loading states, and UI preferences. It's separated from the main consolidated store
 * to improve maintainability and reduce complexity.
 */

import React from 'react';
import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logUI } from '@/lib/logger';

// ============================================================================
// UI STATE INTERFACES
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  id: string;
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface UIState {
  // Navigation
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  currentRoute: string;
  breadcrumbs: Array<{ label: string; href: string }>;

  // Responsive
  isMobile: boolean;

  // Modals
  modals: ModalState[];

  // Notifications (general UI notifications, not error notifications)
  uiNotifications: Notification[];

  // Loading states
  loadingStates: Map<string, boolean>;

  // UI preferences
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  highContrast: boolean;
}

export interface UIActions {
  // Navigation
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCurrentRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void;

  // Responsive
  setIsMobile: (isMobile: boolean) => void;

  // Modals
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;

  // Notifications
  addUINotification: (notification: Notification) => void;
  removeUINotification: (notificationId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllUINotifications: () => void;

  // Loading states
  setUILoading: (key: string, loading: boolean) => void;
  clearUILoading: (key: string) => void;

  // UI preferences
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAnimations: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;

  // Utility actions
  reset: () => void;
}

export type UIStore = UIState & UIActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialUIState: UIState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  currentRoute: '/',
  breadcrumbs: [],
  isMobile: false,
  modals: [],
  uiNotifications: [],
  loadingStates: new Map(),
  theme: 'system',
  animations: true,
  highContrast: false,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useUIStore = create<UIStore>()(
  persist(
    subscribeWithSelector(
      immer(set => ({
        // ========================================================================
        // INITIAL STATE
        // ========================================================================
        ...initialUIState,

        // ========================================================================
        // NAVIGATION ACTIONS
        // ========================================================================
        toggleSidebar: () =>
          set(state => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
            logUI('Sidebar toggled', { collapsed: state.sidebarCollapsed });
          }),

        toggleMobileSidebar: () =>
          set(state => {
            state.mobileSidebarOpen = !state.mobileSidebarOpen;
            logUI('Mobile sidebar toggled', { open: state.mobileSidebarOpen });
          }),

        setMobileSidebarOpen: open =>
          set(state => {
            state.mobileSidebarOpen = open;
            logUI('Mobile sidebar state set', { open });
          }),

        setCurrentRoute: route =>
          set(state => {
            state.currentRoute = route;
          }),

        setBreadcrumbs: breadcrumbs =>
          set(state => {
            state.breadcrumbs = breadcrumbs;
          }),

        setIsMobile: isMobile =>
          set(state => {
            state.isMobile = isMobile;
          }),

        // ========================================================================
        // MODAL ACTIONS
        // ========================================================================
        openModal: modal =>
          set(state => {
            state.modals.push({ ...modal, isOpen: true });
            logUI('Modal opened', { modalId: modal.id, title: modal.title });
          }),

        closeModal: modalId =>
          set(state => {
            const modal = state.modals.find(m => m.id === modalId);
            if (modal) {
              modal.isOpen = false;
              if (modal.onClose) modal.onClose();
              logUI('Modal closed', { modalId });
            }
          }),

        closeAllModals: () =>
          set(state => {
            state.modals.forEach(modal => {
              if (modal.isOpen && modal.onClose) modal.onClose();
            });
            state.modals = [];
            logUI('All modals closed');
          }),

        // ========================================================================
        // NOTIFICATION ACTIONS
        // ========================================================================
        addUINotification: notification =>
          set(state => {
            // Remove old notifications if we exceed the limit
            if (state.uiNotifications.length >= 50) {
              state.uiNotifications.shift();
            }
            state.uiNotifications.push(notification);
            logUI('Notification added', {
              type: notification.type,
              title: notification.title,
            });
          }),

        removeUINotification: notificationId =>
          set(state => {
            state.uiNotifications = state.uiNotifications.filter(
              n => n.id !== notificationId
            );
          }),

        markNotificationAsRead: notificationId =>
          set(state => {
            const notification = state.uiNotifications.find(
              n => n.id === notificationId
            );
            if (notification) {
              notification.read = true;
            }
          }),

        clearAllUINotifications: () =>
          set(state => {
            state.uiNotifications = [];
            logUI('All notifications cleared');
          }),

        // ========================================================================
        // LOADING STATE ACTIONS
        // ========================================================================
        setUILoading: (key, loading) =>
          set(state => {
            if (loading) {
              state.loadingStates.set(key, true);
            } else {
              state.loadingStates.delete(key);
            }
          }),

        clearUILoading: key =>
          set(state => {
            state.loadingStates.delete(key);
          }),

        // ========================================================================
        // UI PREFERENCES ACTIONS
        // ========================================================================
        setTheme: theme =>
          set(state => {
            state.theme = theme;
            logUI('Theme changed', { theme });
          }),

        setAnimations: enabled =>
          set(state => {
            state.animations = enabled;
            logUI('Animations toggled', { enabled });
          }),

        setHighContrast: enabled =>
          set(state => {
            state.highContrast = enabled;
            logUI('High contrast toggled', { enabled });
          }),

        // ========================================================================
        // UTILITY ACTIONS
        // ========================================================================
        reset: () =>
          set(state => {
            Object.assign(state, initialUIState);
            logUI('UI state reset');
          }),
      }))
    ),
    {
      name: 'shabra-os-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist user preferences and navigation state
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        animations: state.animations,
        highContrast: state.highContrast,
      }),
    }
  )
);

// ============================================================================
// SELECTORS FOR OPTIMIZED STATE ACCESS
// ============================================================================

// Navigation selectors
export const useSidebarCollapsed = () =>
  useUIStore(state => state.sidebarCollapsed);
export const useMobileSidebarOpen = () =>
  useUIStore(state => state.mobileSidebarOpen);
export const useCurrentRoute = () => useUIStore(state => state.currentRoute);
export const useBreadcrumbs = () => useUIStore(state => state.breadcrumbs);
export const useIsMobile = () => useUIStore(state => state.isMobile);

// Modal selectors
export const useModals = () => useUIStore(state => state.modals);
export const useModalById = (modalId: string) =>
  useUIStore(state => state.modals.find(modal => modal.id === modalId));
export const useIsModalOpen = (modalId: string) =>
  useUIStore(state =>
    state.modals.some(modal => modal.id === modalId && modal.isOpen)
  );

// Notification selectors
export const useUINotifications = () =>
  useUIStore(state => state.uiNotifications);
export const useUnreadNotifications = () =>
  useUIStore(state =>
    state.uiNotifications.filter(notification => !notification.read)
  );
export const useNotificationCount = () =>
  useUIStore(state => state.uiNotifications.length);
export const useUnreadNotificationCount = () =>
  useUIStore(
    state =>
      state.uiNotifications.filter(notification => !notification.read).length
  );

// Loading state selectors
export const useLoadingStates = () => useUIStore(state => state.loadingStates);
export const useIsLoading = (key: string) =>
  useUIStore(state => state.loadingStates.get(key) ?? false);
export const useAnyLoading = () =>
  useUIStore(state => state.loadingStates.size > 0);

// UI preference selectors
export const useTheme = () => useUIStore(state => state.theme);
export const useAnimations = () => useUIStore(state => state.animations);
export const useHighContrast = () => useUIStore(state => state.highContrast);

// Individual action selectors to prevent infinite re-renders
export const useToggleSidebar = () => useUIStore(state => state.toggleSidebar);
export const useSetCurrentRoute = () =>
  useUIStore(state => state.setCurrentRoute);
export const useSetBreadcrumbs = () =>
  useUIStore(state => state.setBreadcrumbs);
export const useOpenModal = () => useUIStore(state => state.openModal);
export const useCloseModal = () => useUIStore(state => state.closeModal);
export const useCloseAllModals = () =>
  useUIStore(state => state.closeAllModals);
export const useAddUINotification = () =>
  useUIStore(state => state.addUINotification);
export const useRemoveUINotification = () =>
  useUIStore(state => state.removeUINotification);
export const useMarkNotificationAsRead = () =>
  useUIStore(state => state.markNotificationAsRead);
export const useClearAllUINotifications = () =>
  useUIStore(state => state.clearAllUINotifications);
export const useSetUILoading = () => useUIStore(state => state.setUILoading);
export const useClearUILoading = () =>
  useUIStore(state => state.clearUILoading);
export const useSetTheme = () => useUIStore(state => state.setTheme);
export const useSetAnimations = () => useUIStore(state => state.setAnimations);
export const useSetHighContrast = () =>
  useUIStore(state => state.setHighContrast);
export const useResetUI = () => useUIStore(state => state.reset);
export const useSetIsMobile = () => useUIStore(state => state.setIsMobile);
export const useToggleMobileSidebar = () =>
  useUIStore(state => state.toggleMobileSidebar);
export const useSetMobileSidebarOpen = () =>
  useUIStore(state => state.setMobileSidebarOpen);

// Action selector for backward compatibility (use individual selectors for better performance)
export const useUIActions = () => {
  const toggleSidebar = useToggleSidebar();
  const setCurrentRoute = useSetCurrentRoute();
  const setBreadcrumbs = useSetBreadcrumbs();
  const openModal = useOpenModal();
  const closeModal = useCloseModal();
  const closeAllModals = useCloseAllModals();
  const addUINotification = useAddUINotification();
  const removeUINotification = useRemoveUINotification();
  const markNotificationAsRead = useMarkNotificationAsRead();
  const clearAllUINotifications = useClearAllUINotifications();
  const setUILoading = useSetUILoading();
  const clearUILoading = useClearUILoading();
  const setTheme = useSetTheme();
  const setAnimations = useSetAnimations();
  const setHighContrast = useSetHighContrast();
  const reset = useResetUI();
  const setIsMobile = useSetIsMobile();
  const toggleMobileSidebar = useToggleMobileSidebar();
  const setMobileSidebarOpen = useSetMobileSidebarOpen();

  return {
    toggleSidebar,
    toggleMobileSidebar,
    setMobileSidebarOpen,
    setCurrentRoute,
    setBreadcrumbs,
    setIsMobile,
    openModal,
    closeModal,
    closeAllModals,
    addUINotification,
    removeUINotification,
    markNotificationAsRead,
    clearAllUINotifications,
    setUILoading,
    clearUILoading,
    setTheme,
    setAnimations,
    setHighContrast,
    reset,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a notification with default values
 */
export const createNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  action?: Notification['action']
): Notification => ({
  id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  title,
  message,
  timestamp: new Date(),
  read: false,
  action,
});

/**
 * Create a modal with default values
 */
export const createModal = (
  id: string,
  title: string,
  content: React.ReactNode,
  options?: Partial<Omit<ModalState, 'id' | 'title' | 'content' | 'isOpen'>>
): Omit<ModalState, 'isOpen'> => ({
  id,
  title,
  content,
  size: 'md',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  ...options,
});

// ============================================================================
// AUTOMATIC CLEANUP
// ============================================================================

// Set up automatic notification cleanup (remove old notifications)
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      const state = useUIStore.getState();
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      const oldNotifications = state.uiNotifications.filter(
        notification => now - notification.timestamp.getTime() > maxAge
      );

      if (oldNotifications.length > 0) {
        oldNotifications.forEach(notification => {
          state.removeUINotification(notification.id);
        });
        logUI('Old notifications cleaned up', {
          count: oldNotifications.length,
        });
      }
    },
    60 * 60 * 1000
  ); // Check every hour
}
