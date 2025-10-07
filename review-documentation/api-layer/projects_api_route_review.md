### Projects API Route Audit — `src/app/api/projects/route.ts`

This audit reviews the `GET`, `POST`, and `DELETE` handlers in `src/app/api/projects/route.ts` against repository conventions in `.cursor/rules/shabra-os-conventions.md`.

## Security & Bug Analysis

- **Rate limiting missing on DELETE**
  - Lines: 94–107
  - The `DELETE` handler does not apply `withApiRateLimit` (present in `GET` at 16–19 and `POST` at 49–52). This exposes the endpoint to brute force/abuse.
  - Recommendation: Add the same rate-limiting guard to `DELETE` at the start of the handler.

- **Query param validation missing for `DELETE` id**
  - Lines: 108–114
  - `projectId` is read from the query string and validated only with a generic presence check. No Zod schema is used to ensure format (e.g., UUID) or constraints.
  - Recommendation: Introduce a Zod schema for delete queries (e.g., `DeleteProjectQuerySchema`) and validate with `validateQuery(...)`. Return a structured 400 error on validation failure.

- **Generic error thrown on missing id → likely 500 instead of 400**
  - Lines: 111–113, 132–137
  - Throwing `new Error('Project ID is required')` will be caught by `handleApiError`. Unless `handleApiError` maps this specific message to 400, it risks returning 500.
  - Recommendation: Use validation middleware to return `{ ok: false, error: { code: 'BAD_REQUEST', ... } }` with 400.

- **Authentication present; authorization consistent for writes**
  - Lines: `GET` 23–29; `POST` 56–66; `DELETE` 97–106
  - `POST`/`DELETE` require `requiredPrivilegeLevel: 'MANAGER'`. `GET` requires authentication but no explicit authorization. This may be acceptable if read access is universal; otherwise consider role scoping.
  - Recommendation: Confirm intended access policy for list retrieval; add explicit role checks if necessary.

- **Content-Type enforcement for POST not explicit**
  - Lines: 67–69
  - Conventions require `application/json` body. It’s not shown whether `validate(...)` enforces this or fails non-JSON bodies.
  - Recommendation: Enforce/verify `Content-Type: application/json` and reject others with structured 415 or 400.

- **Internationalization: mixed-language success message**
  - Lines: 125–131
  - Success message is hardcoded Persian text (`'پروژه با موفقیت حذف شد'`). If the API is English-first, this is inconsistent; if localized, it should be systematic.
  - Recommendation: Standardize language or integrate structured i18n for messages.

## Performance & Scalability Review

- **Per-request dynamic import of auth middleware**
  - Lines: `GET` 23; `POST` 56; `DELETE` 97
  - `await import('@/lib/middleware/auth-middleware')` on every request adds overhead and can increase cold path latency.
  - Recommendation: Prefer top-level static imports unless there is a compelling reason (edge compatibility, circular deps, or optional module). If dynamic import is required, consider caching the promise/module.

- **Service-layer usage is clean but lacks pagination/cursor clarity**
  - Lines: `GET` 35; `POST` 80; `DELETE` 123
  - `GET` delegates to `ProjectService.getProjects(queryParams)` but it’s unclear whether cursor-based pagination is supported per conventions.
  - Recommendation: Ensure `GetProjectsQuerySchema` supports cursor-based pagination (`cursor`, `limit`) and the response includes `meta.nextCursor` when applicable.

- **Abort/cancellation not propagated**
  - Lines: `GET` 35; `POST` 80; `DELETE` 123
  - No `AbortSignal` from the request is passed to the service layer, which can lead to wasted work under client aborts.
  - Recommendation: Thread an `AbortSignal` to downstream calls where supported.

- **Idempotency on POST**
  - Lines: 47–92
  - Conventions recommend idempotency keys for retriable POSTs. Not present here.
  - Recommendation: Support an `Idempotency-Key` header and handle deduplication in the service/DB layer when applicable.

## Architectural & Clean Code Assessment

- **Route structure for resource id**
  - Lines: 108–114
  - `DELETE` reads `id` from query params in a collection route file. In Next.js routing, resource-specific operations typically live in `src/app/api/projects/[id]/route.ts` and receive `params`.
  - Recommendation: Move the delete handler to a dynamic `[id]` route and validate `params.id` with Zod.

- **Consistent validation at boundaries**
  - Lines: `GET` 31–33; `POST` 67–69; `DELETE` 108–114
  - `GET` and `POST` use `validateQuery`/`validate` with Zod. `DELETE` does not. This violates the “validate at the boundary” convention.
  - Recommendation: Add Zod-based validation for all handlers including `DELETE`.

- **Structured error responses**
  - Lines: 37–38, 82–85, 129–131, and catches at 39–44 / 86–91 / 132–137
  - Success responses use `createSuccessResponse(...)`. Error handling delegates to `handleApiError(...)`, which is good. The one-off `throw new Error(...)` in `DELETE` is the outlier.
  - Recommendation: Remove ad-hoc throws in favor of validation failures or known operational errors with mapped status codes and `error.code`.

- **Logging hygiene**
  - Lines: 70–77, 115–120
  - Logs avoid sensitive fields and add context—good. Consider consistent structured fields across handlers (`requestId`, `tenantId`, etc.) for correlation.

- **Response codes**
  - Lines: `GET` 38 (200), `POST` 84 (201), `DELETE` 130 (200)
  - Codes are reasonable. For `DELETE`, 204 No Content is also conventional when no body is needed; current 200 with a success body is acceptable if standardized.

---

### Targeted Recommendations (Actionable)

1. Add rate limiting to `DELETE` (before auth).
2. Introduce `DeleteProjectQuerySchema` and validate with `validateQuery` in `DELETE`; map failures to 400 structured errors.
3. Replace `throw new Error('Project ID is required')` with validation failure handling.
4. Consider moving deletion to `src/app/api/projects/[id]/route.ts` and validating `params.id`.
5. Make auth middleware a static import (or cache dynamic import) to reduce per-request overhead.
6. Verify `Content-Type: application/json` enforcement in `POST` per conventions.
7. Ensure `GetProjectsQuerySchema` supports cursor-based pagination and include `meta.nextCursor` where applicable.
8. Pass `AbortSignal` to service calls when supported.
9. Consider idempotency key support for `POST` where retries are expected.
10. Standardize success message language or integrate i18n.


