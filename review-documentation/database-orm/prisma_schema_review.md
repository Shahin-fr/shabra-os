### Prisma Schema Audit – Data Model Review

Date: 2025-10-07
Target: `prisma/schema.prisma` (PostgreSQL)

## Executive Summary
- Overall the schema is coherent and models core HR/PM features well. Relations are explicit with mostly safe cascading rules. Several models lack defensive constraints and useful indexes on foreign keys and temporal/status fields. There are a few naming and consistency issues, and some scalability risks around unbounded relations and string enums.

## Scope and Method
- Reviewed all models, relations, and enums with focus on:
  - Data integrity & constraints
  - Indexing & performance
  - Naming & conventions
  - Scalability concerns

## Data Integrity & Constraints

### Global observations
- Foreign keys: Most relations specify `onDelete` behavior. A few implicit relations (without `onDelete`) exist; defaults may vary by provider and Prisma version—prefer explicitness.
- Nullability: Optional FKs are used appropriately for soft links. Consider whether content hierarchy and time series tables should disallow certain nulls to avoid orphans.
- Unique constraints: Widespread use is limited to IDs and a handful of natural keys.

### Model-by-model
- User
  - `id` (cuid), `email @unique`, plus `@@unique([email, isActive])`. Having both unique on `email` and compound unique with `isActive` makes the compound unique redundant because the single-field unique already enforces uniqueness across all states. If the intention is to allow multiple inactive users with same email, you must drop the single-field `@unique` on `email` and keep the compound unique.
  - Self relation `managerId` is optional; `onDelete` not specified → default behavior. Consider `onDelete: SetNull` for `managerId` to avoid cascading deletes through the org tree.
  - `roles` is a `String` with default "EMPLOYEE" while an enum `Role` exists. Consider `roles Role[]` or `role Role` to avoid free-form values and to allow indexing.

- Profile
  - 1:1 with `User` using `userId @unique` and `onDelete: Cascade` — correct. Consider enforcing required side (e.g., application logic to always create Profile) if logically mandatory.

- Announcement
  - `authorId` with `onDelete: Cascade` means deleting a user will delete announcements. If announcements are content/history, prefer `onDelete: SetNull` and keep the content.

- Project / Task
  - `Task.createdBy` and `Task.assignedTo` behaviors are good (`Cascade` and `SetNull`). Ensure business rules prevent losing audit trails when creators are deleted; consider soft-delete users instead of hard deletes.
  - Missing unique guard for task ordering within projects if order semantics are required (e.g., `@@unique([projectId, order])`).

- Document
  - Hierarchical relation uses `onDelete: Cascade` on `parentId` — correct for trees. Confirm you want user deletion to cascade and remove authored documents (`authorId` has `Cascade`). Many orgs prefer preserving authored content (`SetNull`).
  - File metadata is optional; fine for mixed document types.
  - `DocumentRead` lacks explicit FKs and uniqueness. Consider `documentId` and `userId` as FKs with `@@unique([documentId, userId])` to prevent duplicate reads.

- Idea
  - No FKs to `User` although `authorId` exists; should be a relation to `User` with `onDelete: SetNull` or `Cascade`.
  - `updatedAt` uses `@default(now())` instead of `@updatedAt` — use `@updatedAt` for accuracy.

- LeaveRequest / Request
  - Relations and reviewer links are good; use of `onDelete: SetNull` for reviewers prevents cascading losses.
  - Consider validation to ensure `endDate >= startDate` (app-level) and non-overlapping leave periods (DB constraints are non-trivial; consider exclusion constraints in Postgres if required).

- EmployeeDocument
  - Both `user` and `uploadedBy` cascade on delete; consider keeping audit trail by `SetNull` on `uploadedById`.

- ChecklistTemplate / ChecklistTemplateTask / EmployeeChecklist
  - Good use of cascades for template deletes; consider adding a defensive `@@unique([templateId, order])` for deterministic ordering and to prevent duplicates.

- Attendance
  - Has `checkIn`, `checkOut`. Consider a constraint ensuring `checkOut >= checkIn` (app-level). If multiple check-ins per day are allowed, consider uniqueness guards per user/day.

