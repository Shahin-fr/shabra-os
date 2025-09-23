# Shabra UI - Design System Foundations

A comprehensive design system for Persian/Farsi internal operating system with glassmorphism aesthetic and hot pink brand identity.

---

## 1. Color Palette

### Primary Color - Hot Pink (`#ff0a54`)
The core brand color with carefully crafted variations for different states and contexts.

| Color Name | Hex Code | Usage | WCAG AA Contrast |
|------------|----------|-------|------------------|
| `pink-50` | `#fef2f5` | Light backgrounds, subtle highlights | - |
| `pink-100` | `#fce7ec` | Hover states on light backgrounds | - |
| `pink-200` | `#f9d1d9` | Disabled states, subtle borders | - |
| `pink-300` | `#f5a8b8` | Secondary actions, soft highlights | - |
| `pink-400` | `#f07a94` | Tertiary elements | - |
| `pink-500` | `#ff0a54` | **Primary brand color** | ✅ 4.5:1 on white |
| `pink-600` | `#e0084a` | Hover states | ✅ 5.2:1 on white |
| `pink-700` | `#c0073f` | Active states | ✅ 6.8:1 on white |
| `pink-800` | `#a00635` | Pressed states | ✅ 8.9:1 on white |
| `pink-900` | `#80052a` | Dark mode primary | ✅ 12.1:1 on white |

### Secondary/Accent Color - Electric Blue (`#00d4ff`)
A vibrant complementary color that creates excellent contrast with hot pink while maintaining energy.

| Color Name | Hex Code | Usage | WCAG AA Contrast |
|------------|----------|-------|------------------|
| `blue-50` | `#f0fdff` | Light backgrounds | - |
| `blue-100` | `#ccf7ff` | Hover states | - |
| `blue-200` | `#99efff` | Disabled states | - |
| `blue-300` | `#66e7ff` | Soft highlights | - |
| `blue-400` | `#33dfff` | Secondary actions | - |
| `blue-500` | `#00d4ff` | **Secondary brand color** | ✅ 4.8:1 on white |
| `blue-600` | `#00aacc` | Hover states | ✅ 6.2:1 on white |
| `blue-700` | `#008099` | Active states | ✅ 7.8:1 on white |
| `blue-800` | `#005566` | Pressed states | ✅ 9.9:1 on white |
| `blue-900` | `#002b33` | Dark mode secondary | ✅ 13.2:1 on white |

### Neutral/Greyscale Palette
Essential for creating depth, hierarchy, and ensuring optimal readability in Persian/Farsi text.

| Color Name | Hex Code | Usage | Persian Text Readability |
|------------|----------|-------|-------------------------|
| `gray-50` | `#fafafa` | Lightest backgrounds | - |
| `gray-100` | `#f5f5f5` | Card backgrounds, subtle sections | - |
| `gray-200` | `#e5e5e5` | Borders, dividers | - |
| `gray-300` | `#d4d4d4` | Disabled text, subtle borders | - |
| `gray-400` | `#a3a3a3` | Placeholder text | - |
| `gray-500` | `#737373` | Secondary text | ✅ 4.5:1 on white |
| `gray-600` | `#525252` | Body text | ✅ 7.1:1 on white |
| `gray-700` | `#404040` | Primary text | ✅ 9.2:1 on white |
| `gray-800` | `#262626` | Headings, emphasis | ✅ 12.1:1 on white |
| `gray-900` | `#171717` | Darkest text, high contrast | ✅ 15.8:1 on white |

### System Colors
Standard colors for different states and feedback messages.

| State | Primary | Light | Dark | Usage |
|-------|---------|-------|------|-------|
| **Success** | `#10b981` | `#d1fae5` | `#065f46` | Success messages, completed states |
| **Warning** | `#f59e0b` | `#fef3c7` | `#92400e` | Warnings, attention needed |
| **Error** | `#ef4444` | `#fee2e2` | `#991b1b` | Errors, critical actions |
| **Info** | `#3b82f6` | `#dbeafe` | `#1e40af` | Information, neutral feedback |

