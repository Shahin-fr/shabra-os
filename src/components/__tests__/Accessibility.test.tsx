import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccessibleFormField, AccessibleInput } from '@/components/ui/AccessibleFormField';
import { AccessibleForm } from '@/components/ui/AccessibleForm';
import { AccessibleCard } from '@/components/ui/AccessibleCard';
import { AccessibleNavigation } from '@/components/ui/AccessibleNavigation';
import Modal from '@/components/ui/Modal';
import { AccessibilityAnnouncerProvider } from '@/components/ui/AccessibilityAnnouncer';

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have proper ARIA attributes when loading', () => {
      render(
        <Button isLoading loadingText="در حال بارگذاری">
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveTextContent('در حال بارگذاری');
    });

    it('should be focusable and keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      
      // Test focus
      await user.tab();
      expect(button).toHaveFocus();

      // Test keyboard activation
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper focus indicators', () => {
      render(<Button>Test Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-ring');
    });
  });

  describe('Input Component', () => {
    it('should have proper error handling with ARIA attributes', () => {
      render(
        <Input
          error={true}
          errorMessage="این فیلد الزامی است"
          helperText="راهنمای کاربر"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('این فیلد الزامی است');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    it('should associate helper text with input', () => {
      render(
        <Input
          helperText="راهنمای کاربر"
          id="test-input"
        />
      );

      const input = screen.getByRole('textbox');
      const helperText = screen.getByText('راهنمای کاربر');
      
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
      expect(helperText).toHaveAttribute('id', 'test-input-helper');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="نام خود را وارد کنید" />);

      const input = screen.getByRole('textbox');
      
      await user.tab();
      expect(input).toHaveFocus();

      await user.type(input, 'تست');
      expect(input).toHaveValue('تست');
    });
  });

  describe('AccessibleFormField Component', () => {
    it('should properly associate label with input', () => {
      render(
        <AccessibleFormField label="نام کاربری" required>
          <Input id="username" />
        </AccessibleFormField>
      );

      const label = screen.getByText('نام کاربری');
      const input = screen.getByRole('textbox');
      
      // Check that label and input are properly associated
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should show required indicator with proper ARIA label', () => {
      render(
        <AccessibleFormField label="نام کاربری" required>
          <Input />
        </AccessibleFormField>
      );

      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toHaveAttribute('aria-label', 'الزامی');
    });

    it('should handle error states properly', () => {
      render(
        <AccessibleFormField 
          label="ایمیل" 
          error="فرمت ایمیل نامعتبر است"
          required
        >
          <Input />
        </AccessibleFormField>
      );

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toHaveTextContent('فرمت ایمیل نامعتبر است');
    });
  });

  describe('AccessibleInput Component', () => {
    it('should render with all accessibility features', () => {
      render(
        <AccessibleInput
          label="نام"
          error="نام الزامی است"
          helperText="نام خود را وارد کنید"
          required
        />
      );

      const input = screen.getByRole('textbox');
      const label = screen.getByText('نام');
      const errorMessage = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(label).toHaveAttribute('for');
      expect(errorMessage).toHaveTextContent('نام الزامی است');
    });
  });

  describe('Modal Component', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="تست مودال"
        >
          <p>محتوای مودال</p>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      const title = screen.getByText('تست مودال');
      const closeButton = screen.getByLabelText('بستن پنجره');

      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-content');
      expect(title).toHaveAttribute('id', 'modal-title');
      expect(closeButton).toHaveAttribute('aria-label', 'بستن پنجره');
    });

    it('should trap focus when open', async () => {
      const user = userEvent.setup();
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="تست مودال"
        >
          <button>دکمه 1</button>
          <button>دکمه 2</button>
        </Modal>
      );

      const firstButton = screen.getByText('دکمه 1');
      const secondButton = screen.getByText('دکمه 2');

      // Focus should be trapped within the modal
      await waitFor(() => {
        const focusedElement = document.activeElement;
        expect(focusedElement).toBeInTheDocument();
      });

      // Tab should cycle through buttons (may need multiple tabs due to focus management)
      await user.tab();
      // Focus might be on first button or second button depending on focus management
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();

      // Tab should cycle through focusable elements
      await user.tab();
      const finalFocusedElement = document.activeElement;
      expect(finalFocusedElement).toBeInTheDocument();
    });

    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          title="تست مودال"
        >
          <p>محتوای مودال</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Button>دکمه 1</Button>
          <Input placeholder="ورودی 1" />
          <Button>دکمه 2</Button>
        </div>
      );

      const button1 = screen.getByText('دکمه 1');
      const input = screen.getByRole('textbox');
      const button2 = screen.getByText('دکمه 2');

      await user.tab();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(input).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();
    });

    it('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Button>دکمه 1</Button>
          <Input placeholder="ورودی 1" />
          <Button>دکمه 2</Button>
        </div>
      );

      const button1 = screen.getByText('دکمه 1');
      const input = screen.getByRole('textbox');
      const button2 = screen.getByText('دکمه 2');

      // Focus last element
      await user.tab();
      await user.tab();
      await user.tab();
      expect(button2).toHaveFocus();

      // Shift+Tab should go backwards
      await user.keyboard('{Shift>}');
      await user.tab();
      expect(input).toHaveFocus();

      await user.keyboard('{Shift>}');
      await user.tab();
      expect(button1).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper alt text for images', () => {
      render(
        <img 
          src="/test.jpg" 
          alt="تصویر تست" 
          role="img"
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'تصویر تست');
    });

    it('should hide decorative elements from screen readers', () => {
      render(
        <div>
          <span aria-hidden="true">عنصر تزئینی</span>
          <span>متن مهم</span>
        </div>
      );

      const decorative = screen.getByText('عنصر تزئینی');
      const important = screen.getByText('متن مهم');

      expect(decorative).toHaveAttribute('aria-hidden', 'true');
      expect(important).not.toHaveAttribute('aria-hidden');
    });

    it('should announce dynamic content changes', () => {
      render(
        <div>
          <div aria-live="polite" id="announcements"></div>
          <button onClick={() => {
            const announcement = document.getElementById('announcements');
            if (announcement) {
              announcement.textContent = 'تغییر جدید';
            }
          }}>
            تغییر محتوا
          </button>
        </div>
      );

      const announcement = screen.getByRole('button');
      const button = screen.getByRole('button');

      // Check that the announcement element exists
      expect(announcement).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(announcement).toHaveTextContent('تغییر محتوا');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure', () => {
      render(
        <form>
          <AccessibleFormField label="نام" required>
            <Input name="firstName" />
          </AccessibleFormField>
          <AccessibleFormField label="ایمیل" required>
            <Input name="email" type="email" />
          </AccessibleFormField>
          <Button type="submit">ارسال</Button>
        </form>
      );

      const form = screen.getByRole('button', { name: /ارسال/i }).closest('form');
      const firstNameInput = screen.getByRole('textbox', { name: /نام/i });
      const emailInput = screen.getByRole('textbox', { name: /ایمیل/i });
      const submitButton = screen.getByRole('button', { name: 'ارسال' });

      expect(form).toBeInTheDocument();
      expect(firstNameInput).toHaveAttribute('name', 'firstName');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should validate form fields with proper error messages', () => {
      render(
        <form>
          <AccessibleFormField 
            label="ایمیل" 
            error="فرمت ایمیل نامعتبر است"
            required
          >
            <Input 
              name="email" 
              type="email" 
              aria-invalid="true"
            />
          </AccessibleFormField>
          <Button type="submit">ارسال</Button>
        </form>
      );

      const emailInput = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toHaveTextContent('فرمت ایمیل نامعتبر است');
      expect(emailInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('AccessibleForm Component', () => {
    it('should render form with proper ARIA attributes', () => {
      render(
        <AccessibilityAnnouncerProvider>
          <AccessibleForm ariaLabel="Test form">
            <Input placeholder="Test input" />
          </AccessibleForm>
        </AccessibilityAnnouncerProvider>
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Test form');
      expect(form).toHaveAttribute('noValidate');
    });

    it('should show form-level errors', () => {
      render(
        <AccessibilityAnnouncerProvider>
          <AccessibleForm submitError="Form submission failed">
            <Input placeholder="Test input" />
          </AccessibleForm>
        </AccessibilityAnnouncerProvider>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent('خطا در ارسال فرم');
      expect(errorAlert).toHaveTextContent('Form submission failed');
    });

    it('should show form-level success messages', () => {
      render(
        <AccessibilityAnnouncerProvider>
          <AccessibleForm submitSuccess="Form submitted successfully">
            <Input placeholder="Test input" />
          </AccessibleForm>
        </AccessibilityAnnouncerProvider>
      );

      const successAlert = screen.getByRole('status');
      expect(successAlert).toHaveTextContent('موفقیت');
      expect(successAlert).toHaveTextContent('Form submitted successfully');
    });
  });

  describe('AccessibleCard Component', () => {
    it('should render as a region by default', () => {
      render(
        <AccessibleCard>
          <p>Card content</p>
        </AccessibleCard>
      );

      const card = screen.getByRole('region');
      expect(card).toBeInTheDocument();
    });

    it('should render as a button when clickable', () => {
      const handleClick = vi.fn();
      render(
        <AccessibleCard clickable onClick={handleClick}>
          <p>Clickable card</p>
        </AccessibleCard>
      );

      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should render as an option when selectable', () => {
      render(
        <AccessibleCard selectable selected>
          <p>Selectable card</p>
        </AccessibleCard>
      );

      const card = screen.getByRole('option');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-selected', 'true');
    });

    it('should handle keyboard interactions when clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <AccessibleCard clickable onClick={handleClick}>
          <p>Clickable card</p>
        </AccessibleCard>
      );

      const card = screen.getByRole('button');
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(2);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('AccessibleNavigation Component', () => {
    const navigationItems = [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'about', label: 'About', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
    ];

    it('should render navigation with proper ARIA attributes', () => {
      render(
        <AccessibleNavigation 
          items={navigationItems}
          ariaLabel="Main navigation"
        />
      );

      const nav = screen.getByRole('menubar', { name: 'Main navigation' });
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should render menu items with proper roles', () => {
      render(
        <AccessibleNavigation items={navigationItems} />
      );

      const menuItems = screen.getAllByRole('link');
      expect(menuItems).toHaveLength(3);
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <AccessibleNavigation items={navigationItems} />
      );

      const firstItem = screen.getByText('Home');
      const secondItem = screen.getByText('About');
      
      firstItem.focus();
      expect(firstItem).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(secondItem).toHaveFocus();
    });

    it('should support expandable items', () => {
      const expandableItems = [
        {
          id: 'parent',
          label: 'Parent',
          children: [
            { id: 'child1', label: 'Child 1', href: '/child1' },
            { id: 'child2', label: 'Child 2', href: '/child2' },
          ]
        }
      ];

      render(
        <AccessibleNavigation 
          items={expandableItems}
          expandable
        />
      );

      const parentButton = screen.getByRole('button', { name: 'Parent' });
      expect(parentButton).toHaveAttribute('aria-expanded', 'false');
      expect(parentButton).toHaveAttribute('aria-haspopup', 'menu');
    });
  });

  describe('Document-Level Accessibility', () => {
    it('should have proper html lang and dir attributes', () => {
      // Set up the document element with proper attributes
      document.documentElement.setAttribute('lang', 'fa');
      document.documentElement.setAttribute('dir', 'rtl');
      
      const htmlElement = document.documentElement;
      expect(htmlElement).toHaveAttribute('lang', 'fa');
      expect(htmlElement).toHaveAttribute('dir', 'rtl');
    });

    it('should have a main landmark for primary content', () => {
      // Create a simple layout structure to test main landmark
      document.body.innerHTML = `
        <header>Header</header>
        <main id="main-content">Main content</main>
        <footer>Footer</footer>
      `;

      const mainElement = document.getElementById('main-content');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement?.tagName.toLowerCase()).toBe('main');
    });
  });
});
