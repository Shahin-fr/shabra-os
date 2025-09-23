/**
 * Shabra OS Design System
 * A comprehensive design system that ensures consistency across the application
 */

// Brand Colors
export const colors = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2', 
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ff0a54', // Main brand color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#00d4ff', // Electric blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  }
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// Spacing Scale
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

// Animation Durations
export const durations = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const;

// Animation Easing
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Component Variants
export const buttonVariants = {
  primary: {
    background: colors.primary[500],
    color: 'white',
    hover: colors.primary[600],
    active: colors.primary[700],
  },
  secondary: {
    background: colors.secondary[500],
    color: 'white',
    hover: colors.secondary[600],
    active: colors.secondary[700],
  },
  outline: {
    background: 'transparent',
    color: colors.primary[500],
    border: colors.primary[500],
    hover: colors.primary[50],
  },
  ghost: {
    background: 'transparent',
    color: colors.neutral[700],
    hover: colors.neutral[100],
  },
} as const;

// Widget Card Variants
export const widgetVariants = {
  manager: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: colors.primary[200],
    accent: colors.primary[500],
  },
  employee: {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: colors.secondary[200],
    accent: colors.secondary[500],
  },
  success: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: colors.success[200],
    accent: colors.success[500],
  },
  warning: {
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: colors.warning[200],
    accent: colors.warning[500],
  },
  error: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: colors.error[200],
    accent: colors.error[500],
  },
} as const;

// Status Colors
export const statusColors = {
  pending: {
    background: colors.warning[100],
    color: colors.warning[700],
    border: colors.warning[200],
  },
  approved: {
    background: colors.success[100],
    color: colors.success[700],
    border: colors.success[200],
  },
  rejected: {
    background: colors.error[100],
    color: colors.error[700],
    border: colors.error[200],
  },
  active: {
    background: colors.success[100],
    color: colors.success[700],
    border: colors.success[200],
  },
  inactive: {
    background: colors.neutral[100],
    color: colors.neutral[600],
    border: colors.neutral[200],
  },
} as const;

// Priority Colors
export const priorityColors = {
  high: {
    background: colors.error[100],
    color: colors.error[700],
    border: colors.error[200],
  },
  medium: {
    background: colors.warning[100],
    color: colors.warning[700],
    border: colors.warning[200],
  },
  low: {
    background: colors.success[100],
    color: colors.success[700],
    border: colors.success[200],
  },
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;
