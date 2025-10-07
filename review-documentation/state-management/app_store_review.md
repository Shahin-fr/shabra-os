### App Store Audit – Zustand (`src/stores/app.store.ts`)

This review evaluates the client-side state management focused on the main app store, against the Shabra OS conventions.

---

## State Structure & Normalization

- **Overall shape**: The store organizes app-level concerns cleanly: settings, connectivity/initialization flags, performance metrics, and feature flags. This separation from other domain stores is appropriate.
- **Primitive vs. complex types**:
  - `featureFlags` is a `Map<string, boolean>`. Persistence converts it to a plain object via `Object.fromEntries`, but it is not reconstructed back to a `Map` on rehydrate. This will break actions that call `Map` APIs after hydration.
    
    Code reference:
    ```196:204:src/stores/app.store.ts
    name: 'shabra-os-app-store',
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({
      // Only persist non-sensitive, application-specific data
      settings: state.settings,
      featureFlags: Object.fromEntries(state.featureFlags),
    }),
    ```
    And consumers expect a `Map`:
    ```175:183:src/stores/app.store.ts
    setFeatureFlag: (flag, enabled) =>
      set(state => {
        state.featureFlags.set(flag, enabled);
        logApp('Feature flag updated', { flag, enabled });
      }),

    getFeatureFlag: (flag: string): boolean => {
      return useAppStore.getState().featureFlags.get(flag) ?? false;
    },
    ```
    - Recommendation: Rehydrate `featureFlags` to a `Map` using `onRehydrateStorage`, or provide a `merge`/`migrate` that reconstructs `new Map(Object.entries(...))`. Alternatively, store as an array of entries and reconstruct.

- **Dates in state**: `lastUpdate: Date` is kept in-memory only (not persisted). Good. Other date-like fields in this store are safe. No duplication or denormalization issues identified in this store.

## Actions & Logic

- **Purity and immer usage**: Actions are well-scoped and use `immer` for concise mutation while preserving immutability. Side effects are limited to logging and event wiring at module scope.
- **Async logic**: None in this store. Where async appears in sibling stores, loading/error flags are handled elsewhere (appropriate for separation of concerns).
- **Invariants**:
  - `setFeatureFlag` and `getFeatureFlag` assume `featureFlags` is a `Map`. Post-rehydrate it will be an object unless reconstructed. This is the primary correctness risk.
  - `updateSettings` shallow merges settings, which is fine given current structure.

Code reference:
```117:170:src/stores/app.store.ts
export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector(
      immer(set => ({
        ...initialAppState,
        updateSettings: settings =>
          set(state => {
            state.settings = { ...state.settings, ...settings };
            logApp('Settings updated', { settings });
          }),
        // ...
        updatePerformanceMetrics: metrics =>
          set(state => {
            state.performanceMetrics = {
              ...state.performanceMetrics,
              ...metrics,
            };
          }),
        // ...
      }))
    ),
    { /* persist config */ }
  )
);
```

## Performance

- **Selectors**: The store exposes fine-grained selectors for primitive fields and grouped selectors for objects.
  - `useAppSettings` selects the entire `settings` object. Any change in any setting will re-render consumers. Consider more granular selectors in hot paths (e.g., `useIsLoggingEnabled`, `useCacheStrategy`) which already exist and should be preferred in components.
  - `useFeatureFlag(flag)` currently derives via `state.getFeatureFlag(flag)`. This indirection calls into `getState` rather than reading from the selected slice which can degrade memoization. Prefer selecting from `state.featureFlags` directly and mapping to a boolean, provided the `Map` is correctly rehydrated.

Code reference:
```229:241:src/stores/app.store.ts
// Feature flag selectors
export const useFeatureFlag = (flag: string) => useAppStore((state: AppStore) => state.getFeatureFlag(flag));
export const useFeatureFlags = () => useAppStore((state: AppStore) => Object.fromEntries(state.featureFlags));
// Individual action selectors
export const useSetFeatureFlag = () => useAppStore((state: AppStore) => state.setFeatureFlag);
```

