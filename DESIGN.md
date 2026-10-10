# Design System — Faralyah Design / Coffee

> Status: v0.1 draft. Read `brand.md` first. Anything marked **(proposed)** is a starting point, not a final decision.
> Source of truth for tokens in code: `client/src/styles/tokens.css`. This file explains how to *use* them.

## 1. Principles

1. **Paper menu first.** The customer menu is a printed menu on a phone: paper-colored (`#F7F7F7`) page, dark ink, rows of name + price, thin rules. No cards with shadows, no photos.
2. **Mobile first.** Design at 360 px wide, then enhance.
3. **Warm and playful, not busy.** Playfulness comes from type, a few hand-drawn touches, and color on events/workshops — never from clutter on the menu.
4. **Accessible by default.** WCAG 2.1 AA, keyboard operable, readable in a dim cafe and in sunlight.

## 2. Tokens

Never hard-code a color, font size, spacing, radius or shadow in a component. Use a token.

### 2.1 Color

Brand (fixed by the owner):

| Token | Value | Use |
|---|---|---|
| `--color-burgundy` | `#450920` | Primary: headings, primary button, active tab, price |
| `--color-paper` | `#F7F7F7` | Page background ("the paper"), text on dark surfaces |
| `--color-brown` | `#441909` | Body text, borders on light, secondary dark surfaces |
| `--color-gold` | `#D0BB60` (old gold) | Accent: thin rules, ornaments, stars/hearts, highlights on dark surfaces, event type tags on dark |

Gold rules (contrast): on burgundy/brown it is ≈ 8:1 and may be used for text. On paper it is ≈ 1.8:1, so on light surfaces it is **decoration only** — never text, never the only indicator of state, never a focus ring. Don't use gold as a button fill with paper text.

Derived (proposed — computed from the brand colors; adjust by eye later):

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `var(--color-brown)` | Default text |
| `--color-ink-muted` | `#441909` at 70% → `#7A5F55` | Secondary text, descriptions |
| `--color-rule` | `#441909` at 20% on paper → `#D8D0CD` | Hairlines between menu rows, dotted leaders |
| `--color-tint` | `#450920` at 6% on paper → `#EEE8EA` | Hover/selected background, disabled surfaces |
| `--color-focus` | `var(--color-burgundy)` | Focus ring (2 px + 2 px offset) |
| `--color-danger` | **(proposed)** `#9B1C1C` | Form errors in admin only |

Semantic tokens (components use these, not the raw ones): `--surface`, `--surface-inverse`, `--text`, `--text-muted`, `--text-inverse`, `--border`, `--accent` (burgundy), `--ornament` (gold), `--focus-ring`.

Contrast: burgundy and brown on paper (`#F7F7F7`) are > 11:1. Muted text must stay ≥ 4.5:1 on paper. Verify any new derived color before adding it.

### 2.2 Typography

| Token | Value | Use |
|---|---|---|
| `--font-display` | *Fraunces* (self-hosted via `@fontsource`) | Headings, category names, logo subtitle |
| `--font-body` | *Nunito Sans* (self-hosted via `@fontsource`) | Item names, UI text |

Load only the weights and Latin-extended subset in use; no third-party font requests. Requirement: every font must render **ç ğ ı İ ö ş ü** correctly. Test with "ĞÜŞİÖÇ ığüşöç".

Scale (mobile / ≥ 768 px): `--text-xs` 12/12 · `--text-sm` 14/14 · `--text-base` 16/17 · `--text-lg` 18/20 · `--text-xl` 22/26 · `--text-2xl` 28/36. Body never below 16 px. Prices use `font-variant-numeric: tabular-nums`.

Turkish casing: use `lang="tr"` on `<html>` and `text-transform: uppercase` only with it set, so `i` → `İ` works. Prefer writing capitalised text in the content instead of CSS-uppercasing.

### 2.3 Spacing, radius, motion

- Spacing: 4 px base. `--space-1`…`--space-8` = 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: `--radius-sm` 4 px (inputs), `--radius-md` 8 px (buttons), `--radius-pill` 999 px (tabs, chips). Menu rows have **no** radius.
- Shadow: none on the menu. Admin may use one subtle `--shadow-sm`.
- Motion: 150 ms ease-out for color/opacity. Respect `prefers-reduced-motion` (disable transforms and non-essential animation).

## 3. Layout rules (mobile first)

