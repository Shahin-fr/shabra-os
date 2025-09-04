'use client';

import { useCallback } from 'react';

type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

interface HapticFeedbackOptions {
  type?: HapticFeedbackType;
  duration?: number;
  intensity?: number;
}

export function useHapticFeedback() {
  const triggerHaptic = useCallback((options: HapticFeedbackOptions = {}) => {
    const { type = 'light', duration = 10, intensity = 0.5 } = options;

    // Check if the device supports haptic feedback
    if (!('vibrate' in navigator)) {
      return;
    }

    // Different vibration patterns for different feedback types
    const patterns: Record<HapticFeedbackType, number[]> = {
      light: [duration],
      medium: [duration * 2],
      heavy: [duration * 3],
      success: [duration, 50, duration],
      warning: [duration * 2, 100, duration * 2],
      error: [duration * 3, 100, duration * 3, 100, duration * 3],
    };

    const pattern = patterns[type];

    // Apply intensity scaling
    const scaledPattern = pattern.map(value => Math.round(value * intensity));

    try {
      navigator.vibrate(scaledPattern);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  }, []);

  const hapticSuccess = useCallback(() => {
    triggerHaptic({ type: 'success', intensity: 0.7 });
  }, [triggerHaptic]);

  const hapticWarning = useCallback(() => {
    triggerHaptic({ type: 'warning', intensity: 0.6 });
  }, [triggerHaptic]);

  const hapticError = useCallback(() => {
    triggerHaptic({ type: 'error', intensity: 0.8 });
  }, [triggerHaptic]);

  const hapticLight = useCallback(() => {
    triggerHaptic({ type: 'light', intensity: 0.3 });
  }, [triggerHaptic]);

  const hapticMedium = useCallback(() => {
    triggerHaptic({ type: 'medium', intensity: 0.5 });
  }, [triggerHaptic]);

  const hapticHeavy = useCallback(() => {
    triggerHaptic({ type: 'heavy', intensity: 0.7 });
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    hapticSuccess,
    hapticWarning,
    hapticError,
    hapticLight,
    hapticMedium,
    hapticHeavy,
  };
}
