# Contributing to Shabra OS

## 🎯 **Welcome Contributors!**

Thank you for your interest in contributing to Shabra OS! This document outlines the engineering standards and contribution guidelines that ensure consistency, quality, and maintainability across our codebase.

**Before contributing, please read this entire document and ensure you understand our standards.**

---

## 📋 **Table of Contents**

1. [Getting Started](#getting-started)
2. [Commit Message Convention](#commit-message-convention)
3. [Branching Strategy](#branching-strategy)
4. [Component Design Philosophy](#component-design-philosophy)
5. [Naming Conventions](#naming-conventions)
6. [Code Style & Linting](#code-style--linting)
7. [Development Workflow](#development-workflow)
8. [Quality Assurance](#quality-assurance)
9. [Documentation Requirements](#documentation-requirements)

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+ and npm/yarn
- Git with proper configuration
- VS Code (recommended) or your preferred editor
- Understanding of Next.js, React, and TypeScript

### **Setup Steps**

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/shabra-os.git`
3. Install dependencies: `npm install`
4. Set up pre-commit hooks: `npm run prepare`
5. Create a new branch for your work

---

## 📝 **Commit Message Convention**

We follow the **Conventional Commits** specification for clear, standardized commit messages.

### **Format**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **Types**

- **`feat:`** - New feature for the user
- **`fix:`** - Bug fix for the user
- **`docs:`** - Documentation only changes
- **`style:`** - Changes that do not affect the meaning of the code
- **`refactor:`** - Code change that neither fixes a bug nor adds a feature
- **`perf:`** - Code change that improves performance
- **`test:`** - Adding missing tests or correcting existing tests
- **`chore:`** - Changes to the build process or auxiliary tools

### **Examples**

```bash
feat(auth): add OAuth2 authentication flow
fix(ui): resolve button alignment in mobile view
docs(api): update endpoint documentation
refactor(components): extract common button logic
perf(database): optimize user query performance
test(utils): add unit tests for date formatting
chore(deps): update dependencies to latest versions
```

### **Rules**

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- No period at the end
- Reference issues when applicable: `fixes #123`

---

## 🌿 **Branching Strategy**

We follow a **GitFlow-inspired** branching strategy optimized for our development workflow.

### **Main Branches**

- **`main`** - Production-ready code (protected)
- **`develop`** - Integration branch for features (protected)

### **Supporting Branches**

- **`feature/`** - New features and enhancements
- **`bugfix/`** - Bug fixes and patches
- **`hotfix/`** - Critical production fixes
- **`release/`** - Release preparation

### **Branch Naming Convention**

```
feature/user-authentication
bugfix/login-form-validation
hotfix/critical-security-patch
release/v2.1.0
```

### **Branch Lifecycle**

1. **Create** branch from `develop` (or `main` for hotfixes)
2. **Develop** your changes with regular commits
3. **Test** thoroughly before merging
4. **Create** pull request to `develop`
5. **Review** and address feedback
6. **Merge** after approval
7. **Delete** feature branch after merge

---

## 🧩 **Component Design Philosophy**

### **Core Principles**

- **Single Responsibility** - Each component has one clear purpose
- **Composition over Inheritance** - Prefer composition patterns
- **Props Down, Events Up** - Unidirectional data flow
- **Controlled Components** - External state management when possible

### **Component Types**

1. **Atomic Components** - Basic building blocks (Button, Input, Card)
2. **Molecular Components** - Combinations of atoms (SearchBar, UserCard)
3. **Organism Components** - Complex UI sections (Header, Sidebar, ContentArea)
4. **Template Components** - Page layouts and structures
5. **Page Components** - Route-specific components

### **State Management Rules**

- **Local State** - Use `useState` for component-specific state
- **Shared State** - Use React Context for component tree state
- **Global State** - Use Zustand or similar for app-wide state
- **Server State** - Use TanStack Query for API data
- **Form State** - Use React Hook Form for complex forms

### **Component Structure**

```typescript
// 1. Imports
import React from 'react';
import { ComponentProps } from './types';

// 2. Types/Interfaces
interface ComponentProps {
  // Props definition
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Event handlers
  const handleClick = () => {};

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 7. Export
export default Component;
```

---

## 🏷️ **Naming Conventions**

### **Files & Directories**

- **Components:** `PascalCase` (e.g., `UserProfile.tsx`)
- **Hooks:** `camelCase` with `use` prefix (e.g., `useAuth.ts`)
- **Utilities:** `camelCase` (e.g., `formatDate.ts`)
- **Types:** `PascalCase` (e.g., `UserTypes.ts`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_ENDPOINTS.ts`)

### **Code Elements**

- **Components:** `PascalCase` (e.g., `UserProfile`)
- **Functions:** `camelCase` (e.g., `getUserData`)
- **Variables:** `camelCase` (e.g., `userProfile`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)
- **Interfaces:** `PascalCase` with `I` prefix (e.g., `IUserProfile`)
- **Types:** `PascalCase` (e.g., `UserProfileType`)

### **Examples**

```typescript
// ✅ Good
const UserProfile: React.FC<IUserProfileProps> = ({ userId }) => {
  const [userData, setUserData] = useState<IUserData | null>(null);
  const { getUserProfile } = useUserProfile();

  return <div>{/* JSX */}</div>;
};

// ❌ Bad
const user_profile: React.FC<user_profile_props> = ({ user_id }) => {
  const [user_data, set_user_data] = useState<user_data_type | null>(null);
  const { get_user_profile } = use_user_profile();

  return <div>{/* JSX */}</div>;
};
```

---

## 🎨 **Code Style & Linting**

### **Tools**

- **Prettier** - Code formatting
- **ESLint** - Code quality and consistency
- **TypeScript** - Type safety and IntelliSense

### **Running Linting & Formatting**

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check TypeScript types
npm run type-check

# Run all checks
npm run check
```

### **Pre-commit Hooks**

We use Husky to run checks before commits:

- Linting
- Type checking
- Formatting
- Test execution

### **Editor Configuration**

Create `.vscode/settings.json` in your workspace:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 🔄 **Development Workflow**

### **1. Planning**

- Review existing issues and documentation
- Understand the problem and requirements
- Plan your approach and implementation

### **2. Development**

- Create feature branch from `develop`
- Implement changes following our standards
- Write/update tests for new functionality
- Update documentation as needed

### **3. Testing**

- Run existing tests: `npm test`
- Add new tests for your changes
- Test in different browsers/environments
- Verify accessibility and performance

### **4. Review**

- Self-review your changes
- Ensure all checks pass
- Update documentation and tests
- Create comprehensive pull request

### **5. Collaboration**

- Respond to review feedback promptly
- Make requested changes
- Keep discussions focused and constructive
- Help review other contributions

---

## ✅ **Quality Assurance**

### **Code Review Checklist**

- [ ] Code follows our style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log or debug code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

### **Testing Requirements**

- **Unit Tests** - Required for utilities and hooks
- **Component Tests** - Required for complex components
- **Integration Tests** - Required for critical user flows
- **E2E Tests** - Required for core functionality

### **Performance Standards**

- **Bundle Size** - Monitor and optimize
- **Lighthouse Score** - Maintain 90+ in all categories
- **Core Web Vitals** - Meet Google's standards
- **Accessibility** - WCAG 2.1 AA compliance

---

## 📚 **Documentation Requirements**

### **Code Documentation**

- **JSDoc** comments for public APIs
- **Inline comments** for complex logic
- **README updates** for new features
- **Type definitions** for all interfaces

### **Component Documentation**

- **Props interface** with descriptions
- **Usage examples** and code snippets
- **Accessibility considerations**
- **Performance notes**

### **Example**

````typescript
/**
 * User profile component that displays user information
 * and allows editing of profile data.
 *
 * @param props - Component props
 * @param props.userId - Unique identifier for the user
 * @param props.onEdit - Callback when edit mode is activated
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <UserProfile
 *   userId="123"
 *   onEdit={() => setEditMode(true)}
 *   className="custom-profile"
 * />
 * ```
 */
export const UserProfile: React.FC<IUserProfileProps> = ({
  userId,
  onEdit,
  className,
}) => {
  // Implementation
};
````

---

## 🚫 **What Not to Do**

- **Don't** commit directly to `main` or `develop`
- **Don't** skip code reviews or testing
- **Don't** ignore linting errors or warnings
- **Don't** commit large files or dependencies
- **Don't** use deprecated APIs or patterns
- **Don't** ignore accessibility requirements
- **Don't** skip documentation updates

---

## 🤝 **Getting Help**

### **Resources**

- **Documentation:** Check `/docs` directory first
- **Issues:** Search existing issues before creating new ones
- **Discussions:** Use GitHub Discussions for questions
- **Code Review:** Ask for help during review process

### **Communication**

- Be respectful and constructive
- Provide context for your questions
- Use clear, descriptive language
- Follow up on resolved issues

---

## 📈 **Recognition**

We value all contributions! Contributors will be:

- Listed in our contributors file
- Recognized in release notes
- Invited to participate in project decisions
- Given access to additional project areas

---

## 📄 **License**

By contributing to Shabra OS, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Shabra OS! Together, we're building something amazing.** 🚀

---

_This contributing guide is part of the Shabra OS Documentation Hub and follows our Documentation-First Protocol._