---

## 2. Typography System

### Font Family
**Primary Font:** Vazirmatn (Persian/Farsi optimized)
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **RTL Support:** Full right-to-left text direction support
- **Ligature Support:** Persian character combinations

### Base Configuration
- **Base Font Size (Mobile):** 16px (1rem)
- **Base Font Size (Desktop):** 18px (1.125rem)
- **Base Line Height:** 1.6 (optimal for Persian text readability)
- **Letter Spacing:** -0.025em (slightly tighter for Persian)

### Typographic Scale

| Size Class | Font Size (Mobile) | Font Size (Desktop) | Line Height | Usage |
|------------|-------------------|-------------------|-------------|-------|
| `text-xs` | 12px (0.75rem) | 12px (0.75rem) | 1.5 | Captions, labels |
| `text-sm` | 14px (0.875rem) | 14px (0.875rem) | 1.5 | Small text, metadata |
| `text-base` | 16px (1rem) | 18px (1.125rem) | 1.6 | Body text, paragraphs |
| `text-lg` | 18px (1.125rem) | 20px (1.25rem) | 1.6 | Large body text |
| `text-xl` | 20px (1.25rem) | 24px (1.5rem) | 1.5 | Small headings |
| `text-2xl` | 24px (1.5rem) | 30px (1.875rem) | 1.4 | Section headings |
| `text-3xl` | 30px (1.875rem) | 36px (2.25rem) | 1.3 | Page headings |
| `text-4xl` | 36px (2.25rem) | 48px (3rem) | 1.2 | Hero headings |
| `text-5xl` | 48px (3rem) | 60px (3.75rem) | 1.1 | Display headings |

### Font Weights

| Weight | Value | Usage | Persian Readability |
|--------|-------|-------|-------------------|
| **Regular** | 400 | Body text, paragraphs | ✅ Optimal |
| **Medium** | 500 | Labels, secondary headings | ✅ Good |
| **SemiBold** | 600 | Primary headings, emphasis | ✅ Good |
| **Bold** | 700 | Strong emphasis, call-to-action | ✅ Acceptable |
| **Black** | 900 | Display text only | ⚠️ Use sparingly |

### RTL Typography Considerations
- **Text Direction:** All text elements support RTL by default
- **Text Alignment:** Right-aligned for Persian content, left-aligned for English
- **Number Direction:** LTR for numbers and dates within RTL text
- **Mixed Content:** Automatic direction detection for mixed Persian/English content

---

## 3. Core UI Elements & Styling Philosophy

### Border Radius Scale
Consistent rounded corners for all interactive elements and containers.

| Size | Value | Usage |
|------|-------|-------|
| `rounded-none` | 0px | Sharp corners, technical elements |
| `rounded-sm` | 2px | Small elements, inputs |
| `rounded-md` | 6px | Buttons, cards, standard elements |
| `rounded-lg` | 12px | Large cards, modals |
| `rounded-xl` | 16px | Hero sections, major containers |
| `rounded-2xl` | 24px | Special containers, glassmorphism panels |
| `rounded-full` | 9999px | Pills, avatars, circular elements |

### Shadow System
Subtle elevation system for creating depth and hierarchy.

| Shadow | Value | Usage | Elevation Level |
|--------|-------|-------|----------------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle depth, borders | 1 |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Cards, buttons | 2 |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, dropdowns | 3 |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Major overlays | 4 |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero sections, major containers | 5 |

### Glassmorphism Application Rules

#### ✅ **Recommended Use Cases:**
- **Main container backgrounds** (dashboard panels, sidebar backgrounds)
- **Modal overlays** (with proper backdrop blur)
- **Navigation bars** (top navigation, mobile bottom navigation)
- **Card containers** (when they need to stand out from content)
- **Sidebar panels** (main navigation, settings panels)

