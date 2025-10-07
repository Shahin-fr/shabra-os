### Shabra OS Code & API Conventions

These conventions align with this repo's stack: Next.js 15, React 19, TypeScript 5, Prisma, Playwright/Vitest, ESLint (flat config) and Prettier.

---

## Code Style

- **Formatting**: Prettier is the source of truth.
  - semi: true
  - singleQuote: true (and `jsxSingleQuote: true`)
  - trailingComma: es5
  - printWidth: 80
  - tabWidth: 2, useTabs: false
  - bracketSpacing: true, bracketSameLine: false
  - arrowParens: avoid
  - endOfLine: lf

- **Imports**:
  - Prefer path aliases defined in `tsconfig.json` like `@/components/...`.
  - Group order: Node built-ins → external deps → alias paths → relative `../` → same-folder `./`.
  - No default-export unless it simplifies usage; prefer named exports for tree-shaking and clarity.

- **Components**:
  - React Server Components by default in `src/app`; use "use client" only when required.
  - Keep components pure; push side effects to hooks or actions.
  - Keep files small and focused; extract subcomponents when JSX exceeds ~150 lines.

- **CSS/Tailwind**:
  - Prefer Tailwind utility classes with `clsx`/`tailwind-merge` for conditional styles.
  - Co-locate style concerns with components; avoid global CSS except for design tokens and resets.

---

## Naming Conventions

- **Files/Directories**:
  - TypeScript/React components: PascalCase.tsx (e.g., `UserCard.tsx`).
  - Non-component modules: camelCase.ts (e.g., `formatDate.ts`).
  - Server actions/route handlers: kebab-case segments under `app/` (Next.js routing).

- **Variables**: `camelCase`.
  - Booleans start with `is`, `has`, `can`, `should` (e.g., `isLoading`).
  - Collections pluralized (e.g., `users`), maps use `by`/`To` (e.g., `userIdToUser`).

- **Functions**: verbs or verb phrases (e.g., `fetchUserProfile`).

- **Classes/Types/Interfaces/Enums**: PascalCase.
  - Types that brand data with IO-bound validation end with `Dto` for payloads or `Entity` for persisted shapes.
  - Zod schemas end with `Schema` (e.g., `userCreateSchema`).

- **Constants**: UPPER_SNAKE_CASE only for module-level constants; otherwise camelCase.

---

## API Design

- **Transport**: Next.js Route Handlers in `src/app/api/**/route.ts`.
  - Use zod for request validation at the edge of each handler.
  - Request body must be `application/json`; reject others unless explicitly supported.

- **Request/Response**:
  - Request shape: `{ data: T, meta?: Record<string, unknown> }` for mutating endpoints.
  - Response success: `{ ok: true, data: T, meta?: { pagination?|cursor? } }`.
  - Response error: `{ ok: false, error: { code: string, message: string, details?: unknown } }`.
  - Always set appropriate status codes (2xx/4xx/5xx). Do not encode failures as 200.

- **Pagination**:
  - Cursor-based preferred: `?cursor=...&limit=...`; include `nextCursor` when available.

- **Idempotency**:
  - Make PUT/DELETE idempotent. For POSTs that can be retried, support an idempotency key header.

- **Versioning**:
  - Use route version segment when breaking changes are required: `/api/v1/...` → `/api/v2/...`.

- **Auth**:
  - Use NextAuth sessions or server-side token validation in route handlers.
  - Reject unauthenticated requests early with 401; unauthorized with 403. Avoid leaking existence of resources.

---

## Error Handling

- **At boundaries** (route handlers, server actions):
  - Validate inputs with zod and return structured error responses.
  - Catch known operational errors (validation, not found, conflict) and map to 4xx codes with machine-readable `error.code`.
  - Log unexpected errors once on the server with contextual fields; return 500 with a generic message.

- **In React**:
  - Use error boundaries for client components; prefer `notFound()`/`redirect()` for RSC control flow.
  - Avoid try/catch inside render paths; handle promises at data layer.

- **Prisma/DB**:
  - Narrowly catch Prisma known request errors and convert to `{ ok: false, error: ... }` with proper HTTP codes.
  - Never expose internal SQL/prisma messages in client responses.

---

## Asynchronous Programming

- **Promises**:
  - Always await or explicitly handle; never leave floating promises.
  - Use Promise.all for independent work; avoid over-parallelization that stresses DB/IO.
  - Prefer AbortController for cancelable fetches and pass `signal` downstream.

- **React 19**:
  - Use `use` in client components cautiously; prefer server data fetching in RSC.
  - Use `useTransition` for non-blocking UI updates and `useOptimistic` for optimistic mutations.

- **Server Actions**:
  - Validate inputs with zod; return typed results `{ ok, data|error }`.
  - Wrap side effects; do not mutate global state; ensure idempotency where meaningful.

- **Concurrency**:
  - Guard with database constraints/transactions instead of in-memory locks where correctness matters.

---

## Testing & Quality

- **Linting**: Run `npm run lint` (ESLint flat config). Type-check with `npm run type-check`.
- **Formatting**: Run `npm run format`/`format:check`.
- **Tests**: Unit with Vitest; E2E with Playwright. Prefer test IDs via `data-testid`.

---

## Documentation

- Exported functions and complex modules should include concise JSDoc focusing on invariants, edge cases, and performance/security implications.
