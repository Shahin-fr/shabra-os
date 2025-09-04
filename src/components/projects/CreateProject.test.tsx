import { useMutation, useQueryClient } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

// Mock the specific functions that the component imports
vi.mock('@/lib/auth-utils', () => ({
  isAdminOrManager: vi.fn(() => true), // Default to true for most tests
}));

vi.mock('@/lib/utils', () => ({
  showStatusMessage: vi.fn(),
  cn: (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' '),
}));

vi.mock('@/lib/queries', () => ({
  projectsKeys: {
    all: ['projects'],
    byPage: (page: number) => ['projects', 'page', page],
  },
}));

// Import the component after mocking
import CreateProject from './CreateProject';

describe('CreateProject', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  const mockQueryClient = {
    cancelQueries: vi.fn(),
    getQueriesData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  };

  const mockMutation = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  };

  const mockSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      roles: ['ADMIN'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useRouter as any).mockReturnValue(mockRouter);
    (useQueryClient as any).mockReturnValue(mockQueryClient);
    (useSession as any).mockReturnValue({ data: mockSession });
    (useMutation as any).mockReturnValue(mockMutation);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the create project button', () => {
      render(<CreateProject />);
      expect(screen.getByText('پروژه جدید')).toBeInTheDocument();
    });

    it('should render when user has admin role', () => {
      render(<CreateProject />);
      expect(screen.getByText('پروژه جدید')).toBeInTheDocument();
    });
  });

  describe('Dialog Functionality', () => {
    it('should open dialog when trigger button is clicked', () => {
      render(<CreateProject />);

      const triggerButton = screen.getByText('پروژه جدید');
      fireEvent.click(triggerButton);

      expect(
        screen.getByText('اطلاعات پروژه جدید را وارد کنید')
      ).toBeInTheDocument();
    });
  });

  describe('Form Elements', () => {
    it('should have name and description inputs', () => {
      render(<CreateProject />);

      // Open dialog
      const triggerButton = screen.getByText('پروژه جدید');
      fireEvent.click(triggerButton);

      expect(screen.getByLabelText('نام پروژه')).toBeInTheDocument();
      expect(screen.getByLabelText('توضیحات')).toBeInTheDocument();
    });

    it('should have submit and cancel buttons', () => {
      render(<CreateProject />);

      // Open dialog
      const triggerButton = screen.getByText('پروژه جدید');
      fireEvent.click(triggerButton);

      expect(screen.getByText('ایجاد پروژه')).toBeInTheDocument();
      expect(screen.getByText('انصراف')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should handle input changes', () => {
      render(<CreateProject />);

      // Open dialog
      const triggerButton = screen.getByText('پروژه جدید');
      fireEvent.click(triggerButton);

      const nameInput = screen.getByLabelText('نام پروژه') as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        'توضیحات'
      ) as HTMLTextAreaElement;

      fireEvent.change(nameInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, {
        target: { value: 'Test Description' },
      });

      expect(nameInput.value).toBe('Test Project');
      expect(descriptionInput.value).toBe('Test Description');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during mutation', () => {
      (useMutation as any).mockReturnValue({
        ...mockMutation,
        isPending: true,
      });

      render(<CreateProject />);

      // Open dialog
      const triggerButton = screen.getByText('پروژه جدید');
      fireEvent.click(triggerButton);

      // Fill form
      const nameInput = screen.getByLabelText('نام پروژه');
      fireEvent.change(nameInput, { target: { value: 'Test Project' } });

      // Submit
      const submitButton = screen.getByText('در حال ایجاد...');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
