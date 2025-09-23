# Button Component - Shabra UI Design System

A highly reusable and accessible Button component built with React, TypeScript, and TailwindCSS, following the Shabra UI Design System with hot pink (#ff0a54) primary branding.

## Features

- 🎨 **Design System Compliant**: Built according to Shabra UI Design System specifications
- 🌈 **Multiple Variants**: Primary (hot pink), Secondary (electric blue), Ghost, and Destructive
- 📏 **Three Sizes**: Small (sm), Medium (md), and Large (lg)
- ⚡ **Loading States**: Built-in loading spinner with proper accessibility
- 🌍 **RTL Support**: Full right-to-left support for Persian/Farsi text
- ♿ **Accessible**: WCAG AA compliant with proper ARIA attributes
- 📱 **Mobile Optimized**: Touch-friendly sizing and interactions
- 🔧 **TypeScript**: Full type safety with comprehensive interfaces
- 🎯 **CVA Integration**: Uses Class Variance Authority for flexible styling

## Installation

The Button component is already included in the project. Import it using:

```tsx
import { Button } from '@/components/ui/Button';
// or
import { Button } from '@/components/ui';
```

## Basic Usage

```tsx
import { Button } from '@/components/ui/Button';

function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button size="lg">Large Button</Button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows loading spinner and disables button |
| `isDisabled` | `boolean` | `false` | Disables the button |
| `children` | `React.ReactNode` | - | Button content |
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `(event: MouseEvent) => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | - | All standard button props |

## Variants

### Primary (Default)
Uses the hot pink (#ff0a54) brand color from the design system.

```tsx
<Button variant="default">Default Button</Button>
```

### Secondary
Uses the electric blue (#00d4ff) secondary color.

```tsx
<Button variant="secondary">Secondary Button</Button>
```

### Ghost
Transparent background with hover effects.

```tsx
<Button variant="ghost">Ghost Button</Button>
```

### Destructive
Uses the error color for destructive actions.

```tsx
<Button variant="destructive">Delete</Button>
```

## Sizes

### Small (sm)
- Height: 32px
- Padding: 12px horizontal, 8px vertical
- Font size: 12px

```tsx
<Button size="sm">Small Button</Button>
```

### Medium (md) - Default
- Height: 40px
- Padding: 16px horizontal, 8px vertical
- Font size: 14px

```tsx
<Button size="md">Medium Button</Button>
```

### Large (lg)
- Height: 48px
- Padding: 24px horizontal, 12px vertical
- Font size: 16px

```tsx
<Button size="lg">Large Button</Button>
```

## States

### Loading State
Shows a spinner and disables the button with proper accessibility.

```tsx
<Button isLoading>Loading...</Button>
```

### Disabled State
Disables the button with reduced opacity.

```tsx
<Button isDisabled>Disabled Button</Button>
```

## RTL Support

The Button component fully supports right-to-left text direction for Persian/Farsi content:

```tsx
<Button>دکمه فارسی</Button>
<Button>متن ترکیبی English + فارسی</Button>
```

## Accessibility Features

- **Screen Reader Support**: Proper ARIA attributes for loading and disabled states
- **Keyboard Navigation**: Full keyboard support with focus indicators
- **Touch Targets**: Minimum 44px touch targets for mobile devices
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators for keyboard users

## Examples

### Basic Examples

```tsx
// Simple button
<Button>Click me</Button>

// With click handler
<Button onClick={() => console.log('Clicked!')}>
  Click me
</Button>

// With custom styling
<Button className="w-full">Full Width</Button>
```

### Form Integration

```tsx
<form>
  <Button type="submit">Submit Form</Button>
  <Button type="reset">Reset</Button>
</form>
```

### Loading States

```tsx
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await submitData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button isLoading={isLoading} onClick={handleSubmit}>
      {isLoading ? 'Saving...' : 'Save'}
    </Button>
  );
}
```

### Icon Integration

```tsx
import { Plus, Save } from 'lucide-react';

<Button>
  <Plus className="w-4 h-4" />
  Add Item
</Button>

<Button variant="secondary">
  <Save className="w-4 h-4" />
  Save Changes
</Button>
```

### Persian/Farsi Examples

```tsx
<Button variant="default">دکمه پیش‌فرض</Button>
<Button variant="secondary">دکمه ثانویه</Button>
<Button variant="ghost">دکمه شبح</Button>
<Button variant="destructive">حذف</Button>
<Button isLoading>در حال بارگذاری...</Button>
```

## Styling

The Button component uses TailwindCSS classes and follows the Shabra UI Design System color palette:

- **Primary**: Hot pink (#ff0a54) with proper hover/active states
- **Secondary**: Electric blue (#00d4ff) with proper hover/active states
- **Ghost**: Transparent with accent color hover
- **Destructive**: Error color with proper hover/active states

All variants include:
- Proper shadow effects
- Smooth transitions
- Touch-friendly sizing
- RTL-compatible spacing

## Testing

The component includes comprehensive tests covering:
- All variants and sizes
- Loading and disabled states
- Accessibility features
- RTL support
- Edge cases and error handling

Run tests with:
```bash
npm run test:unit
```

## Design System Compliance

This Button component strictly follows the Shabra UI Design System:

- ✅ Uses exact color values from the design system
- ✅ Implements proper spacing scale (4px grid)
- ✅ Follows typography guidelines
- ✅ Includes proper shadow system
- ✅ Supports RTL text direction
- ✅ Meets WCAG AA accessibility standards
- ✅ Uses Vazirmatn font family for Persian text

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance

- Zero runtime dependencies
- Optimized for tree-shaking
- Minimal bundle impact
- Efficient re-renders with React.memo patterns

## Contributing

When modifying the Button component:

1. Ensure all tests pass
2. Update documentation
3. Test RTL support
4. Verify accessibility compliance
5. Check design system alignment

## License

Part of the Shabra OS project. See main project license for details.
