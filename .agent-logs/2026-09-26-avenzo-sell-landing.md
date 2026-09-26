# Session — Avenzo "Sell on Avenzo" landing + Sell header

Date: 2026-09-26

## Brief

The seller-acquisition side of the app — the public `/sell` landing page and its
header — was still wearing "amazon seller" branding (dark navy `#131921` header,
`#ff9900`/`#febd69` orange accents, "amazon seller" wordmark). Bring it into the
Avenzo design system, as its own calm, founder-focused sub-brand: premium,
editorial, an invitation rather than a pitch. Do not touch backend, services,
context, hooks, routing, or business logic.

## Files changed

1. `src/components/sell/SellHeader.jsx` — full redesign
2. `src/components/sell/SellLayout.jsx` — footer restyle
3. `src/pages/sell/SellLanding.jsx` — full redesign, same content/data, new composition
4. `src/pages/sell/SellRegister.jsx` — visual shell only; state/handlers/validation/Supabase calls untouched
5. `src/components/seller/SellerHeader.jsx` — checked only; already fully Avenzo-branded ("Avenzo" wordmark + "Seller Central" qualifier), no amazon references found, **no changes made**

## What changed

**`SellHeader.jsx`** — replaced the `amazon`/`seller` two-tone wordmark with an
"Avenzo" wordmark (font-display) plus a small-caps "Sell" qualifier, matching the
pattern `SellerHeader.jsx` already used for "Seller Central". Nav relabeled to
Overview / How it works / Pricing / Resources. Header switched from the dark navy
`#131921` bar to the same light `bone-50/95` backdrop-blur sticky treatment the
customer header uses. "Start selling" restyled to the Avenzo primary-button look
(`charcoal-900`/`bone-50`, `rounded-lg`), replacing the `#febd69` orange pill.

**`SellLayout.jsx`** — background switched to `bone-50`, footer switched from
`#232f3e` to `charcoal-900`/`stone-*` tokens, copy updated to "Avenzo Seller"
(the "Not affiliated with Amazon.com, Inc." legal disclaimer line was kept
verbatim — that's the deliberate real-Amazon disclaimer, not old branding).

**`SellLanding.jsx`** — rebuilt as an editorial story rather than a stacked
feature-page: asymmetric hero (copy ~7/12, one restrained framed image ~5/12,
via `Reveal` entrance) → Why sell (4 `Card`s) → How it works (6 steps, serif
numerals, no boxes — a more editorial list treatment than the original bordered
grid) → Plans (two `Card`s, "Most popular" ring on Professional) → Fulfillment
(FBA/FBM `Card`s) → revenue calculator (state/logic preserved exactly, inputs
restyled to Avenzo form tokens) → a "What to expect" trust strip (ledger-style
fact rows: fees/payouts/setup/support — kept to *existing* pricing facts already
in the FAQ copy, not fabricated data) → Resources → FAQ (accordion logic
preserved exactly) → dark `charcoal-900` final CTA band. All CTAs route to the
same `/sell/register`, `/sell/register?plan=individual|professional` targets as
before. Section anchors (`#how-it-works`, `#pricing`, `#resources`) match the
header nav's hash links. Motion: `Reveal` (existing homepage component, reused
rather than reinvented) for hero entrance and section/card scroll-reveals,
staggered slightly per grid item — restrained, no new animation primitives added.

**`SellRegister.jsx`** — visual shell only. Step-indicator dots, card chrome,
field inputs, radio/checkbox accents, and the two nav buttons were restyled to
Avenzo tokens (`brass`/`charcoal`/`stone`, `rounded-lg`/`rounded-xl`,
`shadow-subtle`). The "Continue" and "Complete verification" buttons now render
through the shared `Button` component (using its `loading` prop for the saving
state instead of a hand-rolled `disabled:opacity-60`). Every handler
(`validateStep`, `next`, `back`, `toggleCategory`, `update`,
`completeVerification`, the `getSellerProfile` redirect effect) and all Supabase
calls are byte-for-byte unchanged — only `className` strings, color tokens, and
the sign-in gate's link markup changed.

**`SellerHeader.jsx`** — read and checked per the brief's instruction to verify
seller-dashboard branding. It was already fully Avenzo ("Avenzo" wordmark +
"Seller Central" small-caps qualifier, `bone-50`/`charcoal`/`brass` tokens
throughout) from the Session 12 Seller Central redesign — no "amazon"/navy/orange
remnants found. Left untouched.

## Design decisions worth recording

- Deliberately did **not** reuse the homepage's "Archive" motif (mono `N° 00X`
  section numbering, hard-edged flush images) — that's a distinctive one-off
  device for the customer homepage's specific concept. The Sell page instead
  uses the more common Avenzo pattern shared across the rest of the app
  (uppercase brass `av-label` eyebrows, `rounded-xl` + soft shadow imagery) so
  it reads as "unmistakably Avenzo" through shared type/color/radius/motion
  without feeling like a copy of the homepage's specific voice.
- The brief asked for a testimonials/trust section. Rather than inventing fake
  seller quotes/names (which would read as fabricated social proof — flagged
  as a thing to avoid per prior sessions' "no mock data presented as real"
  lesson), built a ledger-style fact strip using pricing/payout/support facts
  that were already true statements elsewhere in this same page's FAQ copy.
- CTA buttons that navigate (Start selling, plan choices, final CTA) use the
  shared `Button` component with `onClick={() => navigate(...)}` rather than
  styling `Link` by hand, so they inherit the real button component's
  hover/active/focus states. In-page hash anchors (`#pricing` etc.) stay as
  plain `<a>` tags since they're not real route navigation.

## Verification

- `npx eslint` on all 5 touched/checked files: 0 errors, 0 warnings.
- `npx eslint .` (whole project): 0 errors, only pre-existing
  `react-hooks/exhaustive-deps` warnings in unrelated seller pages (unchanged
  by this session).
- `npm run build`: succeeds, no errors (only the pre-existing dynamic-import
  chunking warning, unrelated to this session).
- Grepped `src/components/sell` and `src/pages/sell` for `amazon`,
  `#ff9900`, `#131921`, `#febd69`, `#f3a847`, `#c7511f`, `#232f3e` — zero
  matches except the intentional "Not affiliated with Amazon.com, Inc." legal
  line.
- All route targets (`/sell`, `/sell/register`, `/sell/register?plan=...`,
  `/login`, `/seller`) confirmed unchanged against `App.jsx`'s route table.
- Browser verification not attempted — per [[avenzo-design-system-rollout]],
  the Chrome browser-automation extension has failed to reach this project's
  dev server in every session from 1 through 16 ("Frame with ID 0 is showing
  error page" on every screenshot call despite `curl`/`navigate` succeeding).
  Verification relies on build + lint + manual diff review, consistent with
  every prior Avenzo redesign session.
