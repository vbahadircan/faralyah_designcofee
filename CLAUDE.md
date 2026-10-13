# CLAUDE.md — Instructions for AI tools

## Read first

Before writing or changing anything, read these files in the repo root, in this order:

1. `PRODUCT.md` — what we are building and what is out of scope
2. `brand.md` — name, voice, Turkish copy rules, logo
3. `DESIGN.md` — tokens, components, layout, accessibility

If a request conflicts with them, say so and ask instead of silently deviating. If they are silent on something, ask or propose; do not invent brand facts (history, contact info, prices, menu items).

## Project in one paragraph

Mobile-first web app for **Faralyah Design / Coffee** (Turkey). Public part: paper-style menu (name + price rows, no pictures) plus events, workshops and campaigns for kids 6–18. Private part: a Turkish admin dashboard to manage them. **All user-facing content, including the admin, is Turkish.** Code, comments, commit messages, and docs are in English.

## Stack (decided)

- **Client:** Vite + React + React Router (plain SPA), TypeScript `strict`
- **Styling:** Tailwind CSS wired to CSS-variable design tokens; **shadcn/ui for interactive primitives only** (Button, Tabs, Dialog, Sheet, Form/Input/Select, Table, Toast), re-themed to our tokens
- **Server:** Node + Express, TypeScript `strict`; serves the API and the built client from one service
- **Database:** MongoDB via Mongoose
- **Auth:** server-side session in an httpOnly, Secure, SameSite=Lax cookie, stored in Mongo (`connect-mongo`); argon2 password hashing; login rate limiting; CSRF protection on admin mutations. One admin role. No signup route — the admin account is created by a seed script.
- **Validation:** Zod schemas in the `shared` workspace, used by both client and server
- **Images:** `multer` + `sharp` (resize, convert to WebP), stored on the VPS in `uploads/`; one optional cover image per event
- **Fonts:** self-hosted via `@fontsource` (Fraunces, Nunito Sans) — no third-party font requests
- **Tests:** Vitest + Testing Library (client), Vitest + supertest + mongodb-memory-server (server), Playwright + axe (e2e)
- **Tooling:** npm workspaces, ESLint, Prettier

**Hosting:** one Ubuntu 24.04 VPS running Docker Compose — a Caddy container (HTTPS, reverse proxy, serves `uploads/`), an app container (Express + built client), and a MongoDB container with auth and no published port. Data lives in named volumes (`mongo_data`, `uploads`, `caddy_data`). Only Caddy publishes ports (80/443). Nightly `mongodump` (plus `uploads/`) is copied off the server. Deploys are a manual `deploy.sh` run over SSH (pull, `docker compose up -d --build`). GitHub Actions runs lint and tests only.

Do not add a dependency without saying why. Prefer the platform and what is already installed.

## Folder structure (target)

```
client/
  src/
    pages/              # public: menu, events, event detail; admin/: dashboard pages
    components/
      ui/               # shadcn primitives (re-themed) + our primitives (PriceTag, Logo)
      menu/             # MenuItemRow, CategorySection, CategoryTabs
      events/           # EventCard, ...
      admin/            # admin-only components
    lib/                # api client, hooks, small helpers
    content/            # Turkish UI strings (tr.ts) — no strings hard-coded in JSX
    styles/
      tokens.css        # the ONLY place raw color/size values live
server/
  src/
    routes/             # public/ and admin/ route modules
    models/             # Mongoose models
    middleware/         # auth, csrf, rate-limit, error handling
    lib/                # image processing, helpers
  seed/                 # menu.json (owner-provided), admin seed script
shared/
  src/                  # Zod schemas, types, formatPrice
e2e/                    # Playwright
public/brand/           # logo SVGs and brand assets (see brand.md)
deploy/                 # deploy.sh, Caddyfile, Dockerfile, docker-compose.yml, backup script
docs/                   # extra notes, decisions (ADRs)
```

Tests for a unit live next to it as `name.test.ts(x)`. Workspaces: `client`, `server`, `shared`.

## Naming conventions

