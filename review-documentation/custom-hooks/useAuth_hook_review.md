### useAuth Hook Audit (src/hooks/useAuth.ts)

This audit evaluates the client-side authentication hook against the Shabra OS conventions, focusing on logic/correctness, API design/usability, performance/effects, and error handling. Where relevant, code references are included.

---

#### Scope and Expected API
- Expected return: `{ user, isLoading, login, logout }` with clear handling of loading/authenticated/unauthenticated states.
- The hook integrates NextAuth (`useSession`, `signIn`, `signOut`) and a Zustand-based user store (`useSetUser`, `useLogout`, `useSetUserLoading`, `useIsLoading`).

---

#### Logic & Correctness
- Session/state sync and loading control
  - The hook tracks NextAuth status, synchronizes to the store, and uses a timeout to break potential infinite loading loops.
  - Key flow:
```57:81:src/hooks/useAuth.ts
// Sync NextAuth session with Zustand store
useEffect(() => {
  // Clear existing timeout
  if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
  if (status === 'loading') {
    setUserLoading(true);
    const timeout = setTimeout(() => {
      setUserLoading(false);
      setForceLoading(true);
      loadingTimeoutRef.current = null;
    }, 3000);
    loadingTimeoutRef.current = timeout;
    return;
  }
  if (status === 'authenticated' && session?.user) {
    // transform and set user; loading false
  } else if (status === 'unauthenticated') {
    logoutFromStore();
    setUserLoading(false);
  } else {
    setUserLoading(false);
  }
}, [session, status, setUser, logoutFromStore, setUserLoading]);
```
- Authenticated state mapping
  - The hook transforms `session.user` into an internal `AuthUser`, setting default preferences and roles fallback.
```91:119:src/hooks/useAuth.ts
// Transform NextAuth session to our User format
const sessionRoles = (session.user as any).roles;
const userRoles = Array.isArray(sessionRoles) ? sessionRoles : [sessionRoles || 'EMPLOYEE'];
const user: AuthUser = { id: session.user.id || '', email: session.user.email || '', name: session.user.name || '', roles: userRoles, avatar: (session.user as any).avatar, preferences: { /* defaults */ } };
setUser(user);
setUserLoading(false);
setForceLoading(false);
```
- Unauthenticated state clearing
```129:135:src/hooks/useAuth.ts
logoutFromStore();
setUserLoading(false);
setForceLoading(false);
```
- Loading computation
```211:228:src/hooks/useAuth.ts
const isLoading = forceLoading ? false : status === 'loading' || storeLoading;
return { user: session?.user, isAuthenticated: status === 'authenticated', isLoading, login, logout, status };
```
- Findings
  - Correctly handles loading/authenticated/unauthenticated. The 3s timeout prevents hanging but may prematurely flip for slow networks; consider configurability.
  - Returns `session?.user`, which may not match `AuthUser` shape; consumers expecting the transformed user may be confused. Prefer returning the store user or a normalized shape.
  - `isAuthenticated` is derived solely from NextAuth status; consistent with NextAuth but ensure store stays the single source of truth if other parts rely on it.

---

#### API Design & Usability
- Current return signature: `{ user: session?.user, isAuthenticated, isLoading, login, logout, status }`.
- Clarity
  - Returning `session?.user` (NextAuth user) while also transforming a richer `AuthUser` for the store creates dual shapes.
  - Recommendation: expose a stable, app-level `user` shape (preferably the transformed store `AuthUser`) and optionally `rawSessionUser` if needed.
  - Expose error states in return for better UX: `{ error, lastAction }` or similar, per conventions.
- Naming/shape
  - Align with conventions: clear booleans (`isAuthenticated`, `isLoading`), avoid leaking status unless needed; if included, document.

---

#### Performance & Effects
- Effects and cleanup
  - Properly clears timeout on effect re-run and unmount.
```61:66:src/hooks/useAuth.ts
if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); loadingTimeoutRef.current = null; }
```
```143:150:src/hooks/useAuth.ts
useEffect(() => () => { if (loadingTimeoutRef.current) { clearTimeout(loadingTimeoutRef.current); } }, []);
```
- Dependency arrays
  - Main sync effect depends on `session, status, setUser, logoutFromStore, setUserLoading` which are stable setters/selectors; acceptable. Ensure store hooks return stable references to avoid unnecessary triggers.
- Memoization
  - `login` and `logout` are recreated on each render; consider `useCallback` to keep stable references for consumers (especially if passed to child components), though practical impact may be minor.
- Logging
  - Extensive logging in render path can be chatty; consider gating by environment or a debug flag to avoid performance noise in production.

---

#### Error Handling
- Login path handles provider errors and exceptions, returning structured results.
```152:203:src/hooks/useAuth.ts
const result = await signIn('credentials', { email, password, redirect: false });
if (result?.error) { setUserLoading(false); return { success: false, error: result.error }; }
if (result?.ok) { return { success: true }; }
catch (error) { setUserLoading(false); return { success: false, error: 'Network error occurred' }; }
```
- Logout path does not expose errors; `signOut` is awaited without try/catch. Consider wrapping and surfacing failure state to the caller.
- The hook does not expose an `error` field to consumers; adding `authError` and `clearError` improves usability.
- Follow conventions: map operational errors to `{ ok: false, error: { code, message } }`-style structures at the boundary.

---

#### Conventions Alignment (selected)
- Components/Hooks: Keep side effects in hooks (met). Avoid try/catch in render (met). Prefer explicit error exposure (could be improved).
- Async handling: No floating promises; uses awaits and cleanup (met). Consider `AbortController` if adding fetches in the future.
- API shape: Prefer typed results; current `login` returns `{ success, error? }` inline. Consider a typed result with `{ ok: boolean, error?: { code, message } }`.

---

#### Risks & Edge Cases
- Fixed 3s timeout may mark `isLoading` false while NextAuth is still resolving under poor network conditions, yielding a transient unauthenticated UI. Make timeout configurable or derive from a retry/backoff strategy.
- Role derivation falls back to `EMPLOYEE` when absent. Ensure this default matches authorization policy.
- Returning `session?.user` may exclude transformed preferences/roles nuance. This can cause inconsistent UI behavior across consumers.

---

#### Recommendations
- Normalize return shape and expose store user
  - Return `{ user: storeUser, isAuthenticated, isLoading, login, logout }`, and optionally `{ status, rawSessionUser }`.
- Add error exposure
  - Track `authError` in state; set on failed login/logout; return `{ authError, clearAuthError }`.
- Consider `useCallback`
  - Wrap `login`/`logout` with `useCallback` for referential stability; memoize derived booleans if needed.
- Make loading timeout configurable
  - Accept an optional `options` argument `{ loadingTimeoutMs = 3000 }` and document behavior.
- Gate logs in production
  - Suppress or reduce log volume in production to align with performance best practices.
- Type safety
  - Avoid `(session.user as any)`; define a `SessionUser` interface and narrow types before transform.

---

#### Quick API Proposal (non-breaking enhancement)
```
type UseAuthOptions = { loadingTimeoutMs?: number };
type AuthResult = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  authError?: string | null;
  clearAuthError?: () => void;
  status?: 'loading' | 'authenticated' | 'unauthenticated';
};
```

---

#### Overall Assessment
- The hook is functionally correct and integrates well with NextAuth and the store. Main improvement areas are API consistency (returning normalized user), better consumer-facing error exposure, configurability of the loading timeout, and minor performance polish via memoization and log gating.