- ContentSlot
  - No additional constraints; if overlapping slots per project are disallowed, enforce via application or exclusion constraints.

- Story / StoryType / StoryIdea
  - `Story.day` stored as `String` in `YYYY-MM-DD`. Prefer `Date`/`DateTime` (date) to leverage proper ordering, range queries, and constraints.
  - `Story.updatedAt` uses `@default(now())` instead of `@updatedAt` — switch to `@updatedAt`.
  - `StoryIdea.storyType` is a free-form `String` despite existing `StoryType` model; clarify whether this duplicates `StoryType` or represents a different taxonomy. Prefer FKs to `StoryType` or an enum.
  - `StoryIdea.updatedAt` also lacks `@updatedAt`.

- TrackedInstagramPage / InstagramReel
  - Solid use of integer PKs and unique natural keys. Consider `@@unique([pageId, shortCode])` only if business logic requires uniqueness at the pair (single-field unique already exists on `shortCode`).

- WorkSchedule
  - 1:1 with `User` via `userId @unique` and cascade; acceptable. Consider whether to retain schedules on user deletion (audit) via `SetNull` or soft-delete users.

- Holiday
  - `date @unique` is correct; if supporting multiple holidays per date in different locales, adjust model accordingly.

- Meeting / MeetingAttendee / TalkingPoint / ActionItem
  - Many-to-many via join model `MeetingAttendee` with `@@unique([meetingId, userId])` — correct.
  - `ActionItem.relatedTaskId` is an orphan string; if it references `Task.id`, make it a relation with `@relation(fields: [relatedTaskId], references: [id])`.

## Indexing & Performance

### General
- Add indexes to all foreign keys used in query filters and joins; several models already do this well, but some are missing.
- Temporal queries often filter/sort by `createdAt`, `updatedAt`, `startDate`, `endDate`, `publishedAt`. Ensure indexes exist where frequent.

### Specific recommendations
- User: Already indexed on `email`, `isActive`, `createdAt`, `name` composite, `managerId` — good.
- Profile: Indexed on `userId`, `jobTitle`, `department` — good.
- Task: Consider indexes on `createdBy`, `assignedTo`, `projectId`, `status`, `priority`, `dueDate`, `createdAt` depending on usage; currently none defined.
- DocumentRead: Add indexes on `documentId`, `userId`, and a unique composite on both.
- Idea: If linked to user, index `authorId`. Consider `status`, `createdAt` indexes for browsing.
- LeaveRequest: Add indexes on `userId`, `status`, `leaveType`, `startDate`, `endDate`, `createdAt` for dashboards.
- Request: Indexes already on `userId`, `type`, `status`, `createdAt`, `reviewedBy` — good.
- EmployeeDocument: Already indexes `userId`, `category`, `uploadedById`, `createdAt` — good.
- ChecklistTemplateTask: Indexed on `templateId`, `order` — good; add uniqueness guard on pair if order must be unique.
- EmployeeChecklist: Indexed on `employeeId`, `templateId`, `status`, `startDate` — good.
- Attendance: Add index on `userId`, and on `checkIn` if used for ranges.
- ContentSlot: Add index on `projectId`, `startDate`, `endDate` for scheduling queries.
- Story: Add indexes on `projectId`, `storyTypeId`, `storyIdeaId`, `authorId`, `day`, `status`, `createdAt` for feeds/plans.
- StoryType: Usually fine as-is; `name @unique` already indexed.
- StoryIdea: Add indexes on `isActive`, `category`, and potentially `storyType` (or FK) for filtering.
- InstagramReel: Already indexes on `pageId`, `publishedAt` — good.
- WorkSchedule: Indexed on `userId` — good.
- Holiday: Indexed on `date` and unique — good.
- Meeting: Indexed on `creatorId`, `startTime`, `endTime`, `type`, `status` — good.
- MeetingAttendee / TalkingPoint / ActionItem: Indexed on FKs — good; consider `isCompleted` index on `ActionItem` and `TalkingPoint` for quick filters if commonly used.