- **Subscriptions**: `subscribeWithSelector` is used, which is ideal for scoped reactivity.
- **Memory leaks**: Two `window.addEventListener` handlers are registered for online/offline at module scope. Since the store is a singleton, this is acceptable. No cleanup is required unless hot module reloading causes duplicate installs; in development, guard installs or register once.

Code reference:
```306:315:src/stores/app.store.ts
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}
```

## Modularity & Scalability

- **Separation of concerns**: App-level concerns (settings, connectivity, perf, flags) live here; UI, User, Error, and Cache concerns are split into their own stores. This is scalable and follows the conventions: small, focused modules.
- **Slices**: If growth continues, consider extracting `featureFlags` into its own slice or store only if its lifecycle/persistence diverges. Current cohesion is acceptable.
- **Type organization**: Interface naming follows conventions. Action names are verb-first and descriptive.

## Risks & Edge Cases

- **Persisted Map rehydration bug (high impact)**: After rehydrate, `featureFlags` may be a plain object, breaking `.set`/`.get` calls.
- **Selector indirection for flags**: `useFeatureFlag` relies on an action accessor, potentially reducing memoization effectiveness.
- **HMR duplicate listeners (low)**: In dev with HMR, online/offline listeners may be attached multiple times.

## Recommendations

1. Rehydrate `featureFlags` as a `Map`.
   - Use `onRehydrateStorage` or `migrate`/`merge` to convert back: `state.featureFlags = new Map(Object.entries(persisted.featureFlags || {}))`.
   - Alternatively, store arrays of entries and reconstruct via `new Map(entries)`.

2. Simplify feature flag selector and avoid `getState()` inside selectors:
   - Implement `useFeatureFlag = (flag) => useAppStore(s => s.featureFlags.get(flag) ?? false)` (post-Map fix).

3. Prefer fine-grained settings selectors in components over `useAppSettings` when only a single setting is needed, to reduce re-renders.

4. Dev-only listener guards (optional):
   - Gate online/offline listener registration to avoid duplicates during HMR, e.g., set a module-level boolean after first registration.

5. Logging level guard:
   - Tie `logApp` calls to `settings.enableLogging` and/or `NODE_ENV` to avoid unnecessary work in production hot paths.

## Quick Wins

- Add rehydrate transform for `featureFlags` (correctness fix).
- Adjust `useFeatureFlag` to read from state slice directly (perf/correctness).
- Encourage component usage of the existing granular selectors for settings.

## Convention Alignment

- Uses `subscribeWithSelector` and granular selectors per performance guidance in the conventions.
- Store colocates concerns and keeps actions pure; async side effects are avoided here per conventions.
- Persisted shape respects “only non-sensitive data” guidance.

---

## Appendix – Select Code References

```84:111:src/stores/app.store.ts
const initialAppState: AppState = {
  settings: {
    enableCaching: true,
    enableOptimizations: true,
    enableMonitoring: true,
    cacheStrategy: 'balanced',
    enableAnalytics: false,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableLogging: true,
    enableHotReload: process.env.NODE_ENV === 'development',
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isInitialized: false,
  lastUpdate: new Date(),
  performanceMetrics: {
    pageLoadTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
  },
  featureFlags: new Map(),
};
```

```211:241:src/stores/app.store.ts
// Settings selectors
export const useAppSettings = () => useAppStore((state: AppStore) => state.settings);
export const useCacheStrategy = () => useAppStore((state: AppStore) => state.settings.cacheStrategy);
// ...
// Feature flag selectors
export const useFeatureFlag = (flag: string) => useAppStore((state: AppStore) => state.getFeatureFlag(flag));
export const useFeatureFlags = () => useAppStore((state: AppStore) => Object.fromEntries(state.featureFlags));
// Individual action selectors
export const useSetFeatureFlag = () => useAppStore((state: AppStore) => state.setFeatureFlag);
```


