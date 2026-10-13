# Brand Guidelines — Faralyah Design / Coffee

> Status: v0.1 draft. Items marked **TODO(owner)** need input from the cafe owner. Do not invent facts for them.

## 1. Name

- Official name: **Faralyah Design / Coffee**
- Short form (UI, headings, chat): **Faralyah**
- Always write the slash with spaces: `Faralyah Design / Coffee`. Never "FaralyahDesignCoffee" or "Faralyah Design Coffee".
- Language of all customer-facing content: **Turkish (tr-TR)**.

## 2. Story

Faralyah is a coffee house in Turkey that is also a small design studio for kids and families. Besides coffee, sandwiches and desserts, it hosts creative workshops — painting, ceramics, puzzles, board games — for children aged **6–18**.

The idea behind "Design / Coffee": the cafe is a place to drink something good *and* to make something with your hands.

## 3. Target customer

| Group | Who | What they want from the app |
|---|---|---|
| Parents | Adults 28–50 visiting with children | Quickly find drinks/food and prices, see what workshop their child can join |
| Teens (13–18) | Come with friends or alone | Find drinks and snacks, see events and board-game nights |
| Kids (6–12) | Usually with a parent | Clear, friendly look; the app must not feel like a boring adult menu |
| Regular adults | Remote workers, friends meeting for coffee | A fast, readable menu |

Primary device: a **phone**, opened by scanning a QR code at the table.

## 4. Personality

Five words. Use them to settle design and copy arguments.

1. **Warm** — like a cup in your hands; never cold or corporate.
2. **Handmade** — imperfect, crafted, human; paper and clay rather than glass and chrome.
3. **Playful** — kids are welcome and the design shows it, without becoming childish.
4. **Calm** — generous whitespace; the menu is easy to read.
5. **Local** — Turkish, neighborhood-minded, honest prices.

Not: loud, neon, cartoonish, luxury-exclusive, generic "coffee-shop beige".

## 5. Tone of voice (Turkish)

- Address the customer with **"sen"** (informal, friendly) in events and workshops; keep menu items neutral (no pronouns needed).
- Short sentences. Active verbs. No jargon.
- Friendly to kids and respectful to parents. Speak to the parent about logistics (age, price, registration) and to the child about fun.
- No exclamation-mark overload: at most one per text block.
- No English words where a good Turkish word exists ("Etkinlikler", not "Events").

### Menu copy

- Item name: **short, Turkish-first, Title Case in Turkish rules** (e.g. "Sıcak Çikolata", "Türk Kahvesi", "Cheesecake" as commonly used).
- Price shown as `120 ₺` (number, non-breaking space, ₺). Never "TL" in the UI, never decimals if the price is whole.
- No marketing adjectives in the item name. A description, if ever needed, is one short line.
- Category names: **Sıcak İçecekler, Soğuk İçecekler, Sandviçler, Tatlılar, İçecekler (şişe/kutu)**. *(Final list: see PRODUCT.md.)*

### Example voice

| Do | Don't |
|---|---|
| "Cumartesi seramik atölyesi — 8–12 yaş" | "SÜPER HARİKA seramik atölyemize bekleriz!!!" |
| "Kayıt için bize yazın." | "Katılım sağlamak isteyen velilerimizin iletişime geçmesi rica olunur." |
| "Fıstıklı Sütlaç" | "Eşsiz lezzet şöleni: Fıstıklı Sütlaç" |

## 6. Logo usage

The logo is the word **"Faralyah"** in a cursive script. Working version (v0.1, owner to confirm): set in **Italianno** (SIL OFL license), converted to outlined SVG paths.

| File (in `public/brand/`) | Use |
|---|---|
| `faralyah-wordmark-burgundy.svg` | Default on paper: headers, menu top |
| `faralyah-wordmark-light.svg` | On burgundy/brown surfaces |
| `faralyah-lockup-burgundy.svg` | Wordmark + "Design / coffee" + heart; footer, about, print |
| `faralyah-lockup-light.svg` | Same, on dark surfaces |

Rules:

- Use the SVG files only. Never retype the name in a font to imitate the logo.
- Allowed colorways: `#450920` on paper (`#F7F7F7`), or paper-colored (`#F7F7F7`) on `#450920` / `#441909`. No gold or other colorways for the logo itself.
- Clear space around the logo = height of the letter "F" on all sides.
- Minimum width: wordmark 96 px, lockup 160 px (the subtitle is unreadable below that). Use the wordmark alone when smaller.
- Never stretch, rotate, outline, add shadows, or place on busy photos.
- The sticker's gold ring, disco balls and satin are print/marketing decoration, not part of the app logo — with one exception below.

**Sticker logo (owner decision, 2026-10-12):** the round sticker is shown as the logo on the QR landing page (`/`) and the admin login (`/admin/giris`), as `public/brand/faralyah-sticker.webp` through the `StickerLogo` component. It is a circle cropped from a phone photo of the printed sticker, so it is a stopgap: **TODO(owner)** send the sticker's print/design file and replace the WebP with a clean export (same name, square, transparent outside the circle). Everywhere else the SVG rules above still apply.


## 7. Color (summary — full usage in DESIGN.md)

| Name | Hex | Role |
|---|---|---|
| Faralyah Burgundy | `#450920` | Primary brand, headings, key actions |
| Paper | `#F7F7F7` | Page background (a soft off-white, like paper), text on dark |
| Faralyah Brown | `#441909` | Body text, secondary dark surfaces |
| Old Gold | `#D0BB60` | Accent: ornaments, thin rules, highlights — decoration on light surfaces, text allowed only on dark |

No other brand colors. Tints and neutrals are derived in DESIGN.md.
