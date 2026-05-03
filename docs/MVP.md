# MVP Architecture

## Product Goal

Sonix is a curated audio visualizer app. The MVP should let users sign in, connect a supported audio source, play reactive visuals, browse a visual library, and save favorite visuals.

## Core User Flows

1. Visit the landing page and understand the product value.
2. Create an account or log in.
3. Open the visualizer and connect an audio source.
4. Switch between visuals and optionally enter fullscreen mode.
5. Toggle a visual as a favorite; view saved favorites anytime.

## MVP Additional Documents

> These documents are not yet available. They will be added to `docs/` as the project progresses.

- API spec: `api-spec.md`
- Data models: `data-models.md`
- Release checklist: `release-readiness.md`
- Non-functional requirements: `non-functional-requirements.md`

## Frontend

### App Structure

- Build the app in React.
- Include a public landing page and an authenticated user area.
- Protect user-only routes with React Router and a JWT-backed `AuthRoute` pattern.
- Track auth, audio device state, playback state, current visual, and favorites in client state.

### Static Pages

The app contains the following routes:

| Route | Type | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/signup` | Public | Sign up |
| `/login` | Public | Log in |
| `/about` | Public | About Sonix |
| `/demo` | Public | Live visualizer demo _(not confirmed — may be added)_ |
| `/privacy` | Public | Privacy policy _(not confirmed — may be deferred)_ |
| `/terms` | Public | Terms of service _(not confirmed — may be deferred)_ |
| `/visualizer` | Authenticated | Main visualizer |
| `/explore` | Authenticated | Explore visuals / global library |
| `/favorites` | Authenticated | My favorited visuals |
| `/settings` | Authenticated | User settings |
| `/404` | Public | Error / not found |

- If `/privacy` and `/terms` are confirmed, public site pages should expose them in the footer so the legal pages are always reachable.
- `About` should remain part of the public marketing navigation rather than footer-only.

### Logo

- Logo mark: three horizontal bars of unequal length with fully rounded ends — reads as a waveform silhouette and a stylized "S" letterform.
- Color: primary accent `#7C5CFC`; the middle (longest) bar has a subtle `#00E5FF` right-end glow.
- Wordmark: "SONIX" in Inter 700, all caps, `#7C5CFC`, tracking 0.05em.
- Use icon + wordmark on public pages and standard authenticated nav; icon only on the visualizer nav and as favicon.

### Navbar Variants _(not confirmed — may be deferred)_

> This feature is not confirmed for MVP. Specs below are preserved for reference if it moves forward.

The navbar stays as consistent as possible across all pages. Variants exist only where layout context strictly requires a difference (e.g., the visualizer canvas needs maximum space). For a fully distraction-free experience, users can enter fullscreen mode.

| Variant | Pages | Content |
| --- | --- | --- |
| A — Public marketing | `/`, `/about`, `/404` | Logo lockup · center nav links (Features / About) · Log In ghost + Sign Up primary |
| B — Public minimal | `/signup`, `/login`, `/privacy`, `/terms` | Logo lockup only — no secondary nav |
| C — Authenticated standard | `/explore`, `/favorites`, `/settings` | Logo lockup (links to `/visualizer`) · user avatar + name + chevron (opens user modal) |
| D — Visualizer minimal | `/visualizer` | Logo icon only (no wordmark) · hamburger (opens side drawer) · user avatar icon only |

- Variant D is 48px tall; all others are 64px.
- User modal (all authenticated variants): avatar, name, Settings, Log Out. _(Keyboard Shortcuts entry not confirmed.)_
- Hamburger side drawer (Variant D only): links to Visualizer / Explore / My Favorites / Settings.

### Footer Variants _(not confirmed — may be deferred)_

> This feature is not confirmed for MVP. Specs below are preserved for reference if it moves forward.

Footer behavior is also context-aware and can vary by page type. Do not use a single shared footer across all routes.