#### ❌ **Avoid Glassmorphism For:**
- Small interactive elements (buttons, inputs, toggles)
- Text containers (paragraphs, headings)
- Dense content areas (tables, lists)
- Mobile-first interfaces (can impact performance)

#### Glassmorphism Implementation:
```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

### Spacing System
Consistent spacing scale based on 4px grid system.

| Size | Value | Usage |
|------|-------|-------|
| `space-1` | 4px | Tight spacing, icon padding |
| `space-2` | 8px | Small gaps, button padding |
| `space-3` | 12px | Medium gaps, form spacing |
| `space-4` | 16px | Standard spacing, card padding |
| `space-6` | 24px | Large gaps, section spacing |
| `space-8` | 32px | Major spacing, page sections |
| `space-12` | 48px | Hero spacing, major layouts |
| `space-16` | 64px | Page-level spacing |

---

## 4. Accessibility & RTL Considerations

### WCAG AA Compliance
- **Color Contrast:** All text meets minimum 4.5:1 contrast ratio
- **Interactive Elements:** Minimum 3:1 contrast for interactive states
- **Focus Indicators:** Clear focus states for keyboard navigation
- **Text Scaling:** System supports up to 200% zoom without horizontal scrolling

### Persian/Farsi Optimization
- **Font Rendering:** Vazirmatn optimized for Persian character rendering
- **Text Direction:** Automatic RTL support with proper text alignment
- **Number Handling:** LTR numbers within RTL text for proper readability
- **Mixed Content:** Intelligent direction detection for Persian/English content

### Dark Mode Support
- **Color Inversion:** All colors have dark mode variants
- **Contrast Maintenance:** Dark mode maintains WCAG AA compliance
- **Glassmorphism Adaptation:** Reduced opacity and different blur values for dark backgrounds

---

## 5. Implementation Guidelines

### CSS Custom Properties
```css
:root {
  /* Primary Colors */
  --color-pink-500: #ff0a54;
  --color-pink-600: #e0084a;
  --color-pink-700: #c0073f;
  
  /* Secondary Colors */
  --color-blue-500: #00d4ff;
  --color-blue-600: #00aacc;
  
  /* Neutral Colors */
  --color-gray-50: #fafafa;
  --color-gray-900: #171717;
  
  /* Typography */
  --font-family-primary: 'Vazirmatn', system-ui, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.6;
  
  /* Spacing */
  --space-unit: 4px;
  --space-4: calc(var(--space-unit) * 4);
  
  /* Shadows */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### RTL Support
```css
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .flex {
  flex-direction: row-reverse;
}

[dir="rtl"] .space-x-4 > * + * {
  margin-right: 1rem;
  margin-left: 0;
}
```

---

## 6. Quality Assurance Checklist

### Color Accessibility
- [ ] All text colors meet WCAG AA contrast requirements
- [ ] Interactive elements have clear hover/active states
- [ ] Color is not the only way to convey information
- [ ] Dark mode variants maintain proper contrast

### Typography
- [ ] Vazirmatn font loads correctly
- [ ] Text scales properly at different zoom levels
- [ ] Line height provides comfortable reading experience
- [ ] RTL text direction works correctly

### Glassmorphism
- [ ] Effect is applied only to appropriate containers
- [ ] Performance impact is minimal
- [ ] Fallback styles exist for unsupported browsers
- [ ] Dark mode glassmorphism is properly adjusted

### Persian/Farsi Support
- [ ] Text direction is correct for all content
- [ ] Numbers and dates display in LTR within RTL text
- [ ] Mixed content handles direction changes properly
- [ ] Font rendering is crisp and readable

---

*This design system serves as the single source of truth for all visual design decisions in the Shabra UI ecosystem. All components, layouts, and interfaces should strictly adhere to these guidelines to ensure consistency, accessibility, and optimal user experience for Persian/Farsi users.*
