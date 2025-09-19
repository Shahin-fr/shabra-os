// State Management Types
// Core state types and interfaces

export type StateValue = string | number | boolean | object | null | undefined;

export type StateStatus = 'idle' | 'loading' | 'success' | 'error' | 'updating';

export type StatePriority = 'low' | 'medium' | 'high' | 'critical';

export type StateRecovery = 'automatic' | 'manual' | 'none';

export type StateOptimizationType =
  | 'MEMORY_CLEANUP'
  | 'STATE_CLEANUP'
  | 'PERFORMANCE_OPTIMIZATION'
  | 'NONE';

export type StatePersistenceType =
  | 'MEMORY'
  | 'SESSION_STORAGE'
  | 'LOCAL_STORAGE'
  | 'INDEXED_DB'
  | 'NONE';

export interface StateNode<T = StateValue> {
  value: T;
  status: StateStatus;
  priority: StatePriority;
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  dependencies: string[];
  metadata: StateMetadata;
}

export interface StateMetadata {
  description?: string;
  tags?: string[];
  category?: string;
  version?: number;
  author?: string;
  lastModifiedBy?: string;
  changeReason?: string;
  validationRules?: ValidationRule[];
  encryption?: EncryptionConfig;
  backup?: BackupConfig;
  retention?: RetentionConfig;
  audit?: AuditConfig;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value: string | number | boolean | RegExp | ((value: unknown) => boolean);
  message: string;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm?: string;
  key?: string;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
}

export interface RetentionConfig {
  maxAge: number;
  maxSize: number;
  cleanupStrategy: 'oldest' | 'least_accessed' | 'lowest_priority';
}

export interface AuditConfig {
  enabled: boolean;
  logChanges: boolean;
  logAccess: boolean;
  retention: number;
}

export interface StateManagerOptions {
  maxStates: number;
  maxMemoryUsage: number;
  optimizationInterval: number;
  performanceMonitoring: boolean;
  autoCleanup: boolean;
  debugMode: boolean;
  persistenceEnabled: boolean;
}

export interface StateSubscriber<T = StateValue> {
  id: string;
  key: string;
  callback: (newValue: T, oldValue: T) => void;
  selector?: (value: T) => unknown;
  priority: StatePriority;
  active: boolean;
  lastNotified: number;
}

export interface StateDependency {
  key: string;
  type: 'direct' | 'indirect' | 'circular';
  strength: 'weak' | 'medium' | 'strong';
  lastAccessed: number;
  accessCount: number;
}

export interface StatePerformanceMetrics {
  totalStates: number;
  activeStates: number;
  memoryUsage: number;
  averageAccessTime: number;
  cacheHitRate: number;
  optimizationCount: number;
  lastOptimization: number;
  performanceScore: number;
}

export interface StateOptimization {
  id: string;
  type: StateOptimizationType;
  targetStates: string[];
  strategy: OptimizationStrategy;
  expectedImprovement: number;
  appliedAt: number;
  results: OptimizationResults;
}

export interface OptimizationStrategy {
  name: string;
  description: string;
  actions: OptimizationAction[];
  conditions: OptimizationCondition[];
}

export interface OptimizationAction {
  type: 'remove' | 'merge' | 'split' | 'compress';
  description: string;
  target: string;
  parameters: Record<string, unknown>;
}

export interface OptimizationCondition {
  type: 'memory_threshold' | 'age_threshold' | 'access_threshold';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
}

export interface OptimizationResults {
  success: boolean;
  improvement: number;
  details: string;
  errors: string[];
  executionTime: number;
}

export interface StatePersistence {
  id: string;
  type: StatePersistenceType;
  data: unknown;
  timestamp: number;
  version: number;
  checksum: string;
}

export interface StateAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  metadata: Record<string, unknown>;
}

export interface StateMonitoring {
  enabled: boolean;
  interval: number;
  thresholds: MonitoringThresholds;
  alerts: StateAlert[];
  metrics: StatePerformanceMetrics;
}

export interface MonitoringThresholds {
  memoryUsage: number;
  stateCount: number;
  accessTime: number;
  errorRate: number;
}

export interface StateRecoveryConfig {
  enabled: boolean;
  strategy: 'rollback' | 'restore' | 'recreate';
  maxAttempts: number;
  timeout: number;
  dependencies: string[];
}

export interface StateCleanupConfig {
  enabled: boolean;
  interval: number;
  criteria: CleanupCriteria;
  strategy: CleanupStrategy;
}

export interface CleanupCriteria {
  maxAge: number;
  maxAccessCount: number;
  minPriority: StatePriority;
  unusedThreshold: number;
}

export interface CleanupStrategy {
  type: 'aggressive' | 'conservative' | 'balanced';
  batchSize: number;
  preserveDependencies: boolean;
  dryRun: boolean;
}