| Variant | Pages | Content |
| --- | --- | --- |
| A — Public site footer | `/`, `/about`, `/404` | Optional legal links (`Privacy`, `Terms`) if those pages are confirmed · optional lightweight product links |
| B — Public auth / legal footer | `/signup`, `/login`, `/privacy`\*, `/terms`\* | Minimal footer; legal links can remain visible where useful, but should not compete with the main form or legal content |
| C — Authenticated app footer | `/explore`, `/favorites`, `/settings` | Optional compact app footer or no footer, depending on screen density |
| D — Visualizer immersive | `/visualizer` | No persistent marketing-style footer; preserve maximum canvas space and place secondary links inside drawers, menus, or overlays instead |

### Onboarding Tour _(not confirmed — may be deferred)_

> This feature is not confirmed for MVP. Specs below are preserved for reference if it moves forward.

- Trigger automatically on first login only; skip on all subsequent visits (stored in user preferences).
- Show only on the visualizer screen.
- Full-screen semi-transparent overlay; spotlit element has a `#7C5CFC` ring.
- Five steps targeting: device dropdown → play/pause button → Explore link → favorite (heart) button → fullscreen button.
- Each tooltip card: title, body, progress dots, Next button, "Skip tour" link.

### All Screens Are Responsive

- Desktop (1440px) is the canonical MVP experience and source of truth for layout and hierarchy.
- All screens must also support laptop (1280px), tablet (768px), and phone (375px).
- On smaller screens: stack columns, collapse sidebars into drawers, move secondary panels below primary content.
- The visualizer canvas remains the dominant element at all screen sizes.
- On tablet/phone the bottom control bar stacks into two rows or collapses secondary controls into a "···" more button.
- Features uncertain on smaller devices should be labeled "Desktop preferred" rather than silently removed.

### Animated Backgrounds

- Landing page hero: two slow-drifting radial gradient orbs (`#7C5CFC` top-right, `#00E5FF` bottom-left) at ~15% opacity — aurora breathing effect.
- Login and Sign Up: subtle animated particle field (20–30 small dots drifting upward, low density).
- Reduced-motion fallback: static backgrounds, no animation.

### Keyboard Shortcuts (Desktop Only)_(not confirmed — may be deferred)_

> This feature is not confirmed for MVP. Specs below are preserved for reference if it moves forward.

Keyboard shortcuts are only active on `/visualizer` in the MVP. Other pages may expose a "Keyboard Shortcuts" help entry, but should not bind the playback or visualizer control keys globally.

| Key | Action |
| --- | --- |
| Space | Play / Pause |
| F | Toggle fullscreen |
| S | Toggle shuffle |
| ← | Previous visual |
| → | Next visual |
| H | Toggle favorite |
| D | Open device selector |
| ? or K | Open keyboard shortcuts overlay |

- Every control bar button tooltip shows the hotkey inline: e.g. "Play  [Space]".
- Hotkey badge style: monospace 11px, surface bg, 2px border, 4px radius.
- `?` opens a keyboard shortcuts modal on `/visualizer` (two-column grid, grouped by category).
- The authenticated user modal can include a "Keyboard Shortcuts" item that opens the same reference modal, but only the visualizer route should register the actual shortcut bindings.
- Hotkeys and tooltip badges are not shown on tablet or phone.

### Visualizer Experience

- Support curated visuals built from shaders such as `*.glsl`, sourced from Shadertoy or Butterchurn.
- Render visuals with `canvas` or Three.js.
- Support microphone input in the MVP.
- Treat virtual or system audio routing as desktop-preferred and browser-dependent.
- Let users switch visuals, browse the library, favorite visuals, and use fullscreen mode.
- Keyboard shortcuts are a desktop enhancement, not a required cross-device feature.

### Visualizer Screen Layout

The goal is to give maximum viewport area to the visualizer canvas. Remove all sidebars.

