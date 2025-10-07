### Linter & Formatter Review (ESLint + Prettier)

Date: 2025-10-07

Repository stack context: Next.js 15, React 19, TypeScript 5, Prisma, Vitest/Playwright, ESLint (flat), Prettier 3.

---

## Current State (as discovered)

- ESLint (flat config): `eslint.config.mjs` exists and is used via `npm run lint` (eslint . --config eslint.config.mjs).
- Legacy ESLint config also present: `.eslintrc.json` (extends `next/core-web-vitals`). This can conflict with tooling/IDEs even if CLI points to the flat config.
- Prettier: `.prettierrc` present with standard settings (semi, singleQuote, printWidth 80, LF, etc.).
- Husky: `pre-commit` runs `npm run lint` on the entire repo; no `lint-staged` integration; no Prettier check/format in hook.
- Packages installed include: `eslint` v9, `@typescript-eslint/*` v8, `eslint-config-next`, `eslint-plugin-prettier`, `eslint-config-prettier`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-import`.

Notable aspects in `eslint.config.mjs`:
- TypeScript block sets `project: './tsconfig.json'` (type-aware linting) and defines very large `globals` for both browser and node contexts; many rules are disabled for "allow build".
- `prettier/prettier` is disabled for TS files but set to `error` for JS files (inconsistent).
- `import` rules (`import/order`, `import/no-unresolved`) are turned off; resolver set for TypeScript.
- `@typescript-eslint/no-explicit-any` only `warn`; a number of quality rules are off (`no-var`, `object-shorthand`, `prefer-template`, etc.).
- `ignores` is very broad (skips many directories and file types, including all `scripts/**/*.js`).

---

## Findings

### 1) Rule Completeness (ESLint)

- Missing Next.js plugin integration in the flat config
  - You have `eslint-config-next` and `@next/eslint-plugin-next` installed, but the flat config does not include their recommended rules.
  - Recommendation: Import Next.js rules into the flat config for `src/app/**` and general React/Next patterns (e.g., `...next.configs['core-web-vitals']`).

- TypeScript recommended rule sets
  - The config hand-picks a few `@typescript-eslint` rules. Modern best practice is to base on `typescript-eslint` official flat configs (e.g., `recommended`, `recommendedTypeChecked`) and then add project-specific overrides.
  - Recommendation: Use `typescript.configs.recommendedTypeChecked` (scoped to `src/**/*.{ts,tsx}` with `project`) and `typescript.configs.stylisticTypeChecked` as needed.

- Import hygiene
  - `import/order` and `import/no-unresolved` are disabled. Given path aliases and the resolver are configured, these should be enabled to maintain consistency and catch path issues.
  - Recommendation: Enable `import/order` with clear groups and `pathGroups` for `@/` aliases; consider enabling `import/no-unresolved` with the TS resolver.

- Accessibility
  - `eslint-plugin-jsx-a11y` is present with a targeted rule (`anchor-is-valid`). Consider adopting the plugin’s recommended config to cover a broader a11y surface.

- Prisma awareness
  - No Prisma-specific ESLint plugin is configured. Consider `@prisma/eslint-plugin` for schema awareness in TS where useful (optional but helpful in larger teams).

- Testing rules (optional)
  - Given Vitest and Testing Library are used, consider `eslint-plugin-testing-library` and `eslint-plugin-jest-dom` for UI tests. Scope to test files only to avoid noise.

### 2) Integration & Consistency (ESLint ↔ Prettier)

- Inconsistent `prettier/prettier` usage
  - It’s turned off for TS but `error` for JS, which creates unequal enforcement. In Prettier 3 era, recommended pattern is: run Prettier separately and let `eslint-config-prettier` disable stylistic ESLint rules to avoid conflicts. The `eslint-plugin-prettier` approach can be slower and noisy.
  - Recommendation: Remove `eslint-plugin-prettier` from the flat config and rely on `eslint-config-prettier`. Enforce formatting via Prettier CLI (and `lint-staged`), not via ESLint.

- Dual ESLint config files
  - `.eslintrc.json` coexists with `eslint.config.mjs`. IDEs may pick the legacy config depending on settings, causing rule mismatch.
  - Recommendation: Remove `.eslintrc.json` and consolidate exclusively on the flat config. If removal isn’t feasible immediately, set IDE to use the flat config explicitly and add a note in README.

- Husky enforcement
  - Hook runs `npm run lint` on the entire repo only; no staged-only filtering or Prettier formatting/checks.
  - Recommendation: Add `lint-staged` to run ESLint with `--cache` on staged files and Prettier `--check` (or `--write`). This makes the hook fast and consistent.

### 3) Performance

- Linting entire repo on each commit
  - `pre-commit` runs full lint; this will be slow as the codebase grows.
  - Recommendation: Use `lint-staged` and `eslint --cache --cache-location .eslintcache` for changed files only.

- Type-aware linting across all TS files
  - Using `project: './tsconfig.json'` across the entire TS codebase enables powerful checks but can be slow. Prefer scoping type-aware configs to source code and relaxing for tests/config/scripts.
  - Recommendation: Use `recommendedTypeChecked` for `src/**/*.{ts,tsx}` and a non-type-checked config for tests/scripts (already partially done), which you have, but consider removing heavy custom `globals` and instead rely on `env: { browser: true, node: true }` where applicable to speed up resolution and reduce maintenance.

- Excessive `globals` entries
  - Large static `globals` blocks are hard to maintain and provide negligible benefits over using `env`.
  - Recommendation: Replace those with `languageOptions: { globals: { ...globals.browser } }` or `env: { browser: true }` patterns via `@eslint/compat` helpers or import from `globals` package.

### 4) Best Practices

- Flat config exclusively
  - Standardize on the flat config and delete the legacy `.eslintrc.json`. Ensure CI and IDE align.

- Prefer config presets over ad-hoc rules
  - Base on official recommended configs for JS, TS, React, Next, a11y, and then add surgical overrides. This reduces drift and improves maintainability.

- Avoid `eslint-plugin-prettier`
  - Prefer `eslint-config-prettier` and run Prettier separately via scripts/hooks. This is the current recommendation for Prettier 3.

- Tighten important rules progressively
  - Consider upgrading `@typescript-eslint/no-explicit-any` to `warn`→`error` in critical packages or introduce an ESLint comment-based allowlist pattern.
  - Re-enable `no-var`, `object-shorthand`, `prefer-template`, etc., to align with modern code style unless there’s a migration blocker.

---

## Suggested Changes (actionable)

1) Remove legacy ESLint config
   - Delete `.eslintrc.json` to avoid confusion.

2) Update `eslint.config.mjs` to integrate presets and simplify
   - Add Next.js flat config and TS recommended configs, enable `import/order`, and remove massive `globals` in favor of `env`.
   - Example sketch (flat config fragments):

```js
// imports
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import next from '@next/eslint-plugin-next';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  // Next.js recommended
  next.configs['core-web-vitals'],
  // TS type-aware for src
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: { '@typescript-eslint': tseslint, import: importPlugin, react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      'import/order': ['warn', { 'newlines-between': 'always' }],
      // keep additional rules minimal; rely on presets
    },
  },
  // JS/TS non-type-checked for config/scripts/tests
  { files: ['**/*.{js,jsx}', '**/*.config.{js,ts,mjs}', 'scripts/**/*.{js,ts}'], rules: { /* lighter rules */ } },
  // Global ignores and envs
  { ignores: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**'] },
];
```

3) Drop `eslint-plugin-prettier` from the runtime config
   - Ensure `eslint-config-prettier` is effective by placing it last where needed or rely on presets that already avoid stylistic conflicts.
   - Keep Prettier as a separate formatter through scripts and hooks.

4) Improve pre-commit performance and consistency
   - Add `lint-staged` and change Husky hook to lint/format staged files only.
   - Example `package.json` additions:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --cache --cache-location .eslintcache --fix",
      "prettier --write"
    ],
    "*.{json,css,md,mdx}": ["prettier --write"]
  }
}
```

