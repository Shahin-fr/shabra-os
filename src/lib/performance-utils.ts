// Lightweight performance utilities for instant navigation

// Simple debounce function for essential use cases only
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Simple throttle function for essential use cases only
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Performance mark utility for essential measurements only
export function markPerformance(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(name);
  }
}

// Performance measure utility for essential measurements only
export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string
): void {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      window.performance.measure(name, startMark, endMark);
    } catch (_error) {
      // Silently fail if marks don't exist
    }
  }
}
