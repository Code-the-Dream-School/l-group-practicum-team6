# User Scenarios

Top user scenarios for Sonix MVP. Ordered by importance. Each scenario lists the actor, preconditions, happy path, edge cases, and success criteria. Use these for QA, E2E tests, and design alignment.

---

## 1. First-Time Visitor Discovers the Product

**Actor:** Unauthenticated visitor.
**Goal:** Understand what Sonix is and decide whether to sign up.

**Preconditions:** None.

**Happy path:**
1. User lands on `/`.
2. Hero section communicates value (curated audio-reactive visualizer).
3. User scrolls through features and CTAs.
4. User clicks **Sign Up** in the public navbar.

**Edge cases:**
- Reduced-motion preference → animated gradients fall back to static.
- Slow network → hero renders without orbs first; visuals progressively enhance.

**Success criteria:** User reaches `/signup` from the landing page in ≤2 clicks.

---

## 2. New User Signs Up

**Actor:** Unauthenticated visitor with intent to register.
**Goal:** Create an account and reach the visualizer.

**Happy path:**
1. User opens `/signup`.
2. User enters email + password (and any required profile fields).
3. Backend creates user, issues JWT.
4. App stores token, redirects to `/visualizer`.
5. (If onboarding tour is in scope) tour triggers on first visualizer view.

**Edge cases:**
- Email already registered → inline error, link to `/login`.
- Weak password → inline validation before submit.
- Network/500 → non-blocking error toast, form preserves input.
- JWT issued but redirect fails → user remains logged in, can navigate manually.

**Success criteria:** Account persisted, JWT valid, user lands on authenticated route.

---

## 3. Returning User Logs In

**Actor:** Existing user.
**Goal:** Access authenticated area.

**Happy path:**
1. User opens `/login`.
2. Enters credentials, submits.
3. Backend validates, returns JWT.
4. App redirects to `/visualizer` (or last intended route).

**Edge cases:**
- Invalid credentials → inline error, no user enumeration leak.
- Expired/invalid stored JWT on subsequent visit → AuthRoute redirects to `/login`.
- Deep link to protected route while logged out → redirect to `/login`, preserve `returnTo`.

**Success criteria:** Auth state reflected across app, protected routes accessible.

---

## 4. User Connects Microphone and Sees Reactive Visual

**Actor:** Authenticated user on `/visualizer`.
**Goal:** Play a reactive visual driven by mic input.

**Happy path:**
1. User opens `/visualizer`. Disconnected placeholder shows (concentric ellipses, "No audio connected").
2. User opens device dropdown, selects microphone.
3. Browser prompts for mic permission. User grants.
4. Canvas switches from placeholder to active visual reacting to audio.
5. Control bar auto-hides after 3s of pointer inactivity.

**Edge cases:**
- Permission denied → permission UI state, retry CTA, link to browser help.
- Permission previously blocked → explain how to re-enable in browser settings.
- Silent input → placeholder waveform or low-energy state, not a black screen.
- Clipping/unstable input → sensitivity slider visible; suggest lowering input gain.
- Unsupported browser capability → fallback message + supported browsers list.

**Success criteria:** Visual responds to mic audio within ~2s of grant; controls discoverable on hover.

---

## 5. User Switches Between Visuals

**Actor:** Authenticated user with audio connected.
**Goal:** Try different visuals to find one they like.

**Happy path:**
1. User clicks **Next** in the center control zone (or **Previous**).
2. Canvas crossfades to next curated visual.
3. Ticker updates with new visual name.
4. Hover watermark reflects new visual + category.

**Edge cases:**
- Shader load failure → fallback to default visual, error logged.
- Rapid Next presses → debounce or queue; no broken intermediate states.
- Keyboard `←`/`→` (desktop) → same behavior as buttons (if shortcuts confirmed).

**Success criteria:** Visual swap completes without dropping audio reactivity.

---

## 6. User Favorites a Visual

**Actor:** Authenticated user.
**Goal:** Save a visual for later.

**Happy path:**
1. On `/visualizer`, user clicks the heart in the control bar (or on a card in `/explore`).
2. Heart fills (`#7C5CFC`), `POST /favorites` (or equivalent) persists shader ID to user profile.
3. State syncs across `/visualizer`, `/explore`, `/favorites`.