- Files/folders: `kebab-case` (`menu-item-row.tsx`). React components: `PascalCase` exports. Hooks: `useThing`. Constants: `UPPER_SNAKE`. Types: `PascalCase`, no `I` prefix.
- CSS tokens: `--color-*`, `--space-*`, `--font-*`, `--radius-*`, `--text-*`.
- API paths and Mongo collections/fields: English. Mongo collections are plural `snake_case` (`menu_items`); fields are `camelCase`. Display values are Turkish and live in data or `content/tr.ts`.
- Domain words: `category`, `menu_item`, `event` (with `kind: event | workshop`), `campaign` — use these consistently; do not invent synonyms.
- Money: store as integer kuruş; format only at the edge with the shared `formatPrice` helper (`Intl.NumberFormat('tr-TR')`).
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`), small and focused.

## Commands

Run from the repo root. Scaffolded: workspaces, lint, typecheck, unit/API tests, build, menu and campaigns data layer, public menu and campaigns pages, admin auth and admin panel (menu, campaigns, campaign photo upload).

```
npm install
npm run dev          # server (tsx watch, :3000) + client (Vite, proxies /api) together
npm run seed         # load server/seed/menu.json (or menu.sample.json) into the dev DB
npm run seed -- --reset   # wipe categories/menu_items first (refuses in production)
npm run content:init     # owner's starting categories + campaigns, only into empty collections (safe in production)
npm run admin:create -- owner@example.com   # create the admin or reset its password (asks for it)
npm run lint         # ESLint (includes the no-hardcoded-colors rule)
npm run typecheck    # tsc --noEmit, all workspaces
npm test             # Vitest, all workspaces
npm run format       # Prettier
npm run build        # client (Vite) then server (tsup, bundles shared)
NODE_ENV=production node --env-file=.env server/dist/index.js   # API + built client
```

Setup: copy `.env.example` to `.env` (server only) and have MongoDB running locally (`MONGODB_URI`). API tests use `mongodb-memory-server`, which downloads a MongoDB binary on first install/run; set `MONGOMS_SYSTEM_BINARY` to a local `mongod` to skip that.

Data: `server/seed/menu.sample.json` is **invented sample data** (items and prices are not Faralyah's). Real data goes in `server/seed/menu.json` (same shape, prices in ₺), which takes precedence.

**Not set up yet:** Playwright e2e (`e2e/`), events/workshops, `deploy/` files. Do not reference them as working until added.

Before saying a task is done: `lint`, `typecheck`, and `test` must pass. For UI changes, also check the page at 360 px width and by keyboard only.

## Hard rules

1. **Use design tokens, never hard-coded colors.** No hex/rgb/hsl literals and no Tailwind arbitrary color values outside `client/src/styles/tokens.css`. Same for spacing, radius, font sizes. shadcn's CSS variables must map to our tokens, never to its defaults.
2. **Every component must be keyboard accessible**: native elements first, visible `:focus-visible`, correct ARIA only when needed, 44 px touch targets, contrast per DESIGN.md. Review every shadcn component against this when adding it.
3. **Mobile first.** Base styles for 360 px; enhance with `min-width` queries.
4. **Turkish only in the UI** (public and admin), with `lang="tr"`. Strings come from `client/src/content/tr.ts`; no inline literals in components. Use correct Turkish characters (ç ğ ı İ ö ş ü) and tr-TR formatting.
5. **No images in the menu.** The menu is a paper-style list of name + price. Photos exist only on events/workshops.
6. **Menu item row is not a card.** Only event/workshop items use cards.
7. **Gold is decoration on light surfaces** (contrast ≈ 1.8:1). Never use it for text, focus rings or state on paper; see DESIGN.md.
8. **Validate at the boundary** with the shared Zod schemas. Admin routes and mutations must check the session on the server, never only in the UI.
9. **No secrets in the repo.** Use `.env` (server only, gitignored); keep `.env.example` current. Never commit uploaded files or database dumps.
10. **Stay in scope.** Check PRODUCT.md "Out of scope for v1" before adding features (no ordering, payments, customer accounts, allergen features, recurrence engine, i18n, menu photos).
11. **Every component implements the states in DESIGN.md** (default, hover, focus-visible, disabled, loading) where they apply.
12. **Never invent content.** Menu items, prices, contact details and the brand story come from the owner; development uses clearly fake data ("Örnek Ürün").
13. Make the smallest change that solves the task; don't refactor unrelated code. Don't commit or push unless asked.

## Testing expectations

- Pure logic (`formatPrice`, event date filtering) → unit tests first.
- Components → Testing Library; query by role/name (also proves accessibility).
- API → supertest against mongodb-memory-server; test auth, validation, and that public routes never expose unpublished items.
- Critical flows (scan → browse menu → view events; admin login → edit a price) → Playwright, with an axe scan on each page.
- Fix bugs by writing a failing test first when practical.

## When unsure

Ask a short, specific question with a recommended default. Record decisions that change these docs by updating the relevant file in the same change.