export interface StateIndex {
  key: string;
  type: 'primary' | 'secondary' | 'composite';
  fields: string[];
  unique: boolean;
  sparse: boolean;
}

export interface StateQuery {
  key?: string;
  pattern?: string;
  category?: string;
  tags?: string[];
  status?: StateStatus;
  priority?: StatePriority;
  dateRange?: {
    start: number;
    end: number;
  };
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StateQueryResult<T = StateValue> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface StateStatistics {
  totalStates: number;
  statesByStatus: Record<StateStatus, number>;
  statesByPriority: Record<StatePriority, number>;
  statesByCategory: Record<string, number>;
  averageAge: number;
  averageAccessCount: number;
  memoryUsage: number;
  optimizationCount: number;
}

export interface StateHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
  lastCheck: number;
  nextCheck: number;
}

export interface StateBackup {
  id: string;
  timestamp: number;
  version: number;
  data: Record<string, StateNode>;
  metadata: StateMetadata;
  checksum: string;
  size: number;
  compression: boolean;
}

export interface StateRestore {
  backupId: string;
  timestamp: number;
  strategy: 'full' | 'selective' | 'incremental';
  targetStates: string[];
  conflictResolution: 'overwrite' | 'skip' | 'merge';
  validation: boolean;
  dryRun: boolean;
}

export interface StateMigration {
  id: string;
  version: number;
  description: string;
  changes: MigrationChange[];
  rollback: MigrationChange[];
  dependencies: string[];
  timestamp: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
}

export interface MigrationChange {
  type: 'add' | 'remove' | 'modify' | 'rename';
  target: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}

export interface StateEvent {
  type: 'created' | 'updated' | 'deleted' | 'accessed' | 'optimized';
  key: string;
  timestamp: number;
  userId?: string;
  metadata: Record<string, unknown>;
  changes?: {
    oldValue: unknown;
    newValue: unknown;
  };
}

export interface StateHook {
  name: string;
  type: 'before' | 'after' | 'around';
  event: string;
  handler: (context: HookContext) => void | Promise<void>;
  priority: number;
  enabled: boolean;
}

export interface HookContext {
  key: string;
  event: string;
  data: unknown;
  metadata: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

export interface StatePlugin {
  name: string;
  version: string;
  description: string;
  hooks: StateHook[];
  commands: Record<string, (...args: unknown[]) => unknown>;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface StateManager {
  // Core state management
  setState<T>(
    key: string,
    value: T,
    metadata?: Partial<StateMetadata>
  ): Promise<T>;
  getState<T>(key: string): T | undefined;
  deleteState(key: string): Promise<boolean>;
  hasState(key: string): boolean;

  // State operations
  updateState<T>(key: string, updater: (current: T) => T): Promise<T>;
  mergeState<T>(key: string, partial: Partial<T>): Promise<T>;
  incrementState(key: string, amount?: number): Promise<number>;
  toggleState(key: string): Promise<boolean>;

  // State queries
  queryStates(query: StateQuery): StateQueryResult;
  findStates(pattern: string): string[];
  getStatesByCategory(category: string): string[];
  getStatesByStatus(status: StateStatus): string[];

  // State monitoring
  getPerformanceMetrics(): StatePerformanceMetrics;
  getStatistics(): StateStatistics;
  getHealth(): StateHealth;
  getAlerts(): StateAlert[];

  // State optimization
  optimizeStates(): Promise<StateOptimization[]>;
  getOptimizations(): StateOptimization[];
  cleanupStates(): Promise<number>;

  // State persistence
  persistState(key: string): Promise<boolean>;
  restoreState(key: string): Promise<boolean>;
  backupStates(): Promise<StateBackup>;
  restoreFromBackup(backup: StateBackup): Promise<boolean>;

  // State recovery
  recoverState(key: string): Promise<boolean>;
  getRecoveryConfig(): StateRecoveryConfig;
  setRecoveryConfig(config: Partial<StateRecoveryConfig>): void;

  // State subscriptions
  subscribe<T>(
    key: string,
    callback: (newValue: T, oldValue: T) => void
  ): string;
  unsubscribe(subscriptionId: string): boolean;
  getSubscribers(key: string): StateSubscriber[];

  // State dependencies
  addDependency(key: string, dependency: string): void;
  removeDependency(key: string, dependency: string): void;
  getDependencies(key: string): StateDependency[];

  // State events
  emitEvent(event: StateEvent): void;
  on(event: string, handler: (event: StateEvent) => void): void;
  off(event: string, handler: (event: StateEvent) => void): void;

  // State plugins
  registerPlugin(plugin: StatePlugin): void;
  unregisterPlugin(pluginName: string): void;
  getPlugins(): StatePlugin[];

  // State lifecycle
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  reset(): Promise<void>;
}
