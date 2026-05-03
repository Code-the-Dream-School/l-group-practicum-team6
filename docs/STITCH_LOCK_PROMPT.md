# Stitch Lock Prompt

Use when Stitch keeps producing different designs from same `STITCH_PROMPT.md`. Goal: screenshot the variant you liked, bake those concrete decisions into spec so next Stitch run reproduces look instead of re-rolling.

## How to use

1. Generate same screen 2–3 times in Stitch before locking. Single-generation locks bake noise. If you only have one run, lock only clearly structural decisions; otherwise lock decisions that recur and skip decisions that varied.
2. Screenshot screens you want to keep (LIKED set).
3. Optionally screenshot variants you do NOT want (REJECTED set) — locking out bad choices is often easier than locking in good ones.
4. Optionally annotate screenshots: circle/arrow elements you actually noticed. Unannotated areas treated as lower-confidence signal.
5. If two screenshots conflict, name one as primary reference in the prompt.
6. Drop screenshots into chat. Label sets (LIKED / REJECTED).
7. Paste prompt below. Replace placeholders.
8. Regenerate same screens in Stitch from updated spec. Compare to screenshots. Past 3 lock passes with no convergence → switch tools (Figma Make, v0, hand-build).

## Prompt to paste

```text
I am attaching screenshots from Stitch generation runs.
LIKED set (lock IN): <list exact SCREENS names>
REJECTED set (lock OUT, optional): <list exact SCREENS names or "none">

Canonical spec: docs/STITCH_PROMPT.md. Stitch keeps generating different layouts from same spec because spec leaves too many decisions open. Promote concrete decisions from LIKED set into spec. Add negative constraints from REJECTED set.

Do this:

0. Root cause check FIRST. Skim screenshots against spec's pinned values: palette hex codes, type scale, spacing scale, radius scale, fixed copy strings. If drift is in things spec already pins (Stitch used non-palette color, off-scale spacing, wrong copy), STOP. Spec edits will not fix this — Stitch is ignoring constraints, not missing them. Report violated constraints and recommend restructuring spec for emphasis. Only continue if drift is in unpinned decisions.

1. Single-generation guard. If user only has one generation per screen, warn: locking from one run bakes noise. Recommend 2–3 runs first. Proceed only on user confirm or if locks are clearly structural (column count, card aspect ratio).

2. If a screen name does not map exactly to a SCREENS entry in spec, ask before editing — do not guess.

3. For each LIKED screenshot, extract concrete decisions Stitch made that are NOT already pinned. Look for:
   - Layout: column counts, card aspect ratios, image vs gradient, hero composition, section order, presence/absence of supporting elements.
   - Component shape: button radius variations, card padding, icon placement, label position, header/footer treatments where spec said "context-aware" without naming variant.
   - Color usage inside palette: which surface tone where, accent placement, gradient direction and stops.
   - Typography inside type scale: which heading level introduces section, label-vs-eyebrow choices.
   - Spacing rhythm: which scale values used in which contexts.
   - Imagery: gradient orbs, mesh patterns, mock device frames, glow shapes.
   - Annotations take priority — circled elements are user-noticed signal.

4. Restraint:
   - Snap measurements to existing spacing/radius/type scales. Do NOT introduce new scale values from estimated pixel reads. If unsure between two scale values, skip the lock.
   - Only lock at breakpoint visible in screenshot. Leave other breakpoints untouched.
   - Lock structural shell, not legitimately variable content (per-instance thumbnails, gradient angles, illustration content).

5. For REJECTED screenshots, extract decisions to lock OUT. Add as tight "Never" or "Do not" rules — forbid bad pattern only, not surrounding design space.

6. Classify each decision:
   - GLOBAL → GLOBAL CONSTRAINTS or DESIGN SYSTEM block.
   - PATTERN → COMPONENT SPECIFICATIONS or INTERACTION STATES.
   - SCREEN-SPECIFIC → matching SCREENS entry.

7. Anti-bloat. Prefer tightening existing language over appending. If a sentence says "or", "may", "optional", "context-aware" without naming variant, or describes a range — and screenshots resolve one otherwise unpinned choice — REPLACE the open language. Only append when no existing sentence covers topic. Consolidate duplicates/contradictions in same edit. Preserve imperative tone ("Use X", "Always Y", "Never Z").

8. Cross-screen ripple. After each lock, grep spec for same component on OTHER screens. If lock contradicts another screen's spec (e.g. lock card padding to 24px on Explore but Favorites still says 16px), reconcile in same edit or flag conflict. Do not silently desync.

9. Do NOT change:
    - Palette hex codes, type/spacing/radius scales.
    - List of screens or routes.
    - Anything marked "NOT CONFIRMED".
    - Copy strings pinned in TONE AND COPY RULES.

10. Post-edit contradiction scan. Re-read full spec. Flag new internal contradictions edits introduced. Fix or report.

11. Report back with:
    - Unified diff (`git diff docs/STITCH_PROMPT.md`).
    - Locks IN, grouped GLOBAL / PATTERN / SCREEN. Locks OUT from REJECTED set.
    - Locks SKIPPED due to confidence threshold or breakpoint scope, with reason.
    - Conflicts between screenshots and how resolved (or flagged).
    - Cross-screen ripples reconciled.
    - Verification list: which screens to regenerate in Stitch.

Do not regenerate whole spec. Edit surgically.
```

## When this is the wrong move

- Screenshots disagree heavily → pick one reference run first, run prompt against just that set.
- Only one generation per screen → run 2–3 more first.
- Drift is in pinned values (palette, scales, fixed copy) → Stitch is ignoring constraints. Restructure spec for emphasis. More rules make it worse.
- You want different design, not more consistent one → iterate freehand.
- 3 lock passes have not converged → hit Stitch variance ceiling. Switch tools.
- Spec over 900 lines → consolidation pass before more locks. Long specs degrade Stitch attention to early constraints.
- Concern is React/Tailwind implementation drift, not Stitch generation drift → different problem, different fix.
