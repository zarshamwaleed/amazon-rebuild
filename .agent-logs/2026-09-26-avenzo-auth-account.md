# Session 9 — Avenzo Auth & Account (2026-09-26)

Redesigned authentication and customer-account pages with the Avenzo visual identity. All auth/session/business logic preserved exactly — only presentation changed (plus one small additive primitive feature and a couple of low-risk shared-component enhancements, detailed below).

## Files changed

**Auth**
- `src/components/auth/AuthSplitLayout.jsx` (new) — shared editorial split-screen shell: full-bleed image panel (breakout via `relative left-1/2 -translate-x-1/2 w-screen`, same technique as `HomeHero`) with gradient overlay, brass eyebrow, Fraunces headline, and an optional pull-quote on the left; centered form column (max-w-sm) on the right. Image panel hides below `lg`; a small wordmark substitutes on mobile.
- `src/pages/Login.jsx`, `src/pages/Register.jsx` — now thin wrappers around `AuthSplitLayout` + `LoginForm`/`RegisterForm`. All redirect-when-authenticated logic (`useEffect` + `<Navigate>`) unchanged.
- `src/components/LoginForm.jsx`, `src/components/RegisterForm.jsx` — restyled with Avenzo `Input`/`Button`, an icon+banner error state (`AlertCircle` + `error-50`), and `Button`'s `loading` prop for the submit state. `RegisterForm` now shows the password-length/confirm-mismatch validation as per-field `Input` errors instead of a single top banner (still client-side only, same rules: length ≥ 6, must match). `signIn`/`signUp` calls unchanged.

**Shared primitive**
- `src/components/Input.jsx` — additive: when `type="password"`, renders a show/hide toggle (`Eye`/`EyeOff`) inside the field via local `visible` state. Falls back to a plain `type` prop otherwise (default `'text'`, same as native behavior before). No existing call site's markup/behavior changes.

**Account dashboard**
- `src/components/AccountSidebar.jsx` — added an identity header card (initial avatar + name/email) above the nav; nav restyled with a brass left-rail indicator + `brass-50` background for the active link; sign-out row now hovers to `error-50`/`error-700`. Same links, same `signOut()` + `navigate('/')` behavior.
- `src/pages/Account.jsx` — personalized greeting ("Welcome back, {firstName}") when a profile name is available, else falls back to "Your Account". Same data source (`useAuth()`), same child components.
- `src/components/ProfileForm.jsx` — quiet uppercase labels (already the `Input` default), a `dirty`-tracked Save button (disabled with a "No changes to save" caption when nothing changed, `loading` while saving), and a success toast (`pushToast(..., {type:'success'})`, matching the convention already used in Checkout/OrderDetails) instead of an inline success banner. Inline banner kept for errors. `updateProfile()` call unchanged.

**Orders / Order details**
- `src/pages/Orders.jsx` — restyled order-summary cards with Avenzo tokens, `formatPrice()` instead of manual `toFixed`, `Package` icon + `Button` in the empty state. Data loading (`getUserOrders`) unchanged.
- `src/pages/OrderDetails.jsx` — restyled item list, shipping-address card, order-summary card, and both modals (`ContactSellerModal`, `CustomerReturnModal` — swapped their plain `<input>`/button markup for the shared `Input`/`Button` components where it was a drop-in fit, kept native `<select>`/`<textarea>` reskinned to match). All data fetching, return/contact-seller service calls, and state machines (`returnsByProduct`, `RETURN_STATUS_META`, `RETURN_REASONS`) unchanged. Removed one pre-existing dead `pushToast` destructure in `CustomerReturnModal` that ESLint flagged (it was never called there before either — the toast fires from `OrderDetails`'s `onCreated` callback).
- `src/components/OrderStatusBadge.jsx` — now renders a small status icon inside the existing `Badge` (`PackageSearch`/`Clock`/`Truck`/`CircleCheck`/`XCircle`). `Badge`'s own color contract (`gray|green|red|yellow|blue`) is untouched, so this also lands — as a strict visual upgrade — on the other call sites that weren't otherwise in scope this session: `OrderConfirmation.jsx` and three seller pages (`SellerOrders`, `SellerOrderDetail`, `SellerFulfillment`), same pattern as `ProductCard` rendering inside unmigrated pages in earlier sessions.
- `src/components/OrderStatusTimeline.jsx` — fully restyled to Avenzo tokens (brass/charcoal instead of raw `green-600`/`#c7511f`) and fixed a latent bug: a `cancelled` order previously fell through `Math.max(0, -1)` and rendered "Order Placed" as the current step; it now renders a dedicated cancelled state. Safe to do now because this component's *only* call site is `OrderDetails.jsx` (confirmed via grep), which is in scope this session — resolves the "revisit later" note left in Session 8's memory.

## Verification
- `npx eslint` on every changed file — clean.
- `npm run build` — clean (pre-existing dynamic-import chunking warning only, unrelated).
- Browser check: same unresolved environment limitation as every prior session — `curl` gets a 200 from the Vite dev server, but the Chrome extension's `computer`/`get_page_text` tools report "Frame with ID 0 is showing error page" on this sandbox. Tried both `localhost` and `127.0.0.1`, fresh tabs — same result both times. A real `npm run dev` visual check is still outstanding and should be done manually.

## Not changed (by design)
- `AuthContext.jsx` (signIn/signUp/signOut/updateProfile/session listener), `ProtectedRoute.jsx`, and all Supabase queries/service calls — untouched, per the session brief.
- Sidebar links to `/wishlist`, `/messages`, `/returns`, `/gift-cards/balance` point at pages outside this session's scope; those destination pages are unchanged.