**Edge cases:**
- Offline / network failure → optimistic UI rolls back, error toast.
- Duplicate favorite request → server idempotent; UI shows already-favorited.
- Unauthenticated attempt (shouldn't happen behind AuthRoute) → 401 → redirect to `/login`.

**Success criteria:** Favorite reflected immediately; persists across reload and devices.

---

## 7. User Browses My Favorites

**Actor:** Authenticated user with ≥1 favorite.
**Goal:** Revisit saved visuals.

**Happy path:**
1. User navigates to `/favorites`.
2. Grid of favorited visuals renders (4-col desktop, fewer on smaller screens).
3. User clicks a card → opens `/visualizer` with that visual active.
4. User can unfavorite from the card; item removes from grid.

**Edge cases:**
- Empty state → icon + "Explore Visuals" CTA → routes to `/explore`.
- Favorite references a visual no longer in the curated set → hide gracefully, don't crash.
- Slow favorites fetch → loading skeleton.

**Success criteria:** Favorites list matches profile data; navigation back-and-forth keeps state consistent.

---

## 8. User Explores the Global Visual Library

**Actor:** Authenticated user.
**Goal:** Discover new visuals.

**Happy path:**
1. User opens `/explore`.
2. User filters by tag pill (Abstract / Reactive / Geometric / Fluid / Shader).
3. User searches by name.
4. User sorts (e.g., newest, popularity).
5. User favorites or opens a visual on the visualizer.

**Edge cases:**
- No matches → empty state with "Reset filters" action.
- Slow API (>250ms target) → skeleton grid, no layout shift.
- Pagination at end → disable Next.

**Success criteria:** Filter + search + sort all combine correctly; pagination stable.

---

## 9. User Enters Fullscreen Immersive Mode

**Actor:** Authenticated user on `/visualizer` (desktop preferred).
**Goal:** Distraction-free playback.

**Happy path:**
1. User clicks fullscreen icon (right zone of control bar).
2. Browser enters Fullscreen API mode; navbar hides.
3. Controls remain reachable on pointer move; auto-hide after 3s idle.
4. User exits with Esc or fullscreen toggle.

**Edge cases:**
- Browser denies Fullscreen API → fallback to viewport-fill mode + message.
- Tab loses focus → audio + render continue (unless throttled by browser).
- Tablet/phone → labeled "Limited" — verify behavior or hide control on those breakpoints.

**Success criteria:** Canvas occupies entire viewport; exit returns to standard layout.

---

## 10. User Logs Out

**Actor:** Authenticated user.
**Goal:** End session.

**Happy path:**
1. User opens user modal (avatar + chevron in navbar).
2. Clicks **Log Out**.
3. App clears JWT + client state, redirects to `/`.

**Edge cases:**
- Logout while a request is in flight → cancel or ignore response.
- Multi-tab → other tabs detect token removal, redirect to `/login` on next protected action.

**Success criteria:** No protected route accessible after logout; refresh confirms.

---

## 11. JWT Expires Mid-Session

**Actor:** Authenticated user with stale token.
**Goal:** Recover gracefully without losing context.

**Happy path:**
1. User performs an action (e.g., favorite toggle).
2. API returns 401.
3. App attempts refresh (if supported) or redirects to `/login` with `returnTo`.
4. After re-auth, user returns to prior screen; pending action retried or surfaced.

**Edge cases:**
- Refresh token also expired → forced logout, clear toast.
- Multiple parallel 401s → single redirect, not a loop.

**Success criteria:** No silent failure; user understands why they were redirected.

---

## 12. User Adjusts Sensitivity to Match Audio Source

**Actor:** Authenticated user with mic connected.
**Goal:** Tune visual reactivity to current audio level.

**Happy path:**
1. User opens left zone of control bar.
2. Drags sensitivity slider (`#7C5CFC` thumb).
3. Visual reactivity updates live.

**Edge cases:**
- Extreme low → visual nearly static; show hint to raise sensitivity.
- Extreme high → visual saturates; show hint to lower.
- Setting persists per session (post-MVP: per user profile).

**Success criteria:** Slider change is reflected within one render frame; no audio stutter.

---

## 13. Responsive Use on Tablet / Phone

**Actor:** Mobile/tablet user.
**Goal:** Use core flows on smaller screens.

**Happy path:**
1. User signs up / logs in.
2. Browses `/explore` and `/favorites` (full functionality).
3. Visualizer renders with simplified controls; secondary controls collapse into "···" more menu.

**Edge cases:**
- Microphone unsupported on browser → labeled "Desktop preferred."
- Fullscreen restricted → hide control or label as Limited.
- Layout reflow at 768/375 breakpoints → no overlap, no horizontal scroll.

**Success criteria:** Auth, library browsing, favorites all fully usable; visualizer degrades gracefully.

---

## 14. Recovery from Failed Visual Load

**Actor:** Any authenticated user.
**Goal:** Continue using the app despite a single shader failure.

**Happy path:**
1. Shader fetch or compile fails.
2. App shows non-blocking error, falls back to a known-good default visual.
3. User can retry or pick another visual.

**Edge cases:**
- All visuals fail (network outage) → full error state with retry.
- Partial library failure → mark broken cards in `/explore` as unavailable.

**Success criteria:** No white screen; user always has a path forward.

---

## Prioritization for MVP QA

P0 (must work for launch): 2, 3, 4, 6, 7, 8, 11.
P1 (core polish): 1, 5, 9, 10, 14.
P2 (nice to have): 12, 13.
