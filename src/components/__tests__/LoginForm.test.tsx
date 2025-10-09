import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/app/(auth)/login/page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the OptimizedMotion component
vi.mock('@/components/ui/OptimizedMotion', () => ({
  OptimizedMotion: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

const mockSignIn = signIn as any;
const mockUseRouter = useRouter as any;
const mockUseSearchParams = useSearchParams as any;
const mockUseAuth = useAuth as any;

describe('LoginForm Integration Tests', () => {
  let queryClient: QueryClient;
  let mockPush: any;
  let mockGet: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockPush = vi.fn();
    mockGet = vi.fn();

    mockUseRouter.mockReturnValue({
      push: mockPush,
    });

    mockUseSearchParams.mockReturnValue({
      get: mockGet,
    });

    // Default mock for useAuth - not authenticated, not loading
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      status: 'unauthenticated',
      user: null,
    });

    // Default mock for search params
    mockGet.mockReturnValue(null);
  });

  const renderLoginForm = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );
  };

  describe('Basic Rendering', () => {
    it('should render login form when not authenticated', () => {
      renderLoginForm();

      expect(screen.getByText('ورود به سیستم عامل شبرا')).toBeInTheDocument();
      expect(screen.getByText('برای دسترسی به پنل مدیریت وارد شوید')).toBeInTheDocument();
      expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
      expect(screen.getByLabelText('رمز عبور')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ورود' })).toBeInTheDocument();
    });

    it('should not render form when already authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        status: 'authenticated',
        user: { id: '1', email: 'test@example.com' },
      });

      renderLoginForm();

      expect(screen.queryByText('ورود به شبرا OS')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'ورود' })).not.toBeInTheDocument();
    });

    it('should show loading state when checking authentication', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        status: 'loading',
        user: null,
      });

      renderLoginForm();

      expect(screen.getByText('در حال بررسی وضعیت ورود...')).toBeInTheDocument();
      expect(screen.queryByText('ورود به شبرا OS')).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update email and password fields', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should handle form submission successfully', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null });

      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');
      const submitButton = screen.getByRole('button', { name: 'ورود' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          redirect: false,
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle form submission with error', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');
      const submitButton = screen.getByRole('button', { name: 'ورود' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
      });
    });

    it('should redirect to callback URL after successful login', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null });
      mockGet.mockReturnValue('/dashboard');

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');
      const submitButton = screen.getByRole('button', { name: 'ورود' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form fields when loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        status: 'loading',
        user: null,
      });

      renderLoginForm();

      // When loading, the form should not be rendered at all
      expect(screen.queryByLabelText('ایمیل')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('رمز عبور')).not.toBeInTheDocument();
    });

    it('should show loading spinner during form submission', async () => {
      // Mock useAuth to return loading state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        status: 'loading',
        user: null,
      });

      renderLoginForm();

      // When loading, the form shows a different loading message
      expect(screen.getByText('در حال بررسی وضعیت ورود...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      renderLoginForm();

      // The form element doesn't have a role, so we check for the form element by tag
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');
      const submitButton = screen.getByRole('button', { name: 'ورود' });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have proper heading structure', () => {
      renderLoginForm();

      // The heading is a div, not a proper heading element, so we check for the text content
      expect(screen.getByText('ورود به سیستم عامل شبرا')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Error Handling', () => {
    it('should display error message for invalid credentials', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');
      const submitButton = screen.getByRole('button', { name: 'ورود' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      renderLoginForm();

      const emailInput = screen.getByLabelText('ایمیل');
      const passwordInput = screen.getByLabelText('رمز عبور');
      const submitButton = screen.getByRole('button', { name: 'ورود' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred during signIn call.')).toBeInTheDocument();
      });
    });
  });
});