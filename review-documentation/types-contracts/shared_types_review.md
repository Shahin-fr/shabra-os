## Shared Types Review

Scope: `src/types` compared against Prisma models in `prisma/schema.prisma`

### Clarity & Consistency
- Names generally follow PascalCase for interfaces and union literals for enums; good.
- Inconsistencies found:
  - `roles` type varies:
    - `src/types/profile.ts` → `roles: string` on `ProfileUser`/`SubordinateInfo`.
    - `src/types/hr.ts` → `roles: string` for `User`/`Employee`.
    - `src/types/next-auth.d.ts` → `roles: string[]` for `Session.user`, `User`, and `JWT`.
    - Prisma `User.roles` is a single `String` (default "EMPLOYEE").
    - Recommendation: standardize on one representation. Prefer a first-class enum `UserRole` (already present in `hr.ts`) and decide on singular string vs string[] across the app. If multiple roles are required, migrate Prisma to a join table or `string[]` in Postgres; otherwise keep a single `UserRole` value.
  - Date/time types vary:
    - Many domain models use `string` for timestamps (e.g., `createdAt: string`).
    - Some UI/state types use `Date` (e.g., `admin-dashboard.ts` uses `Date` in several places).
    - Prisma uses `DateTime` for persisted timestamps.
    - Recommendation: adopt a convention: persisted/transport shapes use ISO `string`; UI/view models can use `Date`. Consider separate DTOs vs Entities (`FooDto` for transport, `FooEntity` for persisted) to make this explicit.
  - Status enums casing differs:
    - `TaskCounts` keys `Todo | InProgress | Done` match Prisma `TaskStatus` literals but appear as object keys, not a type.
    - `story.ts` status `'DRAFT' | 'READY' | 'PUBLISHED'` while Prisma `Story.status` is a `String` default `"DRAFT"` (not an enum). OK but consider an enum to avoid drift.
  - `type` fields are often plain `string` where constrained values exist (e.g., collaboration message `type` literals are good; elsewhere generic `type?: string`). Prefer narrow unions where possible.

### Accuracy vs API/DB (Prisma)
- Users
  - Prisma: `User.roles: String` with default `EMPLOYEE`.
  - Types: mix of `string` and `string[]`. Potential mismatch in auth/session vs DB. Decide and align.
- Profiles
  - Prisma `Profile` optional fields align with `ProfileData` optional strings. OK.
- Projects
  - Types: `Project` has `createdAt/updatedAt: string`, `startDate/endDate?: string | null`, `_count` shape for aggregates.
  - Prisma `Project` has `DateTime` fields and no `_count` by default (Prisma can include `_count` in queries). Acceptable as API response model; document as DTO not Entity.
- Stories
  - Types: `Story.day` is `string` (ISO) with comment; matches Prisma `Story.day` as `String` (YYYY-MM-DD). OK.
  - `Story.status` union matches intended values though Prisma doesn't enforce an enum. Consider promoting to a Prisma enum for safety.
  - `Story.storyType`/`project` nested objects appear as partials; matches typical includes. OK.
- HR/Leave
  - `LeaveType` and `LeaveStatus` in `hr.ts` mirror Prisma enums. Good.
  - `AttendanceRecord.status` uses `'completed' | 'in-progress'` not backed by a Prisma enum; accuracy depends on API layer. Verify server shapes.
- Admin Dashboard
  - Primarily UI/view types; some `Date` fields likely derived from `string` timestamps. Ensure transformation boundaries are clear.

### Organization & Modularity
- Domain-specific files exist: `hr.ts`, `profile.ts`, `project.ts`, `story.ts`, `story-management.ts`, `admin-dashboard.ts`, `collaboration.ts`, `state.ts` plus ambient `*.d.ts`.
- Overlap detected:
  - `StoryType` and `StoryIdea` defined in both `story.ts` and `story-management.ts` with slightly different fields. This risks drift.
  - Recommendation: create a single `story.types.ts` (or keep `story.ts`) as the source of truth for story domain types; other modules import from it.
- Consider creating a barrel file `src/types/index.ts` exporting public types for easier imports and consistency.
- Utility functions (formatting/time helpers) live in `hr.ts` alongside types. Move these to `src/lib/` (e.g., `date/formatDate.ts`) to keep `types/` purely declarative.

### DRY (Don’t Repeat Yourself)
- Duplicated type definitions:
  - `StoryType` and `StoryIdea` appear in two files. Consolidate.
- Role labeling/constants
  - `ROLE_LABELS`, `ROLE_BADGE_COLORS` in `hr.ts` are tied to `UserRole` but `UserRole` is only defined there. If roles are system-wide, extract `roles.ts` with `UserRole` enum, labels, and colors to avoid scattered role representations.
- Status label helpers (e.g., `getStatusBadge`) could be generalized and moved out of types.
- Consider using generics for common API response shapes:
  - Define `ApiSuccess<T>` and `Paginated<T>` to standardize across modules (align with `.cursor/rules/shabra-os-conventions.md` response shapes). Example: `Paginated<T> = { data: T[]; currentPage: number; totalPages: number; total: number; hasNextPage: boolean; hasPreviousPage: boolean }`.

### Specific Findings & Suggestions
- Users/Auth
  - Unify `roles` type. If multi-role is needed, change Prisma or map DB string to array at session creation (and vice versa). Define `UserRole` in shared `roles.ts` and replace `string` occurrences.
- Dates/Timestamps
  - Adopt DTO vs Entity conventions: transport `string` ISO; internal compute `Date`. Provide transformers at API boundaries.
- Stories
  - Promote `Story.status` to a Prisma enum to enforce allowed values.
  - Consolidate `StoryType`/`StoryIdea` into a single module; ensure `story-management.ts` reuses them.
- Types location
  - Move non-type utilities from `types/` to `lib/`. Keep `types/` interfaces, unions, and ambient declarations only.
- Barrels & Aliases
  - Add `src/types/index.ts` as a barrel; prefer imports via `@/types` per `tsconfig` aliases.
- Prisma Type Reuse
  - Where possible, import generated types from `@prisma/client` for model fields to reduce drift (e.g., `ProjectStatus`, `ProjectAccessLevel`, `Role`, `LeaveType`, `LeaveStatus`). Re-export them in the domain types to centralize.

### Actionable Checklist
1) Create `src/types/index.ts` barrel exporting domain types.
2) Extract `roles.ts` with `export enum UserRole { ADMIN, MANAGER, EMPLOYEE }` and map/session helpers; align DB/storage.
3) Consolidate `StoryType` and `StoryIdea` into `src/types/story.ts`; update `story-management.ts` to import.
4) Move helpers in `src/types/hr.ts` (formatters, badges) into `src/lib/date/*` and `src/lib/ui/*`.
5) Define shared API response types (`ApiSuccess<T>`, `ApiError`, `Paginated<T>`), aligning with `.cursor/rules/shabra-os-conventions.md`.
6) Consider Prisma enum for `Story.status` and update client type unions accordingly.
7) Clarify timestamp conventions and apply consistently (DTO vs Entity).

### Quick File-by-File Notes
- `src/types/profile.ts`: Clear interfaces; `roles: string` should become `UserRole | UserRole[]` per decision; timestamps as ISO `string` acceptable for DTOs.
- `src/types/hr.ts`: Good enum reuse; contains utilities that should be moved; `User`/`Employee.roles` should use `UserRole`.
- `src/types/project.ts`: Aligns with Prisma; `_count` is API concern—document as DTO.
- `src/types/story.ts`: Reasonable; unify with `story-management.ts` definitions.
- `src/types/story-management.ts`: Duplicates story domain types; re-export from `story.ts` instead.
- `src/types/admin-dashboard.ts`: UI/view types; fine to use `Date` locally.
- `src/types/collaboration.ts`: Strong literal unions for message `type`; good clarity.
- `src/types/state.ts`: Extensive, self-contained; no immediate issues, but ensure it stays separate from domain entities.
- `src/types/next-auth.d.ts`: Good module augmentation; reconcile roles array vs DB.
- Ambient `*.d.ts`: OK for third-party libs.

---

Overall: The type system is in good shape with clear domain modules. The main improvements are unifying `roles`, consolidating duplicated story types, separating utilities from type declarations, and codifying DTO vs Entity conventions with shared API response shapes.