## Naming & Conventions
- Mixed usage of enums and free-form strings (e.g., `User.roles` string vs `Role`, `Story.status` string vs potential enum). Prefer enums or separate lookup tables for consistency, validation, and queryability.
- Timestamps: Prefer `@updatedAt` for `updatedAt` across models (e.g., `Story`, `Idea`, `StoryIdea`).
- Arrays vs join tables: If `User` can have multiple roles, model as `Role[]` or a join model `UserRole` for auditability; avoid delimited strings.
- Consistent pluralization: Table mappings via `@@map` are consistently plural — good.
- `day` field in `Story` should be a `Date` type rather than `String` to follow conventional naming and enable date ops.

## Scalability Concerns
- Unbounded trees (`Document`): Cascading deletes can be expensive on deep trees. Consider soft-deleting and background cleanup for large hierarchies.
- Denormalized strings as categories/statuses (`Story.status`, `StoryIdea.storyType`): Hinders indexing and consistent filtering at scale.
- Large fan-out relations (e.g., `User` → `stories`, `documents`, `attendances`): Add pragmatic indexes where list views are common; consider pagination via cursor on created timestamps with composite indexes.
- Write amplification on cascades (e.g., user deletion): Review business policy; prefer user soft-deletes to preserve history and reduce cascade storms.

## Concrete Recommendations (Actionable)
1. User
   - Decide intent for duplicate emails; if allowing multiple inactive users per email, drop `@unique` on `email` and keep `@@unique([email, isActive])`.
   - Replace `roles: String` with either `role Role` or `roles Role[]` and add appropriate indexes.
   - Set `manager` relation to `onDelete: SetNull` explicitly.
2. Document / DocumentRead
   - Add relation FKs on `DocumentRead` and enforce `@@unique([documentId, userId])`; index both columns.
   - Consider `authorId onDelete: SetNull` to retain content when users are deleted.
3. Idea
   - Add a relation to `User` for `authorId`; change `updatedAt` to `@updatedAt`; index `authorId`, `status`, `createdAt` as needed.
4. Task
   - Add indexes on `createdBy`, `assignedTo`, `projectId`, `status`, `dueDate`, `createdAt` (based on query patterns).
   - Optionally enforce `@@unique([projectId, order])` if order semantics are required.
5. LeaveRequest
   - Add indexes on `userId`, `status`, `leaveType`, `startDate`, `endDate`, `createdAt`.
6. Attendance
   - Add index on `userId`; consider composite `(userId, checkIn)` for range queries.
7. ContentSlot
   - Add indexes on `projectId`, `startDate`, `endDate`; consider exclusion constraints to prevent overlaps per project if required.
8. Story / StoryType / StoryIdea
   - Change `Story.day` to `Date`/`DateTime` (date); add indexes on `authorId`, `projectId`, `storyTypeId`, `storyIdeaId`, `status`, and `day`.
   - Switch `Story.updatedAt`/`StoryIdea.updatedAt`/`Idea.updatedAt` to `@updatedAt`.
   - Normalize `StoryIdea.storyType` to a relation or an enum; add indexes accordingly.
9. ActionItem
   - If `relatedTaskId` references `Task`, convert to a proper relation and index.
10. Deletion policies
   - Review cascades on authored content and logs; prefer `SetNull` or soft-delete users to preserve history.

## Suggested Prisma Edits (Illustrative, not applied)
```prisma
model DocumentRead {
  id         String   @id @default(cuid())
  documentId String
  userId     String
  readAt     DateTime @default(now())

  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([documentId, userId])
  @@index([documentId])
  @@index([userId])
}
```

```prisma
model Idea {
  id          String   @id @default(cuid())
  title       String
  description String
  authorId    String
  status      String   @default("pending")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author      User     @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@index([authorId])
  @@index([status])
  @@index([createdAt])
}
```

## Migration & Rollout Notes
- Any change to uniqueness on `User.email` requires careful data backfill and conflict resolution.
- Switching string fields to enums requires mapping existing values; introduce enums first, backfill, then change types.
- Adding indexes is generally safe online, but large tables may need concurrent index creation (raw SQL) and maintenance windows.
- Changing `onDelete` behaviors can have cascading effects; test on a copy of production data.

## Closing
- Implementing the above will harden data integrity, improve query performance, and align naming with conventions, while preparing for scale.


