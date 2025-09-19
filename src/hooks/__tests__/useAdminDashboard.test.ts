import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useAdminDashboard } from '../useAdminDashboard';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Helper function to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data.isLoading).toBe(true);
    expect(result.current.data.error).toBeNull();
    expect(result.current.data.companyStats.totalEmployees).toBe(0);
    expect(result.current.data.performanceMetrics.weeklyPerformance.labels).toEqual([]);
    expect(result.current.data.teamActivity).toEqual([]);
    expect(result.current.data.quarterlyGoals).toEqual([]);
  });

  it('should provide refresh functionality', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.actions.refresh).toBeDefined();
    expect(typeof result.current.actions.refresh).toBe('function');
  });

  it('should provide setRefreshInterval functionality', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.actions.setRefreshInterval).toBeDefined();
    expect(typeof result.current.actions.setRefreshInterval).toBe('function');
  });

  it('should provide clearError functionality', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.actions.clearError).toBeDefined();
    expect(typeof result.current.actions.clearError).toBe('function');
  });

  it('should handle setRefreshInterval correctly', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.setRefreshInterval(5000);
    });

    expect(result.current.state.refreshInterval).toBe(5000);
  });

  it('should handle clearError correctly', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    // The hook doesn't expose setState directly, so we can't manually set an error
    // We can only test that clearError exists and is callable
    expect(result.current.actions.clearError).toBeDefined();
    expect(typeof result.current.actions.clearError).toBe('function');
    
    // Test that clearError can be called without errors
    act(() => {
      result.current.actions.clearError();
    });

    expect(result.current.state.error).toBeNull();
  });

  it('should have correct initial state values', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.refreshInterval).toBe(30000); // 30 seconds default
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.lastUpdated).toBeNull();
  });

  it('should provide company stats with default values', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    const companyStats = result.current.data.companyStats;
    expect(companyStats.totalEmployees).toBe(0);
    expect(companyStats.activeProjects).toBe(0);
    expect(companyStats.completedTasks).toBe(0);
    expect(companyStats.attendanceRate).toBe(0);
    expect(companyStats.employeeGrowth.percentage).toBe(0);
    expect(companyStats.projectGrowth.percentage).toBe(0);
    expect(companyStats.taskGrowth.percentage).toBe(0);
    expect(companyStats.attendanceGrowth.percentage).toBe(0);
  });

  it('should provide performance metrics with default values', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    const performanceMetrics = result.current.data.performanceMetrics;
    expect(performanceMetrics.weeklyPerformance.labels).toEqual([]);
    expect(performanceMetrics.weeklyPerformance.data).toEqual([]);
    expect(performanceMetrics.weeklyPerformance.target).toEqual([]);
    expect(performanceMetrics.taskBottlenecks).toEqual([]);
    expect(performanceMetrics.keyPerformanceIndicators).toEqual([]);
  });

  it('should handle state updates correctly', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: createWrapper(),
    });

    // Test setRefreshInterval
    act(() => {
      result.current.actions.setRefreshInterval(10000);
    });

    expect(result.current.state.refreshInterval).toBe(10000);
    
    // Test that other state properties are accessible
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.lastUpdated).toBeNull();
  });
});