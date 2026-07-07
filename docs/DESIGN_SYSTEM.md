# BrewPoint — Design System

**Version:** 1.0 · **Stack:** Tailwind CSS + shadcn/ui
**Status:** MVP Definition · **Companion docs:** `PRD.md`, `ROADMAP.md`, `TECH_SPEC.md`

---

## 1. Brand Personality

BrewPoint should feel **calm, trustworthy, and fast to read at a glance** — it's a tool staff stare at for hours during a shift, not a marketing site. The visual language borrows the warm, cozy feel of a coffee shop (cream, warm neutrals) but stays disciplined and functional (dark navy anchor, clear semantic colors) so numbers, stock levels, and transaction statuses are never ambiguous under counter pressure.

**Keywords:** calm, warm, precise, trustworthy, fast-to-scan.

---

## 2. Color Palette

### 2.1 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `navy-900` (Primary) | `#2B3A4A` | Primary buttons, active nav items, headings on light surfaces, price emphasis |
| `navy-700` | `#3B4E63` | Primary hover state |
| `navy-500` | `#5A7080` | Secondary text on dark surfaces |
| `blue-500` (Accent) | `#4A7DBD` | Secondary actions, links, focus rings, highlighted cards (e.g. "redeem points") |
| `blue-600` | `#3A6BA8` | Accent hover state |
| `cream-200` | `#E8DCC5` | Warm accent backgrounds — icon chips, badges, empty states |
| `cream-100` | `#F3ECDD` | Lighter cream tint, subtle section backgrounds |

### 2.2 Neutrals

| Token | Hex | Usage |
|---|---|---|
| `neutral-0` (Surface) | `#FFFFFF` | Cards, modals, table rows |
| `neutral-50` (Page background) | `#EFEFEF` | App background behind cards |
| `neutral-100` | `#E5E7EB` | Dividers, table borders |
| `neutral-300` | `#C7CCD1` | Disabled borders, disabled icons |
| `neutral-500` (Text secondary) | `#6B7280` | Supporting text, labels, timestamps |
| `neutral-700` (Text primary) | `#1F2933` | Body text, table content |
| `neutral-900` | `#0F1418` | Highest-emphasis text (rare — headings usually use navy) |

### 2.3 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `success-500` | `#4C8C5B` | Completed transaction, stock restocked, positive confirmation |
| `success-100` | `#DCEFE0` | Success badge background |
| `warning-500` | `#D9A441` | Low stock warning, pending state |
| `warning-100` | `#FBF0DD` | Warning badge background |
| `danger-500` | `#C0564D` | Voided transaction, out-of-stock, destructive actions |
| `danger-100` | `#F6E1DE` | Danger badge background |

### 2.4 Text-on-Color Rule

When text sits on a colored background (badge, chip, filled button), always pair it with the darkest shade from the **same** color family — never plain black or `neutral-700`.

| Background | Text |
|---|---|
| `success-100` | `success-500` (or a darker `success-700` if more contrast is needed) |
| `warning-100` | `warning-500` |
| `danger-100` | `danger-500` |
| `cream-200` | `navy-900` |
| `navy-900` | `#FFFFFF` |
| `blue-500` | `#FFFFFF` |

### 2.5 Tailwind / shadcn CSS Variables

BrewPoint uses shadcn/ui, which reads theme colors from CSS variables in HSL. Mapped from the palette above:

```css
/* app/globals.css */
:root {
  --background: 0 0% 94%;              /* neutral-50 #EFEFEF */
  --foreground: 205 20% 12%;           /* neutral-700 #1F2933 */

  --card: 0 0% 100%;                   /* neutral-0 #FFFFFF */
  --card-foreground: 205 20% 12%;

  --primary: 208 24% 23%;              /* navy-900 #2B3A4A */
  --primary-foreground: 0 0% 100%;

  --secondary: 43 39% 84%;             /* cream-200 #E8DCC5 */
  --secondary-foreground: 208 24% 23%; /* navy-900 */

  --accent: 213 45% 51%;               /* blue-500 #4A7DBD */
  --accent-foreground: 0 0% 100%;

  --muted: 220 13% 91%;                /* neutral-100 #E5E7EB */
  --muted-foreground: 220 9% 46%;      /* neutral-500 #6B7280 */

  --destructive: 6 42% 51%;            /* danger-500 #C0564D */
  --destructive-foreground: 0 0% 100%;

  --success: 133 27% 41%;              /* success-500 #4C8C5B */
  --success-foreground: 0 0% 100%;

  --warning: 38 62% 56%;               /* warning-500 #D9A441 */
  --warning-foreground: 208 24% 23%;

  --border: 220 13% 91%;               /* neutral-100 */
  --input: 220 13% 91%;
  --ring: 213 45% 51%;                 /* blue-500, focus ring */

  --radius: 0.625rem;                  /* 10px, see Section 4 */
}
```

