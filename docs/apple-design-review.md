# Apple Fluid-Interface Design Review — faralyahdesigncoffee.com

Reviewed live at `https://faralyahdesigncoffee.com` (mobile viewport, ~390–420px wide),
pages: `/` (Karşılama), `/menu`, `/kampanyalar`. Evaluated against Apple's *Designing
Fluid Interfaces* principles (response, direct manipulation, interruptibility,
spring-based motion, materials/translucency, typography, reduced motion).

## What's already good

- **Reduced motion is handled correctly at the CSS layer**: `scroll-behavior: smooth`
  is gated behind `prefers-reduced-motion: no-preference`, and a global rule collapses
  all transition/animation durations to `.01ms` under `prefers-reduced-motion: reduce`.
  Keep this — most sites get this wrong or skip it entirely.
- **Hover states are scoped to `@media (hover: hover)`**, so touch devices don't get
  stuck "sticky hover" after a tap. Good mobile-first discipline.
- **Paper-style menu list** (dotted leader lines between item name and price, serif
  category headings, token-based burgundy/gold palette) reads cleanly and matches the
  brand. No notes here — this is a craft win, not a problem.

## Issues found

### 1. No press/tap feedback anywhere (violates "Response", §1)
`-webkit-tap-highlight-color: transparent` is set globally, which removes the
browser's default tap flash — but nothing replaces it. The compiled stylesheet has
**no `:active` state and no `transition-transform` utility in use** (only
`.transition-colors`, ~150ms). Buttons, the circular "Menü"/"Kampanyalar" arrow CTAs,
and the category tab pills give **zero visual feedback at the moment of touch**. On a
touch-primary site this means every tap feels unacknowledged until (if) something
visibly changes afterward.
- **Fix**: add an instant, interruptible press state to every tappable element —
  e.g. `active:scale-[0.97] transition-transform duration-100` — not a hover-only
  effect. This should respect the existing `prefers-reduced-motion` override (it
  already will, since that rule collapses all transition durations).

### 2. Category tabs teleport instead of animating (violates "Behavior over animation", §4 / "Spatial consistency", §7)
On `/menu`, switching between "Sıcak İçecekler / Soğuk İçecekler / Soft İçecekler"
swaps the active pill's background color instantly (a plain `.transition-colors`,
~150ms linear-ish easing) with no sliding indicator and no scroll motion, because all
category sections are already rendered in one continuous page. The result: tapping a
tab that points at content already on-screen produces **no visible change except an
instant color swap** — it reads as unresponsive rather than "already there."
- **Fix**: give the active-tab indicator a short, springy slide/scale transition
  (even a `transform`-based pill that moves between tab positions), and when the
  target section is already in view, briefly highlight/flash that section's heading
  so the tap has a visible, causal effect (§13 Causality: feedback must be obviously
  caused by the tap).

### 3. No translucency/material on the sticky surfaces (missed opportunity, §12)
The compiled CSS has **zero uses of `backdrop-filter`** anywhere in the site. The
sticky category tab bar and top nav use flat/near-opaque backgrounds
(`bg-background/95`) instead of a blurred glass material. On a page meant to feel
tactile and premium, floating chrome over scrolling content is exactly the case
Apple's materials guidance targets.
- **Fix**: add `backdrop-filter: blur(...)` (`backdrop-blur-md` equivalent) to the
  sticky tab bar/nav, and fall back to the current solid background under
  `prefers-reduced-transparency: reduce`.

### 4. Horizontal tab bar clips labels with no scroll affordance (craft, §12/§16)
When a non-first tab is active, the tab bar scrolls to center it, cutting the first
and last labels off mid-letter ("ıcak İçecekler", "Soft İçecekler" in the screenshots)
with a hard edge and no fade. There's no visual hint that the bar scrolls
horizontally at all.
- **Fix**: add a `mask-image` edge fade (or small gradient overlay) on both sides of
  the scrollable tab row instead of a hard content clip, consistent with "scroll edge
  effects, not hard dividers."

### 5. Large display type has no size-specific tracking (minor, §15)
`tracking-wide` / `tracking-widest` are fixed token values applied regardless of the
element's font size; the large serif headings (script "Faralyah" logo, "Faralyah'a
Hoş Geldiniz") don't get the negative tracking Apple recommends for big display text,
while body text is fine at its default spacing.
- **Fix**: tighten letter-spacing slightly (e.g. `-0.01em` to `-0.02em`) specifically
  on the large `font-display` headings; leave body/menu rows as-is.

## Priority for fixes

1. **P1** — Press feedback on all interactive elements (#1). Cheapest, highest impact
   on "does this feel responsive" across the whole site.
2. **P1** — Animated/causal feedback on category tab taps (#2).
3. **P2** — Translucent material on sticky nav/tab bar (#3), with the
   `prefers-reduced-transparency` fallback.
4. **P2** — Scroll-edge fade on the tab bar (#4).
5. **P3** — Display-heading tracking (#5).

All fixes should stay inside the repo's existing hard rules (`CLAUDE.md`): use design
tokens only, no hard-coded colors, keep the `prefers-reduced-motion` / shadcn
re-theming conventions, keep touch targets ≥44px, and make the smallest change that
solves each issue.
