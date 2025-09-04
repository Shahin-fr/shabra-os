// Export from consolidated store (new system)
export * from './consolidated-store';

// Export new UI store (migration in progress)
export * from './uiStore';

// Export new User store (migration in progress)
export { useUserStore } from './userStore';

// Legacy exports for backward compatibility during migration
// TODO: Remove these after migration is complete
// Note: These are commented out to avoid conflicts during development
// export * from './useUserStore';
// export * from './useCacheStore';

// Export authentication hook
export { useAuth } from '@/hooks/useAuth';

// Migration notice
// Migration notice - UI state has been moved to uiStore.ts, User state has been moved to userStore.ts
// Please update imports to use the new stores. See MIGRATION_GUIDE.md for details.
