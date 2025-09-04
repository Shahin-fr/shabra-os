import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface CacheState {
  stories: Record<string, any>;
  projects: Record<string, any>;
  users: Record<string, any>;
  lastUpdated: Record<string, Date>;
}

interface CacheActions {
  updateCache: (key: string, data: any) => void;
  clearCache: (key?: string) => void;
  invalidateCache: (key: string) => void;
  getCacheData: (key: string) => any;
  isCacheValid: (key: string, maxAgeMs?: number) => boolean;
}

export const useCacheStore = create<CacheState & CacheActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      stories: {},
      projects: {},
      users: {},
      lastUpdated: {},

      // Actions
      updateCache: (key, data) =>
        set(state => {
          state[key as keyof CacheState] = data;
          state.lastUpdated[key] = new Date();
        }),

      clearCache: key =>
        set(state => {
          if (key) {
            state[key as keyof CacheState] = {};
            delete state.lastUpdated[key];
          } else {
            state.stories = {};
            state.projects = {};
            state.users = {};
            state.lastUpdated = {};
          }
        }),

      invalidateCache: key =>
        set(state => {
          if (state.lastUpdated[key]) {
            delete state.lastUpdated[key];
          }
        }),

      getCacheData: key => {
        const state = get();
        return state[key as keyof CacheState];
      },

      isCacheValid: (key, maxAgeMs = 5 * 60 * 1000) => {
        const state = get();
        const lastUpdated = state.lastUpdated[key];
        if (!lastUpdated) return false;

        const now = new Date();
        const age = now.getTime() - lastUpdated.getTime();
        return age < maxAgeMs;
      },
    })),
    {
      name: 'shabra-cache-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        stories: state.stories,
        projects: state.projects,
        users: state.users,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors for performance optimization
export const useCache = (key: string) =>
  useCacheStore(state => ({
    data: state[key as keyof CacheState],
    lastUpdated: state.lastUpdated[key],
  }));

export const useCacheActions = () =>
  useCacheStore(state => ({
    updateCache: state.updateCache,
    clearCache: state.clearCache,
    invalidateCache: state.invalidateCache,
    getCacheData: state.getCacheData,
    isCacheValid: state.isCacheValid,
  }));
