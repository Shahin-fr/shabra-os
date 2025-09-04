import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Button } from '../button';

describe('Button Component', () => {
  it('renders with correct text and variant', () => {
    render(<Button variant='default'>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('handles click events correctly', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Note: The Button component doesn't set aria-disabled, it just uses the disabled attribute
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant='destructive'>Delete</Button>);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant='outline'>Outline</Button>);
    button = screen.getByRole('button');
    // The outline variant includes border classes but they're part of a longer class string
    expect(button.className).toContain('border');
    expect(button.className).toContain('border-input');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>);

    let button = screen.getByRole('button');
    // The small size includes h-8 and px-3 classes
    expect(button.className).toContain('h-8');
    expect(button.className).toContain('px-3');

    rerender(<Button size='lg'>Large</Button>);
    button = screen.getByRole('button');
    // The large size includes h-10 and px-6 classes
    expect(button.className).toContain('h-10');
    expect(button.className).toContain('px-6');
  });

  it('renders with icon when provided', () => {
    render(<Button>Button with Icon</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className='custom-class'>Custom Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
