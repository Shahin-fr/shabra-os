'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  averageFrameTime: number;
  isLowPerformance: boolean;
}

/**
 * Hook to monitor animation performance and provide optimization recommendations
 */
export function useAnimationPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameDrops: 0,
    averageFrameTime: 16.67,
    isLowPerformance: false,
  });
  const [isClient, setIsClient] = useState(false);

  const frameCount = useRef(0);
  const lastTime = useRef(0);
  const frameTimes = useRef<number[]>([]);
  const animationId = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    setIsClient(true);
    lastTime.current = performance.now();

    const measurePerformance = (currentTime: number) => {
      const deltaTime = currentTime - lastTime.current;
      lastTime.current = currentTime;

      frameCount.current++;
      frameTimes.current.push(deltaTime);

      // Keep only last 60 frames for rolling average
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }

      // Calculate metrics every 60 frames
      if (frameCount.current % 60 === 0) {
        const fps = Math.round(1000 / (deltaTime || 16.67));
        const averageFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
        const frameDrops = frameTimes.current.filter(time => time > 20).length; // Frames taking longer than 20ms
        const isLowPerformance = fps < 30 || frameDrops > 10;

        setMetrics({
          fps,
          frameDrops,
          averageFrameTime,
          isLowPerformance,
        });
      }

      animationId.current = requestAnimationFrame(measurePerformance);
    };

    animationId.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return {
    ...metrics,
    isClient,
    // Performance recommendations
    shouldReduceAnimations: !isClient || metrics.isLowPerformance,
    shouldDisableComplexAnimations: !isClient || metrics.fps < 20,
    shouldUseSimpleTransitions: !isClient || metrics.frameDrops > 5,
  };
}

/**
 * Hook to detect device capabilities and adjust animations accordingly
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isMobile: false,
    isLowEndDevice: false,
    supportsHardwareAcceleration: true,
    hasReducedMotion: false,
    memoryWarning: false,
    isClient: false,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;

    // Detect reduced motion preference
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect low-end device based on hardware concurrency and memory
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
      (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;

    // Detect hardware acceleration support
    const supportsHardwareAcceleration = 'transform' in document.documentElement.style &&
      'willChange' in document.documentElement.style;

    // Monitor memory usage (if available)
    const memoryWarning = (navigator as any).memory && 
      (navigator as any).memory.usedJSHeapSize > (navigator as any).memory.jsHeapSizeLimit * 0.8;

    setCapabilities({
      isMobile,
      isLowEndDevice,
      supportsHardwareAcceleration,
      hasReducedMotion,
      memoryWarning,
      isClient: true,
    });
  }, []);

  return capabilities;
}

/**
 * Combined hook that provides optimal animation settings based on performance and device
 */
export function useOptimalAnimationSettings() {
  const performance = useAnimationPerformance();
  const device = useDeviceCapabilities();

  return {
    // Animation settings
    duration: !device.isClient || device.hasReducedMotion || performance.shouldReduceAnimations ? 0 : 0.3,
    staggerDelay: !device.isClient || device.hasReducedMotion || performance.shouldReduceAnimations ? 0 : 0.1,
    easing: !device.isClient || device.isLowEndDevice ? 'linear' : 'easeOut',
    
    // Feature flags
    enableAnimations: device.isClient && !device.hasReducedMotion && !performance.shouldDisableComplexAnimations,
    enableComplexAnimations: device.isClient && !device.isLowEndDevice && !performance.shouldDisableComplexAnimations,
    enableStaggerAnimations: device.isClient && !device.isMobile && !performance.shouldUseSimpleTransitions,
    enableDragAnimations: device.isClient && device.supportsHardwareAcceleration && !performance.isLowPerformance,
    
    // Performance warnings
    showPerformanceWarning: device.isClient && performance.isLowPerformance && !device.hasReducedMotion,
    
    // Device info
    isClient: device.isClient,
    isMobile: device.isMobile,
    isLowEndDevice: device.isLowEndDevice,
    hasReducedMotion: device.hasReducedMotion,
  };
}