- Nav behavior:
  - Use navbar Variant D only.
  - Navbar height is 48px.
  - Keep the navbar visually minimal: logo icon, hamburger, and user avatar only.
- Canvas layout:
  - The canvas starts immediately below the 48px navbar.
  - The canvas uses the full remaining viewport height and the full viewport width.
  - Do not render left or right sidebars on this screen.
  - Canvas background color is solid black.
- Default disconnected state:
  - When no audio source is connected, show a centered placeholder graphic.
  - The placeholder graphic uses concentric ellipses in `#7C5CFC` and `#00E5FF`.
  - Center a caption below or within the placeholder: `No audio connected`.
- Bottom control bar behavior:
  - Render the control bar as an overlay on top of the canvas, pinned to the bottom edge.
  - Do not reserve separate page layout height for the control bar.
  - Add a dark gradient behind the controls so they remain readable against the canvas.
  - When audio is connected, hide the control bar after 3 seconds of pointer inactivity.
  - When audio is disconnected, keep the control bar visible at all times.

**Control bar zones (left / center / right):**

- Left: audio input device dropdown (mic icon + device name + chevron) · sensitivity slider (replaces volume — 120px range slider, `#7C5CFC` thumb and filled track).
- Center: shuffle · previous · play/pause (48px circle, primary accent, dominant control) · next · favorite (heart).
- Right: fullscreen icon.

**Additional canvas elements:**

- Ticker / marquee: 28px strip pinned just above the control bar inside the canvas, scrolling text showing current visual name, audio device, and playback status.
- Hover watermark: bottom-left of canvas, appears on cursor hover outside the control bar zone, shows visual name, category pill, and short description.

### Explore Visuals Screen

- Global visual library — all visuals across all tiers.
- Filter row: search input, tag pills (All / Abstract / Reactive / Geometric / Fluid / Shader), sort dropdown.
- 4-column card grid (desktop). Each card shows thumbnail, category pill, visual name, heart icon (filled if favorited).
- Pagination at the bottom.

### My Favorites Screen

- Simple grid of the user's favorited visuals (shader IDs stored on user profile).
- 4-column card grid (desktop). Each card shows thumbnail, category pill, visual name, filled heart icon.
- "Unfavorite" action available on each card (removes from list).
- Empty state: icon + message + "Explore Visuals" CTA.

> **Playlists are post-MVP.** The separate playlist API, playlist-user-shader associations, and CRUD flows are deferred. Favorites replace playlists for MVP: a simple array of shader IDs stored directly on the user profile.

### Device Capability Matrix

| Feature | Desktop/Laptop | Tablet | Phone | Notes |
| --- | --- | --- | --- | --- |
| Auth and account management | Full | Full | Full | Same core flow everywhere |
| Visual library browsing | Full | Full | Full | Filters can collapse on smaller screens |
| Favorites (view/toggle) | Full | Full | Full | Simple heart toggle, no complex interactions |
| Live visualizer playback | Full | Limited | Limited | Keep controls simpler on smaller screens |
| Microphone input | Full | TBD | TBD | Needs browser and device testing |
| Virtual/system audio input | Desktop-preferred | Not in MVP | Not in MVP | Browser and OS dependent |
| Fullscreen immersive mode | Full | Limited | Limited | Device and browser behavior will vary |
| Keyboard shortcuts | Not confirmed | Not in MVP | Not in MVP | Desktop convenience only — feature not confirmed |

### Required UI States

- Loading: auth checks, visual library fetch, favorites fetch, visualizer initialization
- Empty: no favorites yet, no visuals matching filters
- Permission: microphone access requested, denied, or previously blocked
- Audio: no source connected, source disconnected, silent input, clipping or unstable input
- Error: unsupported browser capability, failed visual load, failed save action
- Recovery: retry action, change device action, reset filters action, return to safe default visual

## Release Readiness Checklist