`--success` and `--warning` are not part of shadcn's default token set — they're added here as project-specific extensions, following the same `{name}` / `{name}-foreground` pairing convention shadcn uses for `--destructive`.

---

## 3. Typography

BrewPoint uses **two typefaces**, split by role — one for structure and personality, one for density and legibility:

| Role | Font | Why |
|---|---|---|
| **Display / Headings** | **Poppins** | Geometric, warm, slightly rounded — carries the coffee-shop brand personality on page titles, section headers, and the login/POS branding moments |
| **Body / UI / Data** | **Inter** | Purpose-built for UI at small sizes — tighter, more neutral, excellent number legibility (critical for prices, stock counts, and dense tables), doesn't compete with Poppins for attention |

**Rule of thumb:** if it's a heading, a page title, or a brand moment (login screen, empty states) → Poppins. If it's body copy, table content, form labels, buttons, or anything number-heavy → Inter.

### 3.1 Font Loading (Next.js)

```ts
// app/fonts.ts
import { Poppins, Inter } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
```

```css
/* app/globals.css */
--font-display: var(--font-display), sans-serif; /* Poppins */
--font-body: var(--font-body), sans-serif;        /* Inter */
```

```js
// tailwind.config.ts
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
},
```

By default, `body` (Inter) applies globally via the base `<html>` class; `font-display` (Poppins) is applied explicitly to heading elements and brand moments.

### 3.2 Type Scale

| Token | Font | Size / Line height | Weight | Usage |
|---|---|---|---|---|
| `display-lg` | Poppins | 32px / 40px | 600 | Login screen brand title, empty-state headlines |
| `heading-1` | Poppins | 24px / 32px | 600 | Page titles ("Products", "Dashboard") |
| `heading-2` | Poppins | 20px / 28px | 600 | Section headers, modal titles |
| `heading-3` | Poppins | 16px / 24px | 500 | Card titles, table section headers |
| `body-lg` | Inter | 16px / 24px | 400 | Primary body text, form inputs |
| `body-md` | Inter | 14px / 20px | 400 | Table cell content, default UI text |
| `body-sm` | Inter | 13px / 18px | 400 | Secondary/supporting text, timestamps |
| `caption` | Inter | 12px / 16px | 500 | Badges, labels, helper text |
| `numeric-lg` | Inter, tabular figures | 20px / 28px | 600 | Prices in cart/checkout, dashboard totals |
| `numeric-md` | Inter, tabular figures | 14px / 20px | 500 | Prices in tables and product cards |

**Numeric figures rule:** any element displaying currency, quantity, or a count (cart totals, product prices, stock numbers, dashboard stats) must use `font-variant-numeric: tabular-nums` so digits align vertically in tables and don't visually jitter as values update — this matters a lot at a checkout counter.

```css
.numeric {
  font-variant-numeric: tabular-nums;
}
```

### 3.3 Weight Usage

- **Poppins:** 500 (subheadings), 600 (default heading weight), 700 (rare — display-lg only, or celebratory moments like a completed sale).
- **Inter:** 400 (body default), 500 (emphasized body text, buttons, table headers, prices), 600 (numeric totals, strong emphasis).
- Never use weights below 400 or above 700 — thin/black weights hurt legibility at small UI sizes.

---

## 4. Spacing & Radius

### 4.1 Spacing Scale

4px base unit, following Tailwind's default scale — used consistently rather than arbitrary values:

| Token | Value | Typical usage |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap |
| `space-2` | 8px | Compact internal padding (badges, chips) |
| `space-3` | 12px | Default gap between related elements |
| `space-4` | 16px | Card internal padding, form field gaps |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Page-level spacing between major blocks |

### 4.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, chips, small buttons |
| `radius-md` | 10px | Default — buttons, inputs, dropdowns (`--radius` above) |
| `radius-lg` | 12px | Cards, modals |
| `radius-xl` | 16px | Large feature cards, POS product tiles |
| `radius-full` | 9999px | Avatar, status dot |

---

## 5. Elevation

BrewPoint stays **flat by default** — no drop shadows for structural hierarchy, relying instead on background contrast (`neutral-0` cards on `neutral-50` page background) and `1px` borders. Shadows are reserved for genuinely floating elements only:

| Level | Usage | Style |
|---|---|---|
| Flat | Cards, table rows, page sections | `background: var(--card); border: 1px solid var(--border);` no shadow |
| Raised | Dropdown menus, popovers | `box-shadow: 0 4px 12px rgba(15, 20, 24, 0.08)` |
| Overlay | Modals, dialogs | `box-shadow: 0 8px 24px rgba(15, 20, 24, 0.12)` + dimmed backdrop |

---

## 6. Components

### 6.1 Buttons

| Variant | Background | Text | Usage |
|---|---|---|---|
| `primary` | `navy-900` | white | The single main action per screen (e.g. "Checkout") |
| `secondary` | `cream-200` | `navy-900` | Supporting actions (e.g. "Redeem points") |
| `outline` | transparent, `navy-900` border | `navy-900` | Cancel, back, less-important actions |
| `destructive` | `danger-500` | white | Void transaction, delete product |
| `ghost` | transparent | `neutral-700` | Icon-only buttons, table row actions |

- Only **one** `primary` button per screen/view — this keeps the cashier's eye trained on the one action that matters.
- Buttons use `heading-3`-weight Inter (500), sentence case, never all-caps.
- Minimum touch target: 40px height on desktop/tablet — the POS screen is used on a touchscreen at the counter, so tap targets should stay generous even before a dedicated mobile app exists.

### 6.2 Cards

- `neutral-0` background, `1px solid var(--border)`, `radius-lg` (12px), `space-4` (16px) padding.
- Product cards on the POS screen use `radius-xl` (16px) and a slightly larger touch area than admin-side cards.

### 6.3 Badges / Status Tags

Used for transaction status, stock status, and user active/inactive state.

| Status | Background | Text |
|---|---|---|
| Completed | `success-100` | `success-500` |
| Voided | `danger-100` | `danger-500` |
| Low stock | `warning-100` | `warning-500` |
| Out of stock | `danger-100` | `danger-500` |
| Active (user) | `success-100` | `success-500` |
| Inactive (user) | `neutral-100` | `neutral-500` |

Badges: `caption` typography, `radius-full`, `space-2` horizontal padding, `4px` vertical padding.

### 6.4 Inputs

- `neutral-0` background, `1px solid var(--input)` border, `radius-md` (10px).
- Focus state: border becomes `blue-500`, plus a `0 0 0 3px rgba(74, 125, 189, 0.15)` focus ring — never rely on color alone, the ring is what actually signals focus for accessibility.
- Label uses `caption` weight (500) in `neutral-500`, positioned above the input.
- Error state: border becomes `danger-500`, helper text below in `danger-500`.

### 6.5 Tables

- Header row: `body-sm` weight 500, `neutral-500` text, `neutral-50` background, sticky on scroll for long transaction/product lists.
- Row height: minimum 44px for comfortable scanning during a shift.
- Zebra striping is **not** used — rely on `1px` row dividers (`neutral-100`) instead, keeps the dense screens calmer.
- Numeric columns (price, quantity, stock) are right-aligned and use `numeric-md`/`numeric-lg` tokens.

### 6.6 Iconography

- Icon set: [Lucide](https://lucide.dev) (shadcn/ui's default) — outline style, 1.5px stroke, consistent with the flat, calm brand direction.
- Default size: 16px inline with text, 20px in buttons, 24px max for standalone decorative use (e.g. empty states).
- Icons inherit currentColor — never hardcoded separately from the text/button color they sit next to.

---

## 7. Layout Density

BrewPoint has two distinct usage contexts that call for different density:

| Context | Density | Notes |
|---|---|---|
| **POS / Checkout screen** (cashier) | Comfortable, touch-friendly | Larger product tiles (`radius-xl`, `space-4`+ padding), big tap targets, minimal text — this screen is used standing up, often quickly |
| **Admin screens** (products, users, dashboard, transaction history) | Compact, information-dense | Tighter row heights, more columns visible at once — admin is usually seated, reviewing data, values information density over touch comfort |

Both contexts share the same color tokens, type scale, and component styles — only spacing/sizing decisions differ.

---

## 8. Accessibility Notes

- All text/background combinations in Section 2 meet at minimum **WCAG AA** contrast (4.5:1 for body text, 3:1 for large text/headings) — verified against `navy-900` on white, white on `navy-900`, and each semantic color's `-500` shade against its paired `-100` background.
- Focus states must always be visible (see 6.4) — the POS is a keyboard- and touch-mixed environment, and staff scanning barcodes may tab between fields.
- Never use color as the only signal for status — badges pair color with a text label (e.g. "Voided", not just a red dot); out-of-stock products show a text label, not just a dimmed image.

---

## 9. What's Deliberately Out of Scope for v1

- **Dark mode** — BrewPoint is a counter/back-office tool used in well-lit retail environments; not a priority for MVP. CSS variables are structured so it could be added later without a rework.
- **Custom illustration/mascot system** — unlike a consumer app, BrewPoint doesn't need a brand mascot; icons and color carry the personality.
- **Animation system** — kept to simple, fast transitions (150-200ms ease) on hover/focus states only; no motion design language needed for a utilitarian POS tool.

---

*BrewPoint Design System v1.0 — implements the color direction established in the earlier product design exploration, ready to pair with `TECH_SPEC.md`'s shadcn/ui + Tailwind setup.*
