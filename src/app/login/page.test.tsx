import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import LoginPage from '../(auth)/login/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (signIn as any).mockResolvedValue({ error: null });
  });

  it('renders login form with all required elements', () => {
    render(<LoginPage />);

    // Check for main title and description
    expect(screen.getByText('ورود به شبرا OS')).toBeInTheDocument();
    expect(
      screen.getByText('برای دسترسی به پنل مدیریت وارد شوید')
    ).toBeInTheDocument();

    // Check for form inputs
    expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور')).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: 'ورود' })).toBeInTheDocument();

    // Check for registration link
    expect(screen.getByText('ثبت نام کنید')).toBeInTheDocument();
  });

  it('handles form input changes correctly', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('رمز عبور') as HTMLInputElement;

    // Test email input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    // Test password input
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  it('validates required fields before submission', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Try to submit without filling required fields
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(signIn).not.toHaveBeenCalled();
  });

  it('handles successful authentication', async () => {
    (signIn as any).mockResolvedValue({ error: null });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل');
    const passwordInput = screen.getByLabelText('رمز عبور');
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('در حال ورود...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for authentication to complete
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    // Check navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('handles authentication error correctly', async () => {
    (signIn as any).mockResolvedValue({ error: 'Invalid credentials' });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل');
    const passwordInput = screen.getByLabelText('رمز عبور');
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit form
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(
        screen.getByText('ایمیل یا رمز عبور اشتباه است')
      ).toBeInTheDocument();
    });

    // Check that loading state is cleared
    expect(screen.getByRole('button', { name: 'ورود' })).not.toBeDisabled();
    expect(screen.queryByText('در حال ورود...')).not.toBeInTheDocument();
  });

  it('handles network/server errors gracefully', async () => {
    (signIn as any).mockRejectedValue(new Error('Network error'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل');
    const passwordInput = screen.getByLabelText('رمز عبور');
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('خطا در ورود به سیستم')).toBeInTheDocument();
    });

    // Check that loading state is cleared
    expect(screen.getByRole('button', { name: 'ورود' })).not.toBeDisabled();
  });

  it('prevents multiple form submissions while loading', async () => {
    (signIn as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل');
    const passwordInput = screen.getByLabelText('رمز عبور');
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form multiple times
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // Should only call signIn once
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it('maintains error message when user continues typing', async () => {
    (signIn as any).mockResolvedValue({ error: 'Invalid credentials' });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل');
    const passwordInput = screen.getByLabelText('رمز عبور');
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form and submit to trigger error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(
        screen.getByText('ایمیل یا رمز عبور اشتباه است')
      ).toBeInTheDocument();
    });

    // Continue typing in email field
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    // Error should remain visible (current implementation doesn't clear on type)
    expect(
      screen.getByText('ایمیل یا رمز عبور اشتباه است')
    ).toBeInTheDocument();
  });

  it('displays proper loading state during authentication', async () => {
    (signIn as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل');
    const passwordInput = screen.getByLabelText('رمز عبور');
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('در حال ورود...')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'در حال ورود...' })
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('در حال ورود...')).not.toBeInTheDocument();
    });
  });

  it('handles empty form submission gracefully', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Try to submit empty form
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    expect(signIn).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('maintains form state during authentication process', async () => {
    (signIn as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('ایمیل') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('رمز عبور') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'ورود' });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Form values should be preserved during loading
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('در حال ورود...')).not.toBeInTheDocument();
    });
  });
});
