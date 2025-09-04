import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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
  activeModals: string[];
  modalData: Record<string, any>;
}

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  currentRoute: string;
  notifications: Notification[];
  modals: ModalState;
  isMobile: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCurrentRoute: (route: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    immer(set => ({
      // Initial state
      sidebarOpen: false,
      mobileSidebarOpen: false,
      currentRoute: '/',
      notifications: [],
      modals: {
        activeModals: [],
        modalData: {},
      },
      isMobile: false,

      // Actions
      toggleSidebar: () =>
        set(state => {
          // Only toggle desktop sidebar if not on mobile
          if (!state.isMobile) {
            state.sidebarOpen = !state.sidebarOpen;
          }
        }),

      setSidebarOpen: open =>
        set(state => {
          // Only affect desktop sidebar if not on mobile
          if (!state.isMobile) {
            state.sidebarOpen = open;
          }
        }),

      toggleMobileSidebar: () =>
        set(state => {
          state.mobileSidebarOpen = !state.mobileSidebarOpen;
        }),

      setMobileSidebarOpen: open =>
        set(state => {
          state.mobileSidebarOpen = open;
        }),

      setCurrentRoute: route =>
        set(state => {
          state.currentRoute = route;
          // Auto-close mobile sidebar on route change
          if (state.isMobile) {
            state.mobileSidebarOpen = false;
          }
        }),

      setIsMobile: isMobile =>
        set(state => {
          state.isMobile = isMobile;
          // Reset sidebar states when switching between mobile/desktop
          if (isMobile) {
            state.sidebarOpen = false;
          } else {
            state.mobileSidebarOpen = false;
          }
        }),

      addNotification: notification =>
        set(state => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
          };
          state.notifications.unshift(newNotification);

          // Keep only last 50 notifications
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        }),

      removeNotification: id =>
        set(state => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),

      markNotificationAsRead: id =>
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        }),

      clearNotifications: () =>
        set(state => {
          state.notifications = [];
        }),

      openModal: (modalId, data) =>
        set(state => {
          if (!state.modals.activeModals.includes(modalId)) {
            state.modals.activeModals.push(modalId);
          }
          if (data) {
            state.modals.modalData[modalId] = data;
          }
        }),

      closeModal: modalId =>
        set(state => {
          state.modals.activeModals = state.modals.activeModals.filter(
            id => id !== modalId
          );
          delete state.modals.modalData[modalId];
        }),

      closeAllModals: () =>
        set(state => {
          state.modals.activeModals = [];
          state.modals.modalData = {};
        }),
    })),
    {
      name: 'shabra-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        sidebarOpen: state.sidebarOpen,
        currentRoute: state.currentRoute,
      }),
    }
  )
);

// Selectors for performance optimization
export const useSidebarOpen = () =>
  useUIStore(state =>
    state.isMobile ? state.mobileSidebarOpen : state.sidebarOpen
  );
export const useDesktopSidebarOpen = () =>
  useUIStore(state => state.sidebarOpen);
export const useMobileSidebarOpen = () =>
  useUIStore(state => state.mobileSidebarOpen);
export const useIsMobile = () => useUIStore(state => state.isMobile);
export const useCurrentRoute = () => useUIStore(state => state.currentRoute);
export const useNotifications = () => useUIStore(state => state.notifications);
export const useUnreadNotifications = () =>
  useUIStore(state => state.notifications.filter(n => !n.read));
export const useModalState = (modalId: string) =>
  useUIStore(state => ({
    isOpen: state.modals.activeModals.includes(modalId),
    data: state.modals.modalData[modalId],
  }));