And update `.husky/pre-commit`:

```sh
npx --yes lint-staged
```

5) Enable key rules gradually
   - Turn on `no-var`, `object-shorthand`, `prefer-template`, `import/order` (warn), and consider `@typescript-eslint/no-explicit-any` as `warn` with targeted `// eslint-disable-next-line` in legacy areas.

6) Optional: Prisma and testing plugins
   - Consider `@prisma/eslint-plugin` scoped to files using Prisma.
   - Consider `eslint-plugin-testing-library` and `eslint-plugin-jest-dom` scoped to `**/*.{test,spec}.{ts,tsx}`.

---

## Potential Conflicts & Resolutions

- Prettier vs ESLint formatting
  - Resolution: Remove `eslint-plugin-prettier` from the ESLint runtime and rely on `eslint-config-prettier` + Prettier CLI. This removes format rule conflicts and improves speed.

- IDE using legacy config
  - Resolution: Delete `.eslintrc.json` and ensure workspace settings point to the flat config.

---

## CI and Scripts

- Scripts already available:
  - `lint`, `lint:fix`, `format`, `format:check` are present. Consider adding `"lint:ci": "eslint . --config eslint.config.mjs --max-warnings=0"`.
- Add ESLint cache for local runs: `eslint . --config eslint.config.mjs --cache --cache-location .eslintcache`.
- Add `prettier` to the pre-commit via `lint-staged` to keep the repo consistently formatted.

---

## Conclusion

Overall, the project is close to a solid setup: flat ESLint config and Prettier 3 are in place. The main gaps are consistency (dual configs; mixed `prettier/prettier` enforcement), completeness (Next.js/TS recommended presets; import hygiene), and performance (hook runs full repo). Implementing the suggestions above will improve developer experience, reduce noise, and align with modern best practices for Next.js + TypeScript + Prettier 3.