- Feature QA
  - [ ] Login/signup (happy + invalid flows)
  - [ ] Auth route guard for /visualizer, /explore, /favorites, /settings
  - [ ] Visualizer placeholder, mic grant/deny, controls, fullscreen
  - [ ] Explore filter/tags/search/pagination
  - [ ] Favorites toggle (add/remove) + empty state

- API / Backend
  - [ ] Auth endpoints issue tokens and handle expiry
  - [ ] Visual list filters and pagination
  - [ ] Favorites GET/POST/DELETE (stored as shader ID array on user profile)
  - [ ] 500 and network error UI fallback

- Stability / Performance
  - [ ] /visualizer render ≤2s on desktop target
  - [ ] /explore API response ≤250ms
  - [ ] mic denied path retry available
  - [ ] shader load fallback path handles failures

- Security
  - [ ] Protected endpoints block unauthenticated access
  - [ ] JWT verification and refresh/expiry handling
  - [ ] Input validation for signup and write payloads
  - [ ] CORS + Helmet middleware enabled

- Accessibility
  - [ ] Keyboard nav for all controls + modal traps
  - [ ] Color contrast WCAG AA
  - [ ] Screen-reader labels for controls and tour
  - [ ] Reduced motion preference respected

- Observability
  - [ ] API and UI errors logged
  - [ ] Analytics events for visual_play, favorite_add
  - [ ] Crash/failure tracking (Sentry or equivalent)

- Regression
  - [ ] E2E: signup -> visualizer -> favorite a visual -> logout
  - [ ] E2E: explore filter and visual view
  - [ ] E2E: favorite toggle reflects correctly in /explore and /favorites

- Deploy readiness
  - [ ] Env var config documented
  - [ ] DB seed pipeline created for visual dataset
  - [ ] Release notes with known limitations
  - [ ] Rollback/rollback plan documented (backup/PITR)

## Backend

### General Overview

- Use a Node.js backend with MongoDB.
- Implement simple JWT-based authentication.
- Define core data models for `Users` and `Visuals`. Favorites are a simple array of shader IDs stored directly on the `User` document — no separate collection needed.
- Add baseline security middleware such as CORS and Helmet.
- Seed the selected curated visuals into the database.
- Provide API documentation with Swagger or Postman.

### Suggested Backend Responsibilities

- Persist user accounts, favorites (as a `favoriteIds` array on the user profile), and visual metadata.
- Store curated visual metadata such as title, category, tags, source, and performance cost.
- Expose APIs for auth, favorites, and visual browsing.

> **Playlists are post-MVP.** Do not build a playlist API, playlist model, or playlist-user-shader associations for the initial release.

## Product Rules

- Desktop is the canonical MVP experience.
- Dark theme is the default MVP presentation.
- The MVP should prioritize a polished curated library over user-generated content.
- If a feature is uncertain on smaller devices, label it as simplified or desktop-preferred instead of implying full parity.

## Stretch Goals

- Demo mode timer — unauthenticated visitors can use the visualizer for 5–10 minutes before a "Sign up to continue" banner appears. Banner is non-blocking (can be dismissed temporarily) but reappears after another interval. Does not apply to logged-in users.
- Playlists — post-MVP feature; separate API, playlist model, and playlist-user-shader associations. UI entry points (e.g., an "Add to Playlist" button) can be stubbed with a "Coming soon" tooltip.
- AI visual generation — appears in the Explore Visuals screen as a special card at the top of the grid with a "Coming Soon" overlay pill. Tooltip: "Describe a visual and AI generates it live — coming soon."
- Google and Facebook authentication
- Light theme and appearance toggle
- Shuffle playback
- Visual library previews
- Expanded Butterchurn libraries
- Reactive typography (letters that change background in real time) — represented as a single "Reactive Text" visual card in the library with a "Preview" button; no full feature spec required for MVP

## Over-Stretch Goals

- Live streaming — broadcast the visualizer session to platforms such as Twitch or YouTube Live directly from the app
