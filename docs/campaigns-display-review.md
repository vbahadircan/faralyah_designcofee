# Campaigns display review — /kampanyalar

Investigated the live `/kampanyalar` experience (mobile viewport) alongside
`CampaignsPage`, `CampaignCard`, `shared/src/campaign.ts`, `tr.ts`, and DESIGN.md §4.5b.
Compared against the denser, more scannable `/menu` experience (`CategoryTabs` +
`MenuItemRow`), which campaigns should borrow patterns from where it makes sense.

## Current state

- 4 campaigns, stacked as full-width vertical cards: a 4:3 image/placeholder, then
  title + price + optional description + a single "Bilgi al" button that toggles a
  static note.
- **None of the 4 campaigns has a real photo yet**, so all four show the *exact same*
  brand gradient + `Palette` icon (per DESIGN.md §4.5b, this is the documented
  fallback). Scrolling the page today is four look-alike hero banners in a row.
- None has a `description` filled in either, so the only differentiator between
  cards while scrolling is the title and price — both small text under a large
  identical image.
- The "Bilgi al" note is one hard-coded string (`tr.campaigns.note`) shared by every
  campaign; it reveals instantly (`hidden`/`!hidden`, no transition).
- To compare all 4 prices today, a visitor must scroll past ~4 full-width banner
  images — there's no overview, unlike `/menu` which has `CategoryTabs` for exactly
  this kind of "see what's here, then jump" need.

## Why this is the thing to fix

The page's job is to help a visitor pick between a handful of activity+drink
bundles. Right now the dominant visual element (the banner) carries the least
information (it's identical across all 4), while the one thing that differs
between cards (name + price) is the smallest text on the card. That's an inverted
hierarchy: the biggest thing on screen should be the thing that's different, not
the thing that's the same everywhere.

## Recommendations

1. **Add a quick-compare jump strip at the top**, the same interaction pattern as
   `CategoryTabs` on `/menu`: a sticky, horizontally scrollable row of pill chips,
   one per campaign (name, optionally price), with a sliding active-pill indicator.
   Tapping a chip scrolls to and flashes that campaign's card. This gives visitors
   an overview of all options and prices in one glance, before committing to scroll
   through four large banners — and reuses an interaction people already learn on
   `/menu`, which is good for consistency (§7 spatial consistency / familiarity).

2. **Shrink the placeholder banner, keep full 4:3 only for real photos.** When
   `imageUrl` is missing, render a smaller tile (e.g. a square icon chip beside the
   title) instead of a full-width 4:3 banner, so title/price/CTA show without
   scrolling past a large graphic that carries no information. Keep the existing
   4:3 treatment once a campaign has a real photo — that's the point of this
   pattern (text wrapper over paired contrasting image).

3. **Differentiate the placeholder by campaign**, not just by gradient. Map a few
   obvious keywords in the title (figür, taşlı, tuval, çocuk, …) to a different
   lucide icon (and reuse the existing token-based gradient/tint, no new colors),
   so cards are visually distinguishable at a glance even before real photography
   exists. This stays inside DESIGN.md §4.5b's existing fallback — it just
   stops every fallback from being pixel-identical.

4. **Animate the "Bilgi al" note reveal** (height + opacity, not an instant
   `hidden` swap), respecting `prefers-reduced-motion` the same way the rest of the
   site already does. Right now it's the only interactive surface on the public
   site with zero transition.

## Out of scope / left alone

- Not proposing online booking/ordering, real photography content, or new copy —
  all explicitly out of scope per PRODUCT.md / CLAUDE.md hard rules.
- Not changing the one-card-per-campaign, no-carousel layout DESIGN.md specifies;
  if campaign count grows significantly, a snap-scroll carousel could be worth a
  separate follow-up, but that's a bigger layout change than this round should make.
