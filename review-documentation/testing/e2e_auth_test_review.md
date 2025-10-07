### E2E Auth Test Review

**Scope of review**: `src/e2e/auth.e2e.spec.ts` and shared helpers in `src/e2e/test-utils.ts`.

---

## Test Coverage & Scenarios

- **Happy path (valid login)**: Covered. The test fills valid credentials and expects redirect to `/`, then checks absence of login copy. Good baseline.
- **Form presence and layout**: Covered. Verifies key labels and submit button are visible; includes Persian copy checks.
- **Client-side validation**:
  - Empty submission required-attribute checks: Covered.
  - Invalid email format with HTML5 `type=email`: Covered.
- **Invalid credentials**: Covered with error message assertion and URL unchanged.
- **Loading state**: Covered (button disabled, loading text).
- **Accessibility basics**: Covered (labels, types, required, keyboard tab order).
- **Network failure**: Covered via route abort; asserts friendly error and remains on `/login`.
- **Logout flow**: Partially covered. Logs in, then navigates to `/login` and verifies form. Does not assert an actual logout action/session invalidation.
- **Unauthorized redirects**: Covered for multiple protected routes (expects redirect to `/login`).

**Missing or weak scenarios**:

- **Wrong password vs unknown email**: Only one generic invalid-credentials path; does not distinguish responses, rate limits, or error codes.
- **Account states**: No tests for locked/disabled user, unverified email, password expired, MFA required, or passwordless flows.
- **Security events**: No coverage for rate limiting, captcha prompts after failures, CSRF defenses, or session fixation.
- **Remember me / session persistence**: No cookie longevity, `Remember me` checkbox, or cross-tab persistence checks.
- **Redirect after login**: No `next` query param handling (e.g., `?next=/projects`).
- **Logout correctness**: No explicit click on a real logout control; no verification that session cookies/tokens are cleared and protected routes re-redirect after logout.
- **Accessibility depth**: Does not check `aria-invalid`, `aria-live` for error messaging, or focus management on errors.
- **i18n**: Selectors rely on localized text; no `data-testid` fallbacks.

---

## Test Quality & Robustness

- **Structure (Arrange-Act-Assert)**: Generally clear per test; uses `beforeEach` to navigate to `/login` which keeps Arrange concise.
- **Selectors**: Heavily uses `getByLabel` and `getByRole`, which is good; however, many assertions depend on exact Persian text strings via `getByText`. This is brittle across copy changes. Prefer `data-testid`.
- **Helpers**: A separate `test-utils.ts` exists with `loginUser`, `logoutUser`, and utilities. The auth spec does not reuse them consistently (duplicates login steps). Centralizing would improve maintainability.
- **Network mocking**: Uses `page.route` inline for a single failure case. Helpers exist (`mockApiFailure`) but aren’t used. Prefer shared helpers for consistency.
- **State leakage**: Tests start at `/login`; no explicit storage cleanup between tests. Consider `storageState` isolation or explicit `context.clearCookies()` if your auth uses cookies.

---

## Efficiency & Best Practices

- **Independence**: Most tests are independent and start on `/login`; good. The logout test currently depends on a prior login step it performs itself, which is fine.
- **Waits**: Uses Playwright auto-waits and `toHaveURL`. No hard `waitForTimeout`. Good. A few additional waits (e.g., `networkidle`) exist in helpers but are not used here.
- **Cleanup**: No explicit cleanup (e.g., clearing local storage/cookies) after login/logout flows. If the app sets persistent cookies, ensure subsequent tests aren’t affected.
- **Parallelization**: The suite should run fine in parallel provided isolated users or ephemeral data. Only one test mutates auth state; be mindful of shared accounts.

---

## Readability

- **User flow clarity**: Each test describes its intent in the title; comments are minimal but sufficient. The overall user journey (login → dashboard, error handling) is clear.
- **Duplication**: Repeated field interactions could be refactored to reuse `loginUser()` for the happy path and a small helper for invalid login attempts.
- **Internationalization**: Assertions rely on concrete Persian copy strings. For clearer intent and resilience, prefer `data-testid` and assert the presence of elements/states rather than localized copy when possible.

---

## Actionable Recommendations

1. **Harden selectors**: Introduce `data-testid` for critical elements: email input, password input, submit button, loading indicator, error alert, and logout button. Replace `getByText` with role + test id.
2. **Use shared helpers**: Replace inline login steps with `loginUser`; add a `attemptLogin(email, password)` helper to consolidate invalid credential attempts. Use `mockApiFailure` for network error tests.
3. **Expand negative coverage**:
   - Wrong password vs unknown email responses (if distinct), include rate-limit behavior after repeated failures.
   - Locked/disabled user and unverified email flows.
   - Redirect with `next` param and ensure post-login navigation honors it.
   - MFA-required flow (OTP step) if supported; otherwise document as out of scope.
4. **Verify logout correctness**: Click a real logout control, assert 204/302 on API call, and ensure protected routes redirect after logout; verify session cookie cleared.
5. **Accessibility enhancements**: Assert `aria-live` regions update for error messages, fields gain `aria-invalid` on validation error, and focus moves to the first invalid field or error summary.
6. **Test isolation**: Clear cookies/storage in `beforeEach` or use per-test `storageState` where appropriate to avoid state bleed between tests.
7. **Performance and flake reduction**: Prefer role + `data-testid` selectors; avoid text-based selectors for localized content. Where necessary, wrap transitions with `expect(...).toBeVisible()` rather than manual sleeps.

---

## Quick Wins Checklist

- [ ] Add `data-testid` to auth form inputs, submit button, loading indicator, error alert, and logout button.
- [ ] Replace `getByText(/.../)` with robust selectors.
- [ ] Refactor to use `loginUser` and add `attemptLogin` helper.
- [ ] Implement logout interaction and post-logout protected route checks.
- [ ] Add tests for `?next=` redirect handling and wrong-password scenario.
- [ ] Add `aria-invalid` and `aria-live` assertions for validation and error messages.

---

## Overall Assessment

**Verdict**: Solid baseline coverage of the happy path and several key error/UX states (empty form, invalid email, invalid creds, loading, network failure, basic accessibility, unauthorized redirects). To achieve robust, production-grade auth E2E coverage, prioritize selector hardening with `data-testid`, explicit logout verification, and expanded negative-path and account-state scenarios.


