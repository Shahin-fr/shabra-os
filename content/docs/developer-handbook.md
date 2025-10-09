---
title: "Developer Handbook"
date: "2025-10-09"
description: "Pragmatic guide for contributing to Shabra OS"
author: "Shabra Team"
tags: ["engineering", "guide"]
---

# Developer Handbook (Pragmatic)

A short guide to be productive quickly. Read this, then ship.

## Daily Workflow
1. Sync main, create a small feature branch.
2. Implement the smallest slice that delivers user value.
3. Run locally: `npm run lint`, `npm run type-check`, and essential unit tests.
4. Open a PR with a focused description. Link to issue.

## Local Setup
- Copy envs from `env.example` or `env.template` to `.env.local`.
- Generate Prisma: `npm run db:generate`.
- Optional: local DB scripts: `npm run setup:local`.

## Project Conventions
- Follow the rules in `content/docs/coding-standards.md`.
- Types live in `src/types/`. Services in `src/services/`. Utilities in `src/lib/utils`.
- Route handlers are thin; business logic goes into services.
- Prefer server components; use `"use client"` only when necessary.

## Adding/Updating Docs
- Add markdown files under `content/docs/` with frontmatter.
- Title should be the first H1 or set in frontmatter.
- Run `npm run prepare-docs` to auto-insert frontmatter if missing.

## Testing (Essential Only)
- Unit test critical logic with Vitest: `npm run test:unit`.
- Keep tests small and readable. Mock minimally.

## Quality Gates
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Optional comprehensive check: `npm run quality:check`

## Security & Privacy
- Validate all inputs (Zod). Never trust client data.
- Do not log secrets. Clear debug logs before commit (`npm run verify:no-console`).

## Performance
- Measure before optimizing. Avoid premature optimization.
- Memoize only when a measurable issue exists.

## Git & PRs
- Commit messages: imperative, concise (e.g., "Fix auth token refresh").
- One logical change per PR. Keep diffs small.

## Support
- See `README.md` for scripts and architecture.
- For questions, check existing docs in `content/docs/`.


