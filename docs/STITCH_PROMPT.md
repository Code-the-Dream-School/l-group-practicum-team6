# Sonix Stitch Prompt

The key to consistency is front-loading every design decision so Stitch has no room to improvise.

## Prompt

```text
Design a web application called Sonix — an audio visualizer platform where users connect audio sources and watch real-time visual effects synchronized to the sound.

---

GLOBAL CONSTRAINTS (apply to every single screen without exception)
- Never invent colors outside the approved palette below
- Never use font sizes outside the type scale below
- Never use spacing values outside the spacing scale below
- Never use a design pattern on one screen that contradicts another screen
- Desktop is the canonical product definition and source of truth for layout, hierarchy, and functionality
- Primary artboards should be 1440px wide, 900px tall
- The navigation bar is context-aware — its content varies by page type (see NAV VARIANTS); authenticated screens do NOT all share the same nav layout
- Footer behavior is also context-aware — do not apply one footer pattern to every page
- The visualizer screen uses a minimal 48px nav to maximize canvas space; all other authenticated screens use a standard 64px nav
- Dark theme is the only required MVP presentation
- Authenticated app screens use #0A0A0F background (unless page specifies animated background)
- ALL screens must be responsive — provide layout notes for desktop (1440px), laptop (1280px), tablet (768px), and phone (375px)

PINNED COMPONENT RULES (critical to enforce — violations break the spec)
- User avatar is ALWAYS a 32px circle with gradient fill #7C5CFC→#00E5FF (purple to cyan). Never a photograph, illustration, or solid color.
- Visualizer nav (Variant D): logo icon ONLY — no wordmark. Hamburger and avatar belong on the RIGHT side, not left.
- Visualizer nav (Variant D): user avatar on right has NO chevron, NO username text, no dropdown indicator.
- Playlist and session names (e.g., "Late Night Sessions", "Bass Heavy") NEVER appear in MVP screens — not in control bar, tickers, nav, or badges. They are deferred post-MVP features.
- Visualizer ticker / marquee shows exactly: "Aurora Wave  ●  Microphone — Built-in  ●  Now Playing" — single segment, no repeats, no playlist names. Font: 12px / 400, text-secondary, letter-spacing 0.02em.
- Hamburger nav on /visualizer: icon on RIGHT (not left), opens side-drawer from left edge.

---

DESIGN SYSTEM

Dark theme palette (default and canonical):
- Background:       #0A0A0F
- Surface:          #12121A  (cards, panels, sidebars)
- Surface elevated: #1C1C28  (dropdowns, tooltips, active states)
- Primary accent:   #7C5CFC  (electric purple — primary buttons, active borders, focus rings)
- Secondary accent: #00E5FF  (cyan — secondary highlights, tags, waveform details)
- Text primary:     #F0F0FF
- Text secondary:   #8888AA
- Error:            #FF4D6D
- Success:          #00D68F
- Border:           #2A2A3D
- Overlay:          rgba(10, 10, 15, 0.8)  (modal backdrops, canvas overlays)

Typography (Inter font family, all weights):
- Display: 48px / 700 / letter-spacing -0.02em
- H1:      32px / 600 / letter-spacing -0.01em
- H2:      24px / 600
- H3:      18px / 500
- Body:    14px / 400 / line-height 1.6
- Caption: 12px / 400 / text-secondary color

Spacing scale (4px base unit — use only these values):
4, 8, 12, 16, 24, 32, 48, 64, 96, 128

Layout grid:
- 12-column grid
- Column gutter: 24px
- Outer margin: 80px on each side
- Max content width: 1280px, centered

Responsive strategy:
- Design desktop first, then adapt the same product system to laptop, tablet, and phone
- ALL screens must be responsive — never produce a desktop-only design
- On smaller screens, stack columns, collapse sidebars into drawers or sheets, and move secondary panels below primary content
- The visualizer canvas remains the dominant element on all screen sizes
- On tablet/phone, the bottom control bar stacks into two rows or collapses secondary controls into a "More" menu
- If a feature is uncertain on smaller screens, label it "Desktop preferred" rather than silently removing it
- Do not assume microphone routing, virtual audio input, fullscreen behavior, or keyboard shortcuts work on all devices
- Preserve the same visual language, typography, colors, spacing, and component rules across all breakpoints

Theme scope:
- Dark theme is the default MVP presentation and the only required artboard theme
- Do not generate light-theme artboards or an active appearance toggle in the MVP screens
- If stretch-goal states are shown, light theme can appear only as a future concept, not an active setting

Tailwind implementation constraints:
- This product will be implemented in React with Tailwind CSS
- Design every screen to map cleanly to reusable React components and Tailwind utility classes
- Prefer repeated token values over one-off spacing, sizing, or radius decisions
- Favor layout patterns that can be built with flex, grid, gap, padding, max-width, and responsive breakpoints
- Reuse the same button, input, card, tag, and navigation patterns across all screens
- Keep decorative effects layered on top of simple layout structure rather than requiring highly custom CSS
- Use shared component values and variants that map directly to Tailwind theme values or CSS variables

Accessibility and usability rules:
- Maintain WCAG AA contrast for body text, controls, borders, and focus states
- Never rely on color alone to communicate status; always pair color with labels, icons, or helper text
- All interactive controls must have visible keyboard focus on desktop
- Minimum touch target for tablet and phone: 44×44px
- Respect reduced-motion preferences by reducing ambient animation, glows, and non-essential movement

Border radius:
- Small (inputs, buttons, list items): 8px
- Medium (cards, panels):              12px
- Large (modals, feature panels):      16px
- Pill (tags, badges, avatars):        999px

Elevation / glow (no traditional drop shadows):
- Resting:  none
- Hover:    0 0 12px rgba(124, 92, 252, 0.25)
- Active:   0 0 20px rgba(124, 92, 252, 0.45)
- Cyan glow (secondary): 0 0 12px rgba(0, 229, 255, 0.2)

Iconography:
- Style: line icons, 1.5px stroke
- Size: 16px inline, 20px standalone, 24px nav/action

---

LOGO

Logo mark:
- Shape: three horizontal bars of unequal length (short / long / medium, top to bottom), each with fully rounded ends — reads as a waveform silhouette and as a stylized "S" letterform
- Colors: all three bars in primary accent #7C5CFC; the longest (middle) bar has a subtle #00E5FF right-end glow
- The three bars have 4px vertical spacing between them; bar height is 4px each
- The overall icon bounding box is approximately 20×20px at nav size

Wordmark:
- "SONIX" in Inter 700, all caps, #7C5CFC, tracking 0.05em
- Always rendered in the same color as the icon — never split colors between icon and wordmark

Combined lockup (icon + wordmark):
- 8px gap between icon and wordmark
- Use on: public pages, standard authenticated nav

Icon only (no wordmark):
- Use on: visualizer nav (minimized), favicon, mobile nav
- Never distort, recolor, or add effects beyond the defined glow

Usage sizes:
- 16px icon height — favicon / tab icon
- 24px icon height — visualizer nav (icon-only mode)
- 32px icon height with wordmark — standard nav, card headers

---

STATIC PAGES

The application contains the following pages:
1.  /           — Landing page (public)
2.  /signup     — Sign up (public)
3.  /login      — Log in (public)
4.  /about      — About Sonix (public)
5.  /demo       — Live visualizer demo (public)
6.  /visualizer — Main visualizer (authenticated)
7.  /explore    — Explore visuals / global library (authenticated)
8.  /favorites  — My favorited visuals (authenticated)
9.  /settings   — User settings (authenticated)
10. /404        — Error / not found (public)

Route rules:
- About should remain part of the public marketing navigation rather than footer-only

---

ANIMATED BACKGROUNDS

Landing page hero:
- Two large radial gradient orbs — one #7C5CFC (top-right corner) and one #00E5FF (bottom-left corner) — at ~15% opacity against #0A0A0F
- Animation: the orbs drift slowly (20–30s full cycle), shifting position by ~5–8% and oscillating in opacity between 10–20% — smooth, looping
- Effect reads as a slow aurora breathing effect; remains dark and moody, not bright
- Reduced-motion fallback: static gradient, no animation

Login and Sign Up pages:
- Background: #0A0A0F base
- Subtle animated particle field: 20–30 small dots (1–2px diameter, #8888AA color, 25% opacity) drifting slowly upward with slight horizontal drift, low density, random placement
- Dots loop seamlessly when they exit the top edge
- Reduced-motion fallback: static #0A0A0F background, no particles

---

INTERACTION STATES (apply consistently to every component across all screens)

Buttons — primary:
- Default:   #7C5CFC background, #F0F0FF text, no border
- Hover:     #9070FF background, purple glow
- Active:    #5E40D9 background, deeper glow
- Disabled:  #2A2A3D background, #8888AA text, no glow, cursor not-allowed

Buttons — ghost:
- Default:   transparent background, 1px #F0F0FF border, #F0F0FF text
- Hover:     rgba(255,255,255,0.08) background
- Active:    rgba(255,255,255,0.15) background
- Disabled:  1px #2A2A3D border, #8888AA text

Buttons — icon-only:
- Default:   transparent, text-secondary icon
- Hover:     surface-elevated background, text-primary icon
- Active:    primary accent icon, purple glow

Input fields:
- Default:   surface background, 1px #2A2A3D border, text-primary; placeholder in text-secondary
- Focus:     2px #7C5CFC border (replaces 1px), no glow
- Error:     2px #FF4D6D border, error-colored helper text below
- Disabled:  surface background, #2A2A3D text, cursor not-allowed

Cards:
- Default:   surface background, 1px #2A2A3D border
- Hover:     surface-elevated background, 1px rgba(124, 92, 252, 0.4) border, purple glow

Sidebar items / list rows:
- Default:   transparent background
- Hover:     surface-elevated background
- Active:    surface-elevated background, 3px left border in #7C5CFC

Nav links (top bar):
- Default:   text-secondary
- Hover:     text-primary
- Active:    text-primary, 2px underline in #7C5CFC

Tags / pills:
- Default:   surface-elevated background, text-secondary
- Selected:  #7C5CFC background, #F0F0FF text

---

COMPONENT SPECIFICATIONS

NAV VARIANTS

The navbar stays as consistent as possible across pages. Variants exist only where layout context strictly requires it. For a fully distraction-free visualizer experience, users can enter fullscreen mode — no need for more nav variants.

Variant A — Public marketing (landing, about):
- Height: 64px
- Background: surface #12121A, 1px bottom border #2A2A3D
- Left: logo lockup (icon + wordmark)
- Center: nav links "Features / About" in body text, text-secondary; active link has #7C5CFC underline
- Right: "Log In" ghost button (32px) + "Sign Up" primary button (32px), 12px gap between

Variant B — Public minimal (login, signup):
- Height: 64px, same background
- Left: logo lockup only
- Center: empty
- Right: empty
(The form is the page — no secondary navigation needed)

Variant C — Authenticated standard (explore, favorites, settings):
- Height: 64px, same background
- Left: logo lockup (links to /visualizer)
- Center: empty
- Right: user avatar (32px circle, gradient fill #7C5CFC→#00E5FF) + "Alex Rivera" (body text) + chevron-down icon; clicking opens user modal

Variant D — Visualizer (maximized canvas, minimal chrome):
- Height: 48px
- Background: surface #12121A, NO bottom border (reduces visual separation from canvas)
- Left: logo icon ONLY (24px height, NO wordmark, links to /visualizer)
- Center: empty
- Right (16px from edge): hamburger/menu icon (24px, text-secondary) + 16px gap + user avatar icon (32px circle, gradient fill #7C5CFC→#00E5FF, NO chevron, NO username text)
- Hamburger opens a side-drawer nav; user avatar opens the user modal
- CRITICAL: Logo must never include wordmark on /visualizer. Hamburger must be on right side, not left. Avatar is gradient-filled circle only.

User modal (opened from user avatar in Variant C and D):
- Floating panel, 240px wide, right-aligned below trigger, 8px from right edge
- Surface-elevated background, 16px radius, 8px inner padding, 1px #2A2A3D border, purple glow
- Top row: avatar (32px) + name (body/500)
- 1px #2A2A3D divider, 8px below top row
- Menu items (36px each, icon left + label, sidebar interaction states):
  - Settings — gear icon
  - 1px divider
  - Log Out — exit icon, #FF4D6D text color

Hamburger side-drawer (Variant D only):
- Width: 240px, slides in from left, surface background, 1px right border #2A2A3D
- Items: Visualizer / Explore / My Favorites / Settings — sidebar interaction states
- Closes on backdrop click or Escape key

FOOTER VARIANTS

Variant A — Public site footer (landing, about, 404):
- Height: 64px
- Background: surface #12121A, 1px top border #2A2A3D
- Left: "© 2025 Sonix" — caption, text-secondary
- Right: optional lightweight product links such as "About"; caption text, text-secondary, 24px gaps

Variant B — Public auth footer (login, signup):
- Minimal footer treatment; do not let it compete with the main form or document content
- Can be a centered caption row, 48px tall, text-secondary

Variant C — Authenticated app footer (explore, favorites, settings):
- Default to no persistent footer unless the screen needs one for layout balance
- If shown, keep it compact, secondary, and non-marketing in tone

Variant D — Visualizer immersive (/visualizer):
- No persistent footer
- Preserve maximum canvas space; place any secondary links inside drawers, menus, or overlays instead

Buttons:
- Height: 40px default, 32px small, 48px large
- Horizontal padding: 16px default, 12px small, 24px large
- Border radius: 8px
- All caps: no
- Font: 14px / 500

Input fields:
- Height: 40px
- Horizontal padding: 12px
- Border radius: 8px
- Label: 12px / 500 / text-secondary, 6px above field

Dropdown menus:
- Surface-elevated background, 1px #2A2A3D border, 8px radius, 8px inner padding
- Each option: 36px height, 12px horizontal padding, body text
- Option hover: surface color background
- Selected option: accent purple text, checkmark icon on right

Cards:
- Border radius: 12px
- Inner padding: 16px
- Thumbnail aspect ratio: 16:9

Tags / pills:
- Vertical padding: 4px, horizontal padding: 10px
- Border radius: 999px
- Font: 12px / 500

Tooltip component:
- Background: surface-elevated, 1px #2A2A3D border, 8px radius, 8px vertical / 12px horizontal padding
- Font: 12px / 400, text-primary
- Appear delay: 400ms; hide: instant
- Position: above target by default; auto-flip if near viewport edge

Scrollbars (all scrollable regions):
- Width: 4px
- Track: transparent
- Thumb: #2A2A3D, 999px radius
- Thumb hover: #7C5CFC

Behavior and state rules:
- Every major screen should feel designed for loading, empty, success, and error states
- Visualizer default state: no audio connected yet — show placeholder canvas with caption
- Visualizer permission state: clear microphone-access prompt, primary action, short helper text
- Visualizer denied state: explain audio access was blocked; offer retry or change-device actions
- Audio-disconnected state: preserve selected visual, pause reactivity, show non-destructive notice
- Visual library empty-search state: "No visuals match your filters" with a reset-filters action
- Favorites empty state: encourage exploring visuals and hearting them rather than showing a blank list
- On tablet and phone, uncertain features may be labeled "Desktop preferred" instead of being silently removed

---

SCREENS

1. LANDING PAGE  (public, /)

Nav: Variant A
Footer: Variant A

Hero section (100vh, full-bleed):
- Animated mesh gradient background (see ANIMATED BACKGROUNDS)
- Centered content column, max 640px wide, vertically centered
- Headline: "See Your Sound" — Display size, text-primary
- Subheadline: "Connect any audio source and watch it come alive." — H3, text-secondary, 16px below headline
- CTA group 24px below subheadline: "Get Started" primary button (large) + "See a Demo" ghost button (large), 12px gap
- Visual preview card: 480×270px, positioned 48px below the CTA group, centered; shows Aurora Wave placeholder (concentric ellipses in purple/cyan on black), 16px radius, subtle purple glow border, slight drop-behind effect

Features section:
- Background: #0A0A0F, 96px vertical padding
- Section label: "BUILT FOR" — caption, text-secondary, letter-spacing 0.12em, centered
- Section title: "Everything your ears see" — H1, centered, 12px below label
- 3-column grid, 24px gutter, within layout grid
- Each card: surface background, 1px #2A2A3D border, 12px radius, 24px padding; 48px icon (line, accent purple); H3 title 16px below icon; body text (text-secondary) 8px below title
- Card hover: purple glow, surface-elevated bg, 1px rgba(124,92,252,0.4) border
- Feature content:
  1. Icon: waveform / "Real-time Visuals" — "Every beat, every frequency rendered live. Zero latency between your audio and the screen."
  2. Icon: mic / "Microphone Input" — "Use any microphone, line-in, or virtual audio source. Works with your DAW, mixer, or just your voice."
  3. Icon: heart / "Save Favorites" — "Heart any visual to save it instantly. Your favorites are always one tap away."

Use Cases section:
- Background: #0A0A0F, 96px vertical padding
- Section label: "HOW PEOPLE USE SONIX" — caption, text-secondary, letter-spacing 0.12em, centered
- Section title: "Made for every stage" — H1, centered, 12px below label
- 2×2 card grid (desktop), 24px gap, within layout grid
- Each card: full-column width, 4:3 aspect ratio, overflow hidden, 12px radius
  - Background: unique dark radial gradient per card (purple/cyan combos against near-black); no photographs
  - Content (bottom-left aligned, 24px padding): category badge pill (surface-elevated, text-secondary) at top-left of card interior; H2 title; body text (text-secondary); 8px between each element
  - Card hover: scale(1.01), brighter purple glow border
- Use case content:
  1. "Live Performance" — "From the stage to the screen" — "Sync Sonix to your PA system for real-time visuals during DJ sets, live shows, and concerts."
  2. "Streaming" — "Make your stream unforgettable" — "Add a reactive visual layer to Twitch or YouTube broadcasts. No extra hardware required."
  3. "Meditation & Focus" — "Sound made visible, stress made small" — "Pair ambient audio with slow reactive visuals to create calming environments for study or meditation."
  4. "Events & Venues" — "Fill the room with sound and light" — "Drive large-format displays at clubs, galleries, and events using Sonix on any laptop."

- Footer uses Variant A with legal links visible and optional lightweight product links

---

2. ABOUT PAGE  (public, /about)

Nav: Variant A
Footer: Variant A

Page content below nav, within layout grid, 80px top padding:
- Hero section:
  - Section label: "ABOUT SONIX" — caption, text-secondary, letter-spacing 0.12em
  - Title: "A curated visualizer for sound-led experiences" — H1, text-primary, max 720px
  - Intro body copy: "Sonix helps performers, streamers, and creators turn live audio into polished realtime visuals without building a custom VJ setup." — H3, text-secondary, 16px below title, max 760px
- Story section, 48px below hero:
  - Two-column layout, 24px gap
  - Left card: "What Sonix does" — H2 + body copy about connecting an audio source, choosing visuals, and saving favorites
  - Right card: "Why it exists" — H2 + body copy about reducing setup friction and focusing on a curated, reliable visual library
  - Both cards: surface background, 1px #2A2A3D border, 16px radius, 24px padding
- Principles row, 48px below story section:
  - Three cards in a 3-column grid
  - Card titles: "Curated visuals", "Built for performance", "Simple to control"
  - Each card includes a line icon, H3 title, and short body text
- Closing CTA section, 64px below principles:
  - H2: "Explore the library"
  - Supporting copy in body text
  - CTA: "Get Started" primary button

---

3. SIGN UP SCREEN  (public, /signup)

Nav: Variant B
Footer: Variant B
Background: #0A0A0F with animated particle field (see ANIMATED BACKGROUNDS)

- Centered card, 480px wide, surface background, 1px #2A2A3D border, 16px radius, 48px padding
- Logo lockup (icon + wordmark) centered at top of card
- "Create your account" — H1, 24px below logo
- Form fields stacked, 16px gap: Full Name, Email Address, Password, Confirm Password
- Labels above each field
- Password fields: show/hide eye icon inside input, right-aligned, icon-only button
- "Sign Up" primary button, full width, 48px height, 24px below last field
- "Already have an account? Log In" — body text, centered, 16px below button; "Log In" in accent purple

---

4. LOG IN SCREEN  (public, /login)

Nav: Variant B
Footer: Variant B
Background: same animated particle field as Sign Up

- Same card layout (480px wide, same padding, same border treatment)
- Logo lockup centered at top
- "Welcome back" — H1
- Form fields: Email Address, Password
- "Forgot password?" — caption, text-secondary, right-aligned, 4px below Password field
- "Log In" primary button, full width, 48px height
- "Don't have an account? Sign Up" — body text, centered below button; "Sign Up" in accent purple

---

5. MAIN VISUALIZER SCREEN  (authenticated, /visualizer)

Nav: Variant D (48px, icon-only)
Footer: Variant D (none)

Goal: give maximum viewport area to the visualizer canvas. No sidebars. No static panels.

Layout stack (top to bottom, fills 1440×900):
- Nav bar: 48px
- Canvas layer: 852px tall × 1440px wide (fills all remaining viewport)
  - Bottom control bar is a semi-transparent overlay at the bottom of the canvas — NOT a separate layout row

Canvas:
- Fills 1440×852px below the nav
- Background: #000000
- Default state: three concentric ellipses in accent purple (#7C5CFC) and cyan (#00E5FF), fading toward center — suggesting audio waveform
- No audio connected caption: "No audio connected" in caption text, text-secondary, bottom-center of canvas

Hover watermark:
- Appears when cursor hovers the canvas and is NOT within the bottom 100px (control bar zone)
- Position: bottom-left of canvas, 16px from bottom, 16px from left edge
- Card: 200px wide, rgba(28,28,40,0.9) background with backdrop-blur, 12px radius, 16px padding, 1px #2A2A3D border
- Content: visual name "Aurora Wave" (body/600, text-primary) + "Abstract" category pill (secondary accent) 6px below + "Shader-based aurora field" (caption, text-secondary) 4px below pill
- Animation: fades in over 200ms on hover; fades out 500ms after cursor leaves canvas area

Ticker / visual marquee:
- 28px height strip, full canvas width
- Position: within canvas, pinned just above the bottom control bar overlay
- Background: linear-gradient(to top, rgba(10,10,15,0.7), transparent)
- Content: EXACTLY "Aurora Wave  ●  Microphone — Built-in  ●  Now Playing" — single segment, NEVER repeating the phrase, NEVER including playlist names
- Font: 12px / 400, text-secondary, letter-spacing 0.02em
- Animation: continuous left-to-right marquee scroll at slow speed (60–80s full cycle); pauses on hover
- Auto-hides with the control bar; visible whenever cursor moves

Bottom control bar (canvas overlay):
- Height: 72px
- Position: absolute, pinned to bottom of canvas, full 1440px width
- Background: linear-gradient(to top, rgba(10,10,15,0.97) 60%, transparent)
- Visibility: fades in on cursor movement; fades out after 3s of inactivity; always visible when audio is disconnected; never hides in reduced-motion mode
- 1px top separator line at the opaque zone: #2A2A3D at 40% opacity

Control bar inner layout (24px outer padding, vertical center-aligned):
- Left zone (~380px):
  - Device dropdown button: mic icon + "Microphone — Built-in" (body, text-primary, max 160px, truncate) + chevron-down; 40px height, surface-elevated bg, 1px #2A2A3D border, 8px radius; tooltip: "Audio Input"; opens dropdown of available input devices
  - 16px gap
  - Sensitivity control: "Sensitivity" label (caption, text-secondary) 4px above a 120px horizontal range slider; thumb: 14px circle in #7C5CFC; filled track: #7C5CFC; unfilled track: #2A2A3D; tooltip: "Input Sensitivity"

- Center zone (~680px, content horizontally centered):
  - Shuffle toggle (icon-only, 20px) — tooltip: "Shuffle"; active state: primary accent icon with purple glow
  - 16px gap
  - Previous (icon-only, 20px) — tooltip: "Previous"
  - 16px gap
  - Play/Pause (48px circle button, primary accent bg, #F0F0FF icon, purple glow) — tooltip: "Play / Pause"; currently shows pause icon (auto-switching every 10s is active); this is the most prominent control
  - 16px gap
  - Next (icon-only, 20px) — tooltip: "Next"
  - 16px gap
  - Favorite / heart (icon-only, 20px) — unfilled = not favorited; filled cyan = favorited; tooltip: "Favorite"

- Right zone (~380px, right-aligned):
  - Fullscreen (icon-only, 24px) — tooltip: "Fullscreen"

Z-index layering (back to front):
1. Canvas (#000000 background and visual content)
2. Hover watermark (canvas layer)
3. Ticker / marquee strip
4. Bottom control bar overlay
5. Visualizer nav bar
6. Modals, dropdowns, tour overlay

Responsive notes:
- Tablet: control bar stacks into two rows (row 1: playback center controls; row 2: device + sensitivity + right-zone icons); canvas scales to full available width
- Phone: canvas is full screen; control bar auto-hides more aggressively; device selector collapses into a "···" more button

---

6. EXPLORE VISUALS SCREEN  (authenticated, /explore)

Nav: Variant C
Footer: Variant C (default omitted)

This is the global visual library — all available visuals.

Page content below nav, 64px top padding, within layout grid (80px margins):
- Page title "Explore Visuals" — H1, left-aligned
- Filter row 24px below title:
  - Search input (240px): magnifier icon inside, placeholder "Search visuals…"
  - Tag pill row 16px to the right: "All" (selected default) / "Abstract" / "Reactive" / "Geometric" / "Fluid" / "Shader" — selected pill uses primary accent bg; unselected uses surface-elevated
  - Sort dropdown far right: "Most Popular" (options: Most Popular / Newest / A–Z)
- 4-column grid 32px below filter row, 24px gap
- Each visual card (12px radius, surface background, 1px #2A2A3D border):
  - Thumbnail: 16:9, dark diagonal gradient placeholder (purple to cyan); 12px radius on top corners
  - Preview label: caption pill top-left of thumbnail (surface-elevated, text-secondary) — e.g., "Abstract"
  - Card body (16px padding): visual name (body/600) + heart icon right-aligned (filled = favorited); category pill 8px below name
  - Card hover: surface-elevated bg, 1px rgba(124,92,252,0.4) border, purple glow; "Preview" primary button (small) centered over thumbnail as overlay
- Pagination row at bottom: ← / 1  2  3 ... / → — centered, caption text, 48px vertical padding; current page pill in accent purple

---

7. MY FAVORITES SCREEN  (authenticated, /favorites)

Nav: Variant C
Footer: Variant C (default omitted)

This is the user's personal library of favorited visuals.

Page content below nav, 64px top padding, within layout grid:
- Header row: "My Favorites" (H1, left)
- 4-column grid 32px below header, 24px gap
- Each visual card (12px radius, surface background, 1px #2A2A3D border): identical style to Explore grid; filled heart icon indicates favorited state; unfavorite action on hover (heart icon toggles to remove)
- Card hover: surface-elevated bg, purple glow border; heart icon tooltip: "Remove from Favorites"
- Lazy loading: "Load more" ghost button centered below the grid after initial 8 cards; auto-loads on scroll

Empty state (no favorites):
- Centered: heart icon (48px, text-secondary) + "No favorites yet" (H3) + "Browse the visual library and heart the ones you love." (body, text-secondary) + "Explore Visuals" primary button

---

8. USER SETTINGS  (authenticated, /settings)

Nav: Variant C
Footer: Variant C (default omitted)

Full-page layout (not modal). Standard page scroll.

Two-column layout within layout grid, 48px top padding:
- Left sidebar: 200px wide, surface background, 1px right border #2A2A3D, 24px padding
  - Section heading "Settings" — H3, 16px bottom margin
  - Nav items (sidebar interaction states): Profile / Account
- Main content panel: fills remaining width, 48px horizontal padding

Profile section:
- Avatar (80px circle, gradient fill) + "Change photo" caption link 8px below
- "Display Name" input + "Email Address" input, 16px gap
- "Save Changes" primary button, left-aligned, 24px below inputs

Account section:
- "Change Password" heading — H3
- "Current Password" input, "New Password" input, "Confirm Password" input, 16px gap between
- "Update Password" primary button, 24px below inputs
- "Delete Account" — destructive ghost button (1px #FF4D6D border, #FF4D6D text), positioned 48px below "Update Password"; clicking requires a confirmation modal

---

9. ERROR / 404 PAGE  (public, /404)

Nav: Variant A
Footer: Variant A

- Vertically and horizontally centered content, fills viewport
- "404" — Display size (48px/700), #7C5CFC at 40% opacity
- "This page doesn't exist" — H1, text-primary, 16px below
- "The page you're looking for has been moved or never existed." — body, text-secondary, 8px below
- Button group 24px below: "Go Home" primary button + "Explore Visuals" ghost button, 12px gap

---

STRETCH FEATURES (represent in design as future/coming-soon states, not fully interactive)

Demo mode timer:
- Unauthenticated visitors can use the visualizer for 5–10 minutes; after the timer expires a "Sign up to continue" banner appears
- Banner: full-width, surface-elevated background, 1px #2A2A3D border, pinned to the top of the canvas; body copy: "You've been visualizing for 5 minutes — sign up free to keep going."; CTA: "Sign Up" primary button + "Dismiss" ghost button (hides banner for a short interval before reappearing); does not block the canvas
- Banner does not appear for authenticated users

Playlists (post-MVP):
- Stub the "Add to Playlist" entry point in the control bar right zone as a disabled (+) icon button with tooltip "Add to Playlist — coming soon"
- No playlist modal, no /playlists or /playlists/:id routes in MVP design

AI visual generation:
- Accessible from Explore Visuals page as a special card at the top of the grid: "AI Visual Generation" card with a gradient purple/cyan thumbnail, "Coming Soon" overlay pill
- Tooltip on hover: "Describe a visual and AI generates it live — coming soon"

Letters/reactive text (over stretch):
- Represents real-time reactive typography — shown as a single visual card in the library labeled "Reactive Text" with a "Preview" button; no full design spec required

Light theme / appearance toggle:
- Do not implement as an active MVP control
- If referenced at all, show it only as a roadmap or future-feature concept, not as a usable setting

Live streaming (over-stretch):
- Broadcast the visualizer session to platforms such as Twitch or YouTube Live directly from the app
- No design spec required for MVP

---

TONE AND COPY RULES
- Product name: always "Sonix" — capital S, lowercase remaining — never "SONIX" in body copy (only the wordmark uses all-caps styling)
- Visual names (use these exact strings everywhere): "Aurora Wave", "Spectrum Pulse", "Deep Bass Bloom", "Neon Lattice", "Void Drift", "Solar Flare", "Crystal Echo", "Fractal Storm"
- Playlist names (for future reference / post-MVP): "Late Night Sessions", "Bass Heavy", "Ambient Drift" — NEVER display in MVP screens, not in nav, control bar, tickers, badges, or labels
- No lorem ipsum anywhere — every text string must be plausible product copy
- Username: "Alex Rivera" with a 32px circular avatar (gradient fill: #7C5CFC to #00E5FF, always — never photograph)
- All copy must feel earnest and confident — not salesy; no exclamation marks

---

OUTPUT REQUIREMENT
Generate all confirmed screens as a single unified design file. Desktop dark-theme artboards are the required MVP artboards. All screens must be responsive — include layout notes or separate artboards for laptop (1280px), tablet (768px), and phone (375px). Do not generate active light-theme screens or an appearance toggle for the MVP. Every screen must use identical type sizes, identical component styles, and consistent color values. If any screen contradicts another, it is wrong.
```

