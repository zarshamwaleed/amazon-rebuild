# Avenzo Toasts & Notifications — Session 3

**Date:** 2026-09-26
**Scope:** Redesign the toast/notification system (`src/context/ToastContext.jsx`) to use the Avenzo visual language established in Session 1 ([[avenzo-design-system-rollout]]) and Session 2 ([[avenzo-ui-primitives-api]]). No other component or page touched.

## Pre-work: usage audit

`pushToast` is called from ~50 files (pages, context providers, seller components). Every call site was grepped before touching anything:

- 100% of call sites use the signature `pushToast(message, { type })`, where `type` is always one of `'success' | 'error' | 'info'`. **No caller uses `warning`, `duration`, or any notion of an action button today** — those are new/additive.
- `ToastProvider` wraps the app once, in `App.jsx`; `useToast()` is the only consumption path. Neither the provider's mount point nor the hook's name/shape changed.
- No other component in the codebase implements toast-like UI — `SellerNotifications.jsx` is an unrelated in-app notification *list page*, not a toast, and was left untouched.

This confirmed the entire redesign could happen inside one file (plus small additive CSS/Tailwind support) without touching any of the ~50 call sites.

## What changed

### `src/context/ToastContext.jsx`
Full visual and interaction rebuild, same public API (`ToastProvider`, `useToast() -> { pushToast }`, `pushToast(message, { type, duration })`):

