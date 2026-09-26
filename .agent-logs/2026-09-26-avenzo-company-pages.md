# Avenzo Company Pages — About / Careers / Press / Investor Relations / Sustainability / Accessibility

Date: 2026-09-26

## What changed

Replaced the generic `InfoPage.jsx` placeholder for six footer links with real, brand-matched pages.

**New files:**
- `src/components/company/CompanyHero.jsx` — shared hero band (breadcrumb, Fraunces title, subtitle) used by all six pages so they read as one family.
- `src/pages/About.jsx` → `/about`
- `src/pages/Careers.jsx` → `/careers`
- `src/pages/Press.jsx` → `/press`
- `src/pages/Investors.jsx` → `/investor-relations`
- `src/pages/Sustainability.jsx` → `/sustainability`
- `src/pages/Accessibility.jsx` → `/accessibility`

**Modified:**
- `src/App.jsx` — the six routes above now point to the new page components instead of `InfoPage`; the now-unused `InfoPage` import was removed from `App.jsx` (the `InfoPage.jsx` file itself was left untouched, per instructions, in case it's used elsewhere later).

**Not touched:** `src/pages/InfoPage.jsx`, `Footer.jsx` (its links already pointed at these six paths — no change needed), any other route, backend/services/context/hooks/api.

## Design approach

All six pages share: a bone-canvas hero band (breadcrumb in `text-label`, Fraunces `text-display` title, muted `text-body` subtitle, max-width 640px), a `max-w-[900px]` centered content column with `py-16`, Fraunces 32px section headings, Inter 16px body copy, and `border-stone-200` hairline dividers between sections. Cards reuse the existing bordered/rounded-xl surface treatment (`bg-bone-50 border border-stone-200 rounded-xl`) already used by `Card.jsx` elsewhere in the app. Non-functional actions (role/press-release "view", media kit download, filing downloads) surface a toast via the existing `useToast()` hook rather than doing nothing silently.

Content is fictional but specific — onboarding review criteria, a real hiring process description, dated fictional press releases and quarterly filings, plausible metrics, and an honestly-worded accessibility page with actual known limitations rather than pure marketing copy.

## Verification

1. `npm run build` — succeeds, no errors (pre-existing chunk-size/dynamic-import warnings unrelated to this change).
2. `npx eslint` on all new/changed files — clean, no errors or warnings.
3. Manual review of all six files for: correct token usage (`bone-*`, `stone-*`, `charcoal-*`, `brass-*`, `font-display`/`font-sans`), valid Tailwind classes (caught and fixed one invalid `w-4.5 h-4.5` → `w-[18px] h-[18px]` in `Sustainability.jsx`), and one syntax bug (unescaped apostrophes inside single-quoted JS string literals in `Sustainability.jsx`'s `PILLARS` array — fixed by switching those two strings to double-quoted).
4. Mobile check via class review: hero stacks naturally (block layout, no fixed side-by-side columns), content stays inside `max-w-[900px]` with a consistent `px-6` side gutter, card grids default to `grid-cols-1` and only widen at `sm:`, and a `min-w-0` was added to the Investor Relations filings-row label to prevent overflow next to its shrink-0 download button at narrow widths.
5. **Browser visual check was not possible this session** — the `claude-in-chrome` screenshot tool fails with "Frame with ID 0 is showing error page" on this project's dev server, consistent with prior sessions' notes (this is a known, pre-existing environment issue unrelated to this change, not something introduced here). Verification relied on build + lint + manual diff review instead, per that prior guidance.

## Follow-up for a future session

- If/when the browser tool is working again, do a visual pass on all six pages at desktop and 375px to confirm spacing/line-length feels right in practice, not just in class review.
- `InfoPage.jsx` is now orphaned (no remaining route uses it) but was deliberately left in place per instructions.