## Why This Works Better Than Short Prompts

- Hex codes and exact pixel dimensions eliminate color and spacing drift between generations.
- `GLOBAL CONSTRAINTS` at the top is the first thing Stitch reads — it anchors all decisions before screen details begin.
- `PINNED COMPONENT RULES` enforce critical visual decisions (avatar gradient, nav layout, playlist removal) upfront so Stitch cannot improvise.
- Context-aware nav variants prevent Stitch from applying one nav pattern everywhere; each page specifies exactly which variant to use.
- The visualizer screen's canvas-maximized layout (no sidebars, overlay control bar) is spelled out in exact pixel math, leaving no room for Stitch to add sidebars back.
- Bottom control bar zones (left/center/right) are precisely defined with pixel widths, control names, and interaction states — preventing improvised layouts.
- The hover watermark and ticker/marquee are specified as canvas overlays with exact positioning, size, and animation rules.
- Explicit interaction states (hover/focus/active/disabled/locked) prevent Stitch from inventing component variants per screen.
- Animated background specs are tied to specific pages and include reduced-motion fallbacks.
- Stretch features are represented as design states (coming-soon, locked, disabled) rather than omitted — keeping the design coherent without specifying unbuilt behavior.
- Static pages list gives Stitch the full product map upfront so no screen exists in isolation.
- Fixed copy strings (visual names, username) prevent text drift across all 10 confirmed screens.
- The output requirement at the end reinforces the constraints as the last thing read.
