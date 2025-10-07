### StoryCard.tsx – Accessibility, Reusability, and State Management Audit

Component: `src/components/storyboard/StoryCard.tsx`
Conventions reference: `.cursor/rules/shabra-os-conventions.md`

---

## Overview
`StoryCard` renders a clickable card with status, metadata, and action buttons (view, edit, delete). It’s a client component with minimal local logic and several callback props.

---

## Accessibility (A11y) & Semantics

Findings
- Card-level click area lacks keyboard operability and semantics.
  - The root `Card` receives `onClick`, but has no `role`, `tabIndex`, or key handlers for Enter/Space.
  - This prevents non-pointer users from activating the primary action.
- Icon-only affordances rely on adjacent text, which is good. However, SVG icons likely need `aria-hidden="true"` if purely decorative to avoid noisy screen reader output.
- Focus visibility on the clickable card is not defined (no `focus:` styles). Nested `Button`s have focus handling via the design system, but the card itself should expose a visible focus ring if it’s interactive.
- Status badge maps to a visual chip, but there’s no explicit `aria-label` or textual expansion for assistive tech when the status color changes.
- Dialog for delete uses `confirm(...)`. It’s synchronous and blocks but is not ideal for custom styling or i18n/ARIA. A DS modal would offer better control and consistent semantics.

Risks
- WCAG 2.1.1 Keyboard and 2.4.7 Focus Visible can be violated by the card’s lack of keyboard support and focus indication.
- Decorative icons may be announced if not hidden.

Recommendations
- Make the whole card keyboard-activatable if it represents a primary action:
  - Add `role="button"`, `tabIndex={0}`, and a key handler (`Enter`/`Space`) that mirrors click.
  - Add `aria-label` if the title text is not sufficient to convey the action.
  - Provide `focus:` classes (e.g., `focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-md`).
- Mark decorative SVGs as hidden: set `aria-hidden="true"` on icon components or via wrapper.
- Expose status text for AT explicitly (the badge already renders readable text; keep it inline and avoid relying on color only). Consider `aria-live="polite"` if status can change dynamically.
- Replace `confirm(...)` with a design-system modal pattern that provides proper ARIA (role="dialog", labelled by title, controlled focus trapping).

---

## State Management & Logic

Findings
- The component is stateless; it delegates via `onSelect`, `onEdit`, `onDelete`. Local handlers are simple and fine.
- `use client` is appropriate because the component is interactive with event handlers.
- No memoization; re-renders depend on parent renders. Given lightweight rendering, this is usually fine, but can be optimized in grids.
- Potential logic bug in `getStatusColor`: it checks `COMPLETED | IN_PROGRESS | PENDING | BLOCKED`, but `Story.status` is typed as `'DRAFT' | 'READY' | 'PUBLISHED'`. This leads to default styling for all valid statuses.

Recommendations
- Fix the status color mapping to match the actual union type (DRAFT/READY/PUBLISHED) or align the domain enum on both sides.
- Consider `React.memo(StoryCard)` if the card appears in large lists/grids and parent frequently re-renders; provide a custom props comparer keyed by `story.id`, `story.status`, `story.title`, `isDragging`.
- Keep handlers stable with `useCallback` only if profiling shows benefit or you pass them to memoized children.

---

## Reusability & API Design

Findings
- Props are clear but slightly inconsistent:
  - `onSelect(story)` and `onEdit(story)` receive the full `Story`, while `onDelete(storyId)` receives only the id.
- The component is coupled to the domain `Story` type, which limits reusability outside storyboard contexts.
- `dragHandle` allows composition for DnD, which is good.

Recommendations
- Normalize callback signatures. Either:
  - All callbacks receive `story` and let callers extract `id`, or
  - All callbacks receive minimal data: `{ id, title, status }`.
- Consider narrowing the prop surface to a view-model shape instead of the full `Story` domain object to improve reuse and testability:
  - e.g., `story: { id, title, status, dayISO, storyTypeName?, projectName?, notes? }`.
- Export a `StoryCardProps` type and add concise JSDoc describing invariants (e.g., `day` must be ISO, status must be one of ...).

---

## Styling & Theming

Findings
- Tailwind classes follow conventional utility usage and RTL variants are considered (`rtl:` classes used appropriately).
- Color tokens are direct Tailwind palette values (`text-gray-600`, `bg-blue-50`). If the DS exposes design tokens, consider mapping to tokenized utilities for easier theme changes.
- Hover/focus states are implemented for buttons but not for the clickable card.

Recommendations
- Add focus-visible styles to the card interaction surface.
- If the design system provides semantic tokens (e.g., `text-muted-foreground`, `bg-accent`), prefer them over raw palette classes to ease theming.
- Ensure `cn`-merged class order follows the repository import/order conventions.

---

## Concrete Issues Detected (High Priority)
- Status mapping mismatch causes all statuses to fall back to the default gray badge style.
- Card is not keyboard-accessible and has no visible focus state, risking WCAG failures.
- Decorative icons likely lack `aria-hidden`.

---

## Suggested Edits (Illustrative)
Note: Example-only; not applied.

```tsx
// Abridged example
<Card
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  }}
  className={cn(
    'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-md',
    isDragging && 'shadow-lg scale-105 rotate-2',
    className,
  )}
  onClick={handleSelect}
>
  {/* ... */}
  <Badge variant="outline" className={cn('text-xs font-medium', getStatusColor(story.status))}>
    {statusLabel(story.status)}
  </Badge>
  {/* Mark icons decorative */}
  <Calendar aria-hidden="true" className="w-4 h-4" />
  {/* ... */}
</Card>
```

And align status mapping with the typed domain:

```ts
function getStatusColor(status: Story['status']) {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'READY':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function statusLabel(status: Story['status']) {
  if (status === 'DRAFT') return 'پیش‌نویس';
  if (status === 'READY') return 'آماده';
  return 'منتشر شده';
}
```

---

## Quick Wins Checklist
- Add `role="button"`, `tabIndex`, key handlers, and focus-visible styles to the card.
- Hide decorative icons from AT via `aria-hidden`.
- Fix status mapping and consolidate label rendering.
- Consider a DS modal for delete confirmation instead of `confirm(...)`.
- Optionally memoize `StoryCard` or stabilize props if used in dense grids.

---

## Notes Against Conventions
- “use client” is justified by interactivity (aligns with RSC-by-default guidance).
- Keep components small and pure; `StoryCard` adheres to this and delegates effects upward.
- Prefer named exports and path aliases: both already followed.

---

## Conclusion
Address the keyboard accessibility, focus styles, and status enum mismatch first. Then consider API normalization and optional memoization for performance in large lists. Styling tokenization will improve theming resilience across the design system.


