# Product Brief — Faralyah Menu App

> Status: v0.2. Stack and scope decisions were settled in a design review; see CLAUDE.md for the stack. Items marked **TODO(owner)** need input from the cafe.

## 1. What it is

A mobile-first web app for **Faralyah Design / Coffee** with two parts:

1. **Customer app** (public, Turkish): the cafe menu plus events, workshops, and campaigns.
2. **Admin dashboard** (private, Turkish): staff manage menu, events, workshops, and campaigns without a developer.

The customer menu looks and reads like a **paper menu**: rows of item name + price. No photos.

## 2. Users

| User | Context | Goal |
|---|---|---|
| Customer (adult/parent) | At the table, phone in hand, scanned QR | Find an item, see prices |
| Teen / kid | With parents or friends | Browse drinks/snacks, see workshops and events |
| Prospective visitor | At home, from Instagram/link | See what's on offer and upcoming workshops |
| Staff / owner (admin) | Back of house, phone or laptop | Update prices, hide items, publish an event |

## 3. Main customer flows

1. **Scan** — QR code at the table opens a welcome page (`/`) with two entry cards — **Menü** (`/menu`) and **Kampanyalar** (`/kampanyalar`) — all visible without scrolling (owner decision, 2026-10-12; events/workshops get an entry again once they exist). No login, no install, no cookie wall, no table validation.
2. **Browse** — On `/menu`, category tabs (sticky) scroll to sections; the list reads top to bottom like paper.
3. **View item** — Item row shows name and price, plus an optional one-line description. No separate item page.
4. **Discover events & workshops** — A list of upcoming events and workshops (painting, ceramics, puzzle, board games) with date, age range, price, optional cover photo, and how to register. Past events are hidden automatically. **Not built yet** and not linked from the landing page.
5. **Campaigns** — `/kampanyalar` lists published campaigns in staff order: photo, title, price, optional description, and an "ask the staff" note (no online booking).

The footer always carries one plain line: "Alerjiniz varsa lütfen personele söyleyin." There are no allergen filters or per-item allergen data in v1.

## 4. Main admin flows

1. **Sign in** — Email + password, one admin role. The account is created by a seed script; there is no signup.
2. **Manage menu** — Create/edit categories and items (name, price, optional large-size price, optional description, "Menüde göster" on/off). Reorder with up/down buttons. Items turned off disappear from the public menu.
3. **Manage events & workshops** — Create/edit: title, kind (event or workshop), topic, description, date/time, age range (6–18), price, registration contact, optional cover image, optional free-text recurrence line (e.g. "Her Cumartesi 14:00"), "Yayında" on/off.
4. **Manage campaigns** — Title, price, optional description, optional photo (uploaded, converted to WebP), "Yayında" on/off, reorder with up/down. No start/end dates in v1.

No preview mode in v1: changes go live within about a minute, and "Yayında" lets staff save drafts unpublished.

## 5. Content model (high level)

Mongo collections (English names; display values are Turkish):

- **categories**: name, order, active
- **menu_items**: name, price (integer kuruş), priceLarge? (integer kuruş; when set, price is the small size — used for hot drinks), categoryId, description?, order, visible
- **events**: kind (`event | workshop`), topic (`painting | ceramics | puzzle | boardgame | other`), title, description, startsAt, endsAt?, ageMin, ageMax, price?, contact/registration info, recurrenceText?, coverImage?, published
- **campaigns**: title, description?, priceKurus, image?, order, published
- **admin_users**: email, passwordHash (argon2id); **sessions**: admin sessions (connect-mongo)

Events have one-off dates only; a real recurrence engine is out of scope.

## 6. Menu structure (v1)

Four sections (owner decision, 2026-10-12): Sıcak İçecekler · Soğuk İçecekler · Soft İçecekler · Tatlı & Atıştırmalık. Admin can add, rename, hide or reorder categories.

Starting campaigns from the owner: Figür Boyama + Kahve 400 ₺ · Taşlı Boyama + Kahve 400 ₺ · Tuval Boyama + Kahve 350 ₺ · Çocuk Boyama + Soft İçecek 300 ₺. Both lists live in `server/seed/initial-content.json` and are loaded once with `npm run content:init`.

The first real content comes from an owner-provided spreadsheet (category, item name, price), converted to `server/seed/menu.json`. Until then development uses clearly fake data.

## 7. Technical constraints that shape the product

- Public menu is one `GET /api/menu` payload cached ~30 s, so edits show up within about a minute.
- Runs on a single VPS with a real domain; the QR code points at that domain and must never change.
- Nightly database and uploads backup is part of the product, not optional.

## 8. Success criteria for v1

- A customer finds any menu item within **10 seconds** of scanning.
- Menu page loads in **< 2 s on 4G** (Lighthouse performance ≥ 90 mobile).
- Staff can change a price or hide an item in **< 1 minute** without help.
- WCAG 2.1 AA: fully keyboard-operable, screen-reader friendly, sufficient contrast.

## 9. Out of scope for v1

- Online ordering, cart, checkout, payments
- Table service / "call the waiter"
- Customer accounts and login
- Allergen filtering, badges, or per-item allergen data
- Online workshop registration & payment (v1: show contact info/WhatsApp link only)
- Recurring-event engine (free-text recurrence line only)
- Admin preview mode
- Loyalty program / points
- Multiple languages (Turkish only; keep strings in one place so i18n is possible later)
- Multiple branches
- Menu item photos
- Analytics beyond basic privacy-friendly page counts
- Native mobile apps

## 10. Open questions

- **TODO(owner):** domain name (needed before printing QR codes).
- **TODO(owner):** WhatsApp / phone / Instagram contact details for registration.
- **TODO(owner):** the real menu spreadsheet (items and prices).
- Do prices include KDV? (Assume yes; show final price.)
- Is the VPS OS Ubuntu, and what else runs on it? (Plan assumes Ubuntu + Caddy.)
