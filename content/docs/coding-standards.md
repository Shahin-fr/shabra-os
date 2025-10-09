---
title: "Coding Standards"
date: "2025-10-09"
description: "Minimal, enforceable standards for Shabra OS"
author: "Shabra Team"
tags: ["engineering", "standards"]
---

# Coding Standards (Pragmatic & Minimal)

Keep it simple. Prefer clarity over cleverness. Follow the rules below; if a rule conflicts with readability, choose readability and add a brief comment.

## Source of Truth
- ESLint and Prettier configurations are the baseline. Run: `npm run lint` and `npm run format`.
- Type safety is non‑negotiable. Run: `npm run type-check`.

## Language & Types
- Use TypeScript everywhere (`.ts`/`.tsx`). Avoid `any`. If unavoidable, isolate it and document why.
- Prefer type aliases and interfaces with meaningful names (no abbreviations, no 1–2 letter names).
- Return early; avoid deep nesting. Extract small functions when blocks exceed ~25 lines or two levels of nesting.
- Keep functions single-purpose. Aim for ≤ 5 params; prefer an object param for many options.

## React & Next.js
- Use Server Components by default in `app/` unless client features are required. Add `"use client"` only when needed.
- Prefer Server Actions/Route Handlers for data mutations; validate inputs with Zod schemas in `src/lib/validators` when applicable.
- Components:
  - File names: `PascalCase.tsx`, hooks: `useThing.ts`.
  - Props are typed; avoid spreading unknown props.
  - Keep components pure; side effects belong in hooks.
- State: prefer local state; elevate only when shared. Use `zustand` stores in `src/stores/` for cross-cutting UI or domain state.

## Styling
- Use Tailwind utility classes; co-locate minimal component CSS when necessary.
- Prefer semantic HTML; ensure a11y basics: labels, roles, keyboard navigation.

## Imports & Modules
- Absolute imports from `src/` where configured; otherwise relative with clear paths.
- Group imports: built-ins, third-party, internal. No unused imports.
- Avoid barrel files unless they simplify usage without circular deps.

## API & Services
- Keep API route handlers thin; delegate to `src/services/*`.
- Validate inputs; never trust `req.body`/`searchParams`.
- Never expose internal errors; log server-side, return safe messages.

## Errors & Logging
- Throw `Error` (or domain errors) and handle at boundaries. No silent catch.
- `console.log` is allowed in local dev but must be removed or gated for CI (`npm run verify:no-console`).

## Tests (Essential Only)
- Unit test critical logic and reusable utilities. Prefer Vitest.
- For UI, test critical interactions and accessibility.

## Performance & Security (Baseline)
- Avoid unnecessary re-renders; memoize only when needed.
- Sanitize and validate all input; use `isomorphic-dompurify` where rendering HTML.
- Use parameterized queries via Prisma only; never build raw SQL strings.

## Git & PRs
- Small, focused PRs. Imperative commit messages: "Add", "Fix", "Refactor".
- Ensure `lint`, `type-check`, and unit tests pass locally.

## When in Doubt
- Prefer the simplest solution that works (YAGNI). Extract only when duplication hurts.


