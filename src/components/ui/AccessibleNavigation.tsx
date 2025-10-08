'use client';

import React, { forwardRef, useId, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { accessibility } from '@/lib/design-system';
import { useAccessibility } from '@/hooks/useAccessibility';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  disabled?: boolean;
  current?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface AccessibleNavigationProps extends React.HTMLAttributes<HTMLElement> {
  // Navigation props
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'tabs' | 'pills' | 'breadcrumb';
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  // High contrast mode support
  highContrast?: boolean;
  // Reduced motion support
  reducedMotion?: boolean;
  // Interactive behavior
  expandable?: boolean;
  collapsible?: boolean;
  // Event handlers
  onItemClick?: (item: NavigationItem, event: React.MouseEvent) => void;
  onItemKeyDown?: (item: NavigationItem, event: React.KeyboardEvent) => void;
}

const AccessibleNavigation = forwardRef<HTMLElement, AccessibleNavigationProps>(
  ({
    className,
    items,
    orientation = 'horizontal',
    variant = 'default',
    ariaLabel,
    ariaDescribedBy,
    highContrast = false,
    reducedMotion = false,
    expandable = false,
    collapsible = false,
    onItemClick,
    onItemKeyDown,
    ...props
  }, ref) => {
    const navId = useId();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [focusedItem, setFocusedItem] = useState<string | null>(null);

    // Use accessibility hook for keyboard navigation
    const { containerRef, focusFirstElement, focusLastElement } = useAccessibility({
      trapFocus: false,
      restoreFocus: false,
    });

    // Handle item expansion/collapse
    const toggleExpanded = useCallback((itemId: string) => {
      if (!expandable) return;
      
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    }, [expandable]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent, item: NavigationItem) => {
      const { key } = event;
      
      switch (key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (item.children && expandable) {
            toggleExpanded(item.id);
          } else if (item.href) {
            // Navigate to href
            window.location.href = item.href;
          }
          if (onItemClick) {
            onItemClick(item, event as any);
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal') {
            event.preventDefault();
            // Focus next item
            const currentIndex = items.findIndex(i => i.id === item.id);
            const nextIndex = (currentIndex + 1) % items.length;
            const nextItem = items[nextIndex];
            if (nextItem) {
              const nextElement = document.querySelector(`[data-nav-item="${nextItem.id}"]`) as HTMLElement;
              nextElement?.focus();
            }
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal') {
            event.preventDefault();
            // Focus previous item
            const currentIndex = items.findIndex(i => i.id === item.id);
            const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            const prevItem = items[prevIndex];
            if (prevItem) {
              const prevElement = document.querySelector(`[data-nav-item="${prevItem.id}"]`) as HTMLElement;
              prevElement?.focus();
            }
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || (item.children && expandedItems.has(item.id))) {
            event.preventDefault();
            // Focus first child or next item
            if (item.children && expandedItems.has(item.id)) {
              const firstChild = item.children[0];
              if (firstChild) {
                const childElement = document.querySelector(`[data-nav-item="${firstChild.id}"]`) as HTMLElement;
                childElement?.focus();
              }
            } else {
              const currentIndex = items.findIndex(i => i.id === item.id);
              const nextIndex = (currentIndex + 1) % items.length;
              const nextItem = items[nextIndex];
              if (nextItem) {
                const nextElement = document.querySelector(`[data-nav-item="${nextItem.id}"]`) as HTMLElement;
                nextElement?.focus();
              }
            }
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical') {
            event.preventDefault();
            // Focus previous item
            const currentIndex = items.findIndex(i => i.id === item.id);
            const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            const prevItem = items[prevIndex];
            if (prevItem) {
              const prevElement = document.querySelector(`[data-nav-item="${prevItem.id}"]`) as HTMLElement;
              prevElement?.focus();
            }
          }
          break;
        case 'Home':
          event.preventDefault();
          focusFirstElement();
          break;
        case 'End':
          event.preventDefault();
          focusLastElement();
          break;
        case 'Escape':
          if (expandedItems.size > 0) {
            event.preventDefault();
            setExpandedItems(new Set());
          }
          break;
      }

      if (onItemKeyDown) {
        onItemKeyDown(item, event);
      }
    }, [items, orientation, expandable, expandedItems, focusFirstElement, focusLastElement, toggleExpanded, onItemKeyDown]);

    // Render navigation item
    const renderItem = (item: NavigationItem, level: number = 0) => {
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.children && item.children.length > 0;
      const isCurrent = item.current;
      const isDisabled = item.disabled;

      // Build item className
      const itemClassName = cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
        // Variant styles
        variant === 'tabs' && 'border-b-2 border-transparent hover:border-gray-300',
        variant === 'pills' && 'rounded-full',
        variant === 'breadcrumb' && 'text-gray-500 hover:text-gray-700',
        // States
        isCurrent && 'bg-blue-100 text-blue-700',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && !isCurrent && 'hover:bg-gray-100 hover:text-gray-900',
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // High contrast
        highContrast && 'focus:ring-4 focus:ring-offset-1',
        // Reduced motion
        reducedMotion && 'transition-none',
        // Level indentation
        level > 0 && 'mr-4'
      );

      // Build ARIA attributes
      const ariaAttributes = {
        'aria-label': item.ariaLabel,
        'aria-describedby': item.ariaDescribedBy,
        'aria-current': isCurrent ? 'page' : undefined,
        'aria-disabled': isDisabled,
        'aria-expanded': hasChildren ? isExpanded : undefined,
        'aria-haspopup': hasChildren ? 'menu' : undefined,
      };

      // Remove undefined values
      const cleanAriaAttributes = Object.fromEntries(
        Object.entries(ariaAttributes).filter(([_, value]) => value !== undefined)
      );

      return (
        <li key={item.id} role="none">
          {item.href ? (
            <a
              href={item.href}
              className={itemClassName}
              data-nav-item={item.id}
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => handleKeyDown(e, item)}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  return;
                }
                if (onItemClick) {
                  onItemClick(item, e);
                }
              }}
              {...cleanAriaAttributes}
            >
              {item.icon && (
                <span className="ml-2" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
              {hasChildren && (
                <span className="ml-auto" aria-hidden="true">
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
            </a>
          ) : (
            <button
              type="button"
              className={itemClassName}
              data-nav-item={item.id}
              disabled={isDisabled}
              onKeyDown={(e) => handleKeyDown(e, item)}
              onClick={(e) => {
                if (isDisabled) return;
                if (hasChildren && expandable) {
                  toggleExpanded(item.id);
                }
                if (onItemClick) {
                  onItemClick(item, e as any);
                }
              }}
              {...cleanAriaAttributes}
            >
              {item.icon && (
                <span className="ml-2" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
              {hasChildren && (
                <span className="ml-auto" aria-hidden="true">
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
            </button>
          )}

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <ul
              className="mt-2 space-y-1"
              role="group"
              aria-label={`${item.label} submenu`}
            >
              {item.children.map(child => renderItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    };

    // Build navigation className
    const navClassName = cn(
      'flex',
      orientation === 'vertical' && 'flex-col space-y-1',
      orientation === 'horizontal' && 'flex-row space-x-1',
      variant === 'breadcrumb' && 'items-center space-x-2',
      highContrast && 'ring-2 ring-blue-500 rounded-lg p-2',
      reducedMotion && 'transition-none',
      className
    );

    // Determine the appropriate role
    const getRole = () => {
      switch (variant) {
        case 'tabs':
          return 'tablist';
        case 'breadcrumb':
          return 'navigation';
        default:
          return 'menubar';
      }
    };

    return (
      <nav
        ref={ref}
        className={navClassName}
        role={getRole()}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        <ul
          ref={containerRef}
          className={cn(
            'flex',
            orientation === 'vertical' && 'flex-col space-y-1',
            orientation === 'horizontal' && 'flex-row space-x-1',
            variant === 'breadcrumb' && 'flex-row items-center space-x-2'
          )}
          role={variant === 'tabs' ? 'tablist' : 'menubar'}
        >
          {items.map(item => renderItem(item))}
        </ul>
      </nav>
    );
  }
);

AccessibleNavigation.displayName = 'AccessibleNavigation';

// Breadcrumb component
export const AccessibleBreadcrumb = forwardRef<
  HTMLElement,
  Omit<AccessibleNavigationProps, 'variant' | 'orientation'> & {
    separator?: React.ReactNode;
  }
>(({ separator = '›', ...props }, ref) => {
  return (
    <AccessibleNavigation
      ref={ref}
      variant="breadcrumb"
      orientation="horizontal"
      {...props}
    />
  );
});

AccessibleBreadcrumb.displayName = 'AccessibleBreadcrumb';

// Tab navigation component
export const AccessibleTabs = forwardRef<
  HTMLElement,
  Omit<AccessibleNavigationProps, 'variant'> & {
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
  }
>(({ activeTab, onTabChange, ...props }, ref) => {
  // Mark the active tab
  const itemsWithCurrent = props.items.map(item => ({
    ...item,
    current: item.id === activeTab,
  }));

  return (
    <AccessibleNavigation
      ref={ref}
      variant="tabs"
      orientation="horizontal"
      items={itemsWithCurrent}
      onItemClick={(item) => {
        if (onTabChange) {
          onTabChange(item.id);
        }
      }}
      {...props}
    />
  );
});

AccessibleTabs.displayName = 'AccessibleTabs';

export { AccessibleNavigation };