- **Positioning** — bottom-right stack on desktop (`sm:right-6 sm:bottom-6 sm:w-96`), full-width bottom bar with side gutters on mobile (`bottom-4 left-4 right-4`). Outer region is `pointer-events-none` with `pointer-events-auto` on each card, so empty space around the stack doesn't block page content.
- **Visual design** — moved off the old flat colored-background alert boxes (`bg-green-50 border-green-200...`) to match the Card/EmptyState/Badge language already established: a warm `bone-50` card, hairline `stone-200` border, `shadow-lifted`, and a soft tinted icon medallion (`bg-{type}-50` circle + `text-{type}-500` icon) rather than a solid-color block. Reads as part of the product rather than a generic browser/bootstrap alert.
- **Types** — `success` (`CheckCircle2`), `error` (`AlertCircle`), `info` (`Info`), and a new `warning` (`AlertTriangle`) using the `success/error/info/warning` functional color tokens already defined in `tailwind.config.js` (50/500/700 shades) — those tokens existed since Session 1 but had never been consumed yet.
- **Entrance/exit animation** — new `toast-in` (320ms, `ease-avenzo-out`, fade + slide-up + slight scale) and `toast-out` (200ms, `ease-avenzo-in`, faster fade-out) keyframes/utilities added to `tailwind.config.js`, reusing the same motion-curve convention as the existing `fade-in`/`scale-in` utilities. Dismissal (auto or manual) now flips a `leaving` flag, plays `toast-out`, and only removes the toast from state after the 200ms animation completes — previously a toast vanished instantly with no exit transition.
- **Auto-dismiss progress bar** — a thin bar along the bottom edge of each toast animates from full width to empty over the toast's own `duration`, via a new `.toast-progress-bar` / `@keyframes toast-progress` pair in `index.css` (dynamic per-toast duration is passed as an inline `animationDuration`, which is why it's a plain CSS keyframe rather than a Tailwind utility — same reasoning as the existing `.skeleton-shimmer` pattern). Only rendered when `duration > 0` (persistent toasts have no bar, matching the pre-existing `duration <= 0` = "no auto-dismiss" convention).
- **Pause on hover** — hovering a toast pauses both its dismiss timer and its progress-bar animation; leaving resumes both from where they left off (remaining-time tracked in a ref-backed timer map, not just cosmetic). Lets a user read/act on a toast before it disappears.
- **Stacking** — unchanged append-to-end ordering (`setToasts(prev => [...prev, toast])`), so newest toasts appear closest to the screen corner and older ones get pushed up — multiple toasts stack cleanly with `gap-3`.
- **Optional action** — new additive `action: { label, onClick }` option. Renders a small text button under the message in the toast's accent color; clicking it fires `onClick` then dismisses the toast (with its own exit animation). No existing caller passes this yet.
- **Manual dismiss** — kept the `X` button (`aria-label="Dismiss notification"`), now routed through the same animated `dismissToast` path as auto-dismiss instead of removing immediately.
- **Accessibility improvements (non-breaking)** — `role="alert"` for error toasts vs `role="status"` for the rest (previously all `role="status"`); `aria-atomic` removed from the live region (was `true`, which would re-announce the *entire* stack's text on every change — now each new toast announces itself independently, which reads better with multiple stacked toasts).

### `tailwind.config.js`
Added `toastIn`/`toastOut` keyframes and `toast-in`/`toast-out` animation utilities, following the exact naming/structure convention of the pre-existing `fadeIn`/`fadeInUp`/`scaleIn` entries. Purely additive — no existing keys touched.

### `src/index.css`
Added `.toast-progress-bar` + `@keyframes toast-progress` directly below the existing `.skeleton-shimmer` + `@keyframes shimmer` block, same pattern (a hand-written keyframe outside `@layer` for a case a static Tailwind utility can't express — here, a per-instance dynamic duration).

## Backward compatibility

| Aspect | Before | After | Breaking? |
|---|---|---|---|
| `useToast()` return shape | `{ pushToast }` | `{ pushToast }` | No |
| `pushToast(message, opts)` | `opts.type`, `opts.duration` | same, plus additive `opts.action` | No |
| `type` values | `success \| error \| info` (anything else silently fell back to the info/blue branch) | `success \| error \| info \| warning`, unknown values fall back to `info` styling | No — same fallback behavior, wider support |
| Toast removal | Instant (no exit transition) | Animated exit (200ms), then removed | Visual only, no API change |
| `ToastProvider` mount point | `App.jsx`, unchanged | unchanged | No |

All ~50 existing `pushToast(...)` call sites across pages/contexts/seller components continue to work with no code changes.

## Verification

- `npm run build` (`vite build`) — succeeds, exit 0. Only the pre-existing, unrelated dynamic/static-import warning for `supabase.js` and the pre-existing large-chunk warning.
- `npx eslint src/context/ToastContext.jsx` — 0 errors, 1 pre-existing-pattern warning (`react-refresh/only-export-components`, because the file exports both the provider component and the `useToast` hook — the same shape the original file already had, and the same shape `CartContext.jsx`/`WishlistContext.jsx` use).
- Verified the dynamically-composed Tailwind class names (`bg-success-50`, `text-warning-500`, `animate-toast-in`, `toast-progress-bar`, etc.) are all present in the production CSS output (`dist/assets/index-*.css`), since these are assembled from a static lookup table (`TOAST_STYLES`, mirroring `Button.jsx`'s `VARIANTS` pattern) rather than interpolated at runtime — interpolating type names directly into class strings would have made them invisible to Tailwind's JIT scanner.
- Grepped every `pushToast(` call site (50+ across pages/context/seller components) to confirm the `(message, { type, duration? })` calling convention is unchanged and none rely on behavior that was altered.
- **Browser smoke-test was attempted but could not run**: the Chrome extension used for automated browser verification reported "not connected" in this sandbox — the same limitation hit in Sessions 1 and 2. Verification here relies on the build/lint checks above plus manual code review of the full diff. **This still needs a real manual check in the browser** (`npm run dev`) covering:
  - Success / error / info / warning toasts (trigger via existing flows, e.g. add-to-cart for success, a failed action for error, wishlist toggle for info; warning has no existing call site yet — trigger with `pushToast('test', { type: 'warning' })` from the console)
  - Multiple stacked toasts (fire several in quick succession)
  - Mobile viewport behavior (full-width bottom bar)
  - Auto-dismiss timing + progress bar animation
  - Hover-to-pause, then resume on mouse-leave
  - Manual dismiss via the `X` button
  - An action-button toast (no existing caller yet; would need a temporary test call)

## Next steps (future sessions)

- Wire the new `action` option into a real call site where it adds value (e.g. "Undo" on cart-remove/wishlist-remove, or "View" on order-status toasts) — none of the ~50 existing calls currently need it, so none were changed speculatively.
- Do the deferred manual browser verification above once the Chrome extension/tab-context connection is available in this environment.
