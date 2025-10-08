'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseAccessibilityOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: HTMLElement | null;
  onEscape?: () => void;
  onEnter?: () => void;
  onTab?: (event: KeyboardEvent) => void;
}

export function useAccessibility({
  trapFocus = false,
  restoreFocus = false,
  initialFocus = null,
  onEscape,
  onEnter,
  onTab,
}: UseAccessibilityOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Focus management
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusElement(focusableElements[0]);
    }
  }, [focusElement]);

  const focusLastElement = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusElement(focusableElements[focusableElements.length - 1]);
    }
  }, [focusElement]);

  // Restore focus to previous element
  const restorePreviousFocus = useCallback(() => {
    if (restoreFocus && previousActiveElement.current) {
      focusElement(previousActiveElement.current);
    }
  }, [restoreFocus, focusElement]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case 'Tab':
        if (trapFocus && containerRef.current) {
          handleTabKey(event);
        }
        if (onTab) {
          onTab(event);
        }
        break;
    }
  }, [trapFocus, onEscape, onEnter, onTab]);

  // Tab key handling for focus trapping
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        focusElement(lastElement);
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        focusElement(firstElement);
      }
    }
  }, [focusElement]);

  // Get focusable elements within a container
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Initial focus setup
  useEffect(() => {
    if (initialFocus) {
      focusElement(initialFocus);
    } else if (trapFocus) {
      // Focus first element when trapping focus
      focusFirstElement();
    }
  }, [initialFocus, trapFocus, focusElement, focusFirstElement]);

  return {
    containerRef,
    focusElement,
    focusFirstElement,
    focusLastElement,
    restorePreviousFocus,
    getFocusableElements,
  };
}

// Utility function to announce text to screen readers
export function announceToScreenReader(text: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = text;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Utility function to check if element is visible to screen readers
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

// Utility function to get accessible name for an element
export function getAccessibleName(element: HTMLElement): string {
  // Check for aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check for aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check for associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || '';
  }

  // Check for title attribute
  const title = element.getAttribute('title');
  if (title) return title;

  // Fallback to text content
  return element.textContent || element.value || '';
}
