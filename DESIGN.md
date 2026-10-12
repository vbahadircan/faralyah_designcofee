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

Scale (compact, matched to the cafe's mock-ups; one scale on all breakpoints): `--text-xs` 11/16 (tags, eyebrows, meta; bold or uppercase only) · `--text-sm` 12/18 (descriptions, secondary text) · `--text-base` 14/20 (body, menu item names, buttons) · `--text-lg` 16/22 (card titles on mobile) · `--text-xl` 18/24 (section and card headings) · `--text-2xl` 22/28 (page titles, prices on package cards). Body is 14 px, nothing below 11 px. Prices use `font-variant-numeric: tabular-nums`. **Form inputs must be 16 px (`text-lg`)**: iOS Safari zooms the page when an input below 16 px is focused. Trade-off to remember: this scale is denser than the usual 16 px body guidance, so keep contrast high and never lower these sizes further.

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

### 4.5a Landing page (`/`)

Built from the cafe's inspiration mock-up; chosen by the owner over the earlier three-card landing (2026-10-12).

- Structure: top bar (brand tile, name, "QR MENÜ / Karşılama", round brand mark) → eyebrow, heading, subtitle → Wi-Fi password card with copy button → two **photo cards**, Menü and Kampanyalar: badge (top-left), gold eyebrow, serif title and arrow over the image, description and chips below. Dotted paper background (`bg-dots`).
- Uses `--radius-lg` (12 px), `--radius-xl` (16 px) and `--shadow-card`, shared with the campaign card.
- Photos: each card has an optional `photo` path (under `/public`). Until real photos exist a brand-color gradient with a large faint icon is shown. A brown gradient overlay keeps the gold and white text readable over any photo. Photos need Turkish-free `alt=""` (they are decorative) and must follow the brand.md photo rules (parental consent for kids).
- Everything must stay on **one screen** on phones from 360 × 568. Short screens drop content in this order: badge (< 700 px high), chips (< 760 px high), Wi-Fi card (< 620 px high).
- Left out on purpose: table verification ("MASA 04") and "Servis Çağır" — not in v1.
- `WIFI_PASSWORD` is the mock-up's demo value (`TODO(owner)`); replace with the real one or remove the card.
- Gold appears as text only on dark overlays; on the paper surface it is decoration only (§2.1).

### 4.5b Campaign card (`/kampanyalar`)

One card per published campaign, in the order staff set.

- Anatomy: photo on top (4:3, `object-cover`, decorative `alt=""`; brand gradient with a faint icon when there is no photo) · title (`h2`) and price block side by side · optional description · one secondary button "Bilgi al".
- The price carries a visually hidden label ("Kampanya fiyatı"); never color-only.
- Online booking is out of scope for v1, so the button toggles an inline note (`aria-expanded` / `aria-controls`) telling people to ask the staff; it must never look like a checkout.
- Surface: `bg-background`, `--radius-xl`, `--shadow-card`, 1 px rule border.

### 4.5c Admin panel (`/admin`)

- Login at `/admin/giris`; every other admin page checks the session first and sends visitors without one to the login page.
- Layout: max width 960 px, header (title, "Siteyi gör", "Çıkış yap"), pill nav (Menü, Kampanyalar), a sticky live region (`role="status"`) for "Kaydedildi." and errors.
- Editing is inline: each row is a `<fieldset>` named by the item, with labelled 16 px inputs, "Menüde göster" / "Yayında" checkboxes, a Kaydet button, and up / down / delete icon buttons whose `aria-label` names the item. Delete asks for confirmation.
- Prices are typed as Turkish text ("120", "42,50") and parsed with `parsePriceInput`; an unreadable price shows an error under the field and nothing is sent.

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