- Base width 360 px. Content gutter `--space-4` (16 px). Max content width 640 px for the menu (it's a paper menu — keep the line short), 960 px for events and admin.
- Single column on the menu at every breakpoint; on desktop it is centered, not stretched.
- Breakpoints: `sm` 480 · `md` 768 · `lg` 1024. Write base styles first, enhance upward with `min-width` queries.
- Touch targets ≥ **44 × 44 px**.
- Category tabs are **sticky** under the page header and horizontally scrollable with a visible overflow hint; the active tab scrolls into view.
- Page structure: header (wordmark) → category tabs → sections → footer (allergy note, contact).
- Don't use hover as the only way to reveal anything.

## 4. Components

For each component: purpose, anatomy, states. All states must exist before a component is "done".

Global state rules:
- **Default** — as specced.
- **Hover** (pointer only) — background `--color-tint`; no layout shift.
- **Focus-visible** — 2 px `--focus-ring` outline, 2 px offset, never removed.
- **Active/pressed** — slightly darker/`--color-tint` + 1 px translate is NOT used; use color only.
- **Disabled** — 40% opacity text, `--color-tint` surface, `aria-disabled`, not focusable if using a native `disabled`.
- **Loading** — keep size stable; show a spinner or skeleton; set `aria-busy="true"`; disable repeated activation.

### 4.1 Button

- Variants: `primary` (burgundy bg, paper text), `secondary` (paper bg, burgundy 1.5 px border + text), `ghost` (text only, for tertiary/admin).
- Sizes: `md` (min-height 44 px), `lg` (52 px). Radius `--radius-md`. Label in sentence case Turkish ("Kaydet", "Vazgeç").
- Loading: spinner replaces the left icon, label stays; width unchanged.
- Use a real `<button>` (or `<a>` for navigation). Icon-only buttons need `aria-label`.

### 4.2 Menu item row (the "menu item card")

Despite the name, this is **not a card**. It is a paper-menu row.

```
Türk Kahvesi ............................ 90 ₺
```

- Anatomy: name (left, `--font-body`, `--text-base`, wraps up to 2 lines) · dotted leader (decorative, `aria-hidden`) · price tag (right, no wrap) · optional one-line description in `--text-muted`.
- Row separation: 1 px `--color-rule` hairline or just vertical rhythm; no boxes.
- Min height 48 px; padding `--space-3` vertical.
- Hover: `--color-tint` background (only if the row is interactive).
- Items the admin turns off ("Menüde göster" off) are not rendered at all — there is no sold-out state on the public menu.
- Loading: skeleton rows (name bar + price bar), no spinner.
- Semantics: list of items as `<ul>`/`<li>`; price in `<data value="90">90 ₺</data>` or similar.

### 4.3 Category tab

- Pill or underlined text tab; default: brown text on paper; **active**: paper text on burgundy pill (and `aria-selected="true"`); hover: tint.
- Implemented as a tablist **or** an anchor nav (proposed: anchor nav that scrolls to section + updates active tab via IntersectionObserver — simpler and works without JS for the content).
- Keyboard: ←/→ moves between tabs (if tablist), Enter/Space activates, Home/End jump.
- Min height 44 px; labels never truncated — the strip scrolls instead.

### 4.4 Price tag

- Format `120 ₺` (non-breaking space), Turkish number formatting via `Intl.NumberFormat('tr-TR')`. Whole prices have no decimals; otherwise `42,50 ₺`.
- Burgundy, semibold, tabular numerals, right-aligned, `white-space: nowrap`.
- A price is never color-only information: it is always text.
- Variant "from" for sized drinks **(proposed, only if needed)**: `S 90 ₺ · L 110 ₺` as two tags.

### 4.5 Event / workshop card (the only real card)

- Paper surface, 1 px `--color-rule` border, `--radius-md`, optional photo at top (4:3), title in display font, meta line (date · age range · price), type tag (Resim, Seramik, Puzzle, Kutu oyunu), one primary action ("Detaylar" / "Kayıt için yaz").
- This is where playfulness lives: type tag may use burgundy fill and a small hand-drawn icon.

### 4.6 shadcn primitives

shadcn/ui is used **only for interactive primitives**: Button, Tabs, Dialog, Sheet, Form/Input/Select, Table, Toast. Rules:

- Map shadcn's CSS variables to our tokens in `tokens.css` (`--primary` → burgundy, `--background` → paper, `--foreground` → ink, `--ring` → focus, `--border` → rule, `--radius` → `--radius-md`). Never keep shadcn's default grey palette.
- Strip default shadows and oversized radii from anything on the public menu.
- Re-check each added component against the global states, 44 px targets and the accessibility checklist below.
- The menu row, price tag, logo and event card are our own components, not shadcn.

### 4.7 Other (build when needed)

Campaign banner (dismissible, `role="region"`), allergy footer line ("Alerjiniz varsa lütfen personele söyleyin."), empty state ("Şu an burada bir şey yok."), skeleton, toast (admin), form fields (label above, error text below, `aria-describedby`), admin table, up/down reorder buttons (admin; keyboard-operable, `aria-label` names the item).

## 5. Do / Don't

| Do | Don't |
|---|---|
| Use `var(--color-burgundy)` / semantic tokens | Write `#450920` in a component or Tailwind arbitrary value `text-[#450920]` |
| Row of name · leader · price with hairlines | Boxed cards with shadows for menu items |
| Keep prices right-aligned, tabular, no wrap | Center prices or let them wrap under the name |
| Keep shadcn re-themed to tokens | Ship shadcn's default grey palette, shadows or radii |
| Text on burgundy/brown is paper (`#F7F7F7`) or gold | Put burgundy text on brown (contrast too low) |
| Add 44 px touch targets, visible focus | Remove `outline` or shrink tap areas to look "clean" |
| Plain Turkish, one exclamation at most | Shouty ALL CAPS copy or English labels |
| Write base (mobile) styles then `min-width` queries | Desktop-first overrides with `max-width` |
| Use `Intl.NumberFormat('tr-TR')` for prices | Concatenate `price + " TL"` by hand |
| Respect `prefers-reduced-motion` | Autoplaying or looping animation |

## 6. Accessibility checklist (every component)

- [ ] Operable by keyboard alone; logical tab order; visible focus.
- [ ] Correct native element or ARIA role/state; accessible name in Turkish.
- [ ] Contrast ≥ 4.5:1 (text), ≥ 3:1 (UI boundaries, focus ring).
- [ ] Not dependent on hover, color alone, or gestures.
- [ ] Works at 200 % zoom and 320 px width without horizontal scroll.
- [ ] Has default, hover, focus-visible, disabled and loading states (where applicable).
