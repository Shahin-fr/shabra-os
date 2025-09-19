import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeInTheDocument(): T;
      toHaveClass(...classNames: string[]): T;
      toHaveAttribute(attr: string, value?: string): T;
      toBeDisabled(): T;
      toBeEnabled(): T;
      toHaveValue(value: string | string[]): T;
    }
  }
}
