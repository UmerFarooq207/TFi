# TFi Floors & Interiors — Design Specification

> A complete blueprint of the design system, theme, templates, animations and typography used in this project, so the look and feel can be re-implemented in a different codebase.

The site is built with **Next.js 16 + React 19 + Tailwind v4 + Framer Motion 12**. The whole design language is dark, editorial and photography‑led, with cream/ink contrast, fine 1px borders, ultra‑wide tracking on eyebrow labels, big tight‑letter‑spaced display headings, and motion that is gentle, masked, and pinned to scroll.

---

## 1. Design Philosophy

| Pillar | Description |
| --- | --- |
| **Editorial luxury** | High‑end magazine aesthetic. Lots of negative space. Hairline 1px rules separating blocks rather than heavy boxes. |
| **Dark + cream duality** | Public marketing pages use a **warm cream** surface (`#ECE9E2`) with **deep ink** type (`#0E0F10`). Banner sections invert to ink with cream type. |
| **Photography‑led** | Big full‑bleed imagery with dark linear/radial overlays. Image is the hero — typography sits over it. |
| **Flat + razor sharp** | Border radius is intentionally tiny (`0.25rem` / 4px) or pill (`9999px`). No big card shadows in light mode; soft long shadows only on dark CTAs. |
| **Motion as choreography** | Reveals are masked/letter‑boxed, pinned scroll sections expand frames and crossfade copy. All motion respects `prefers-reduced-motion`. |
| **Tactile micro‑details** | Diamond bullet `◆`, arrow glyph `↳`, ultra‑tracked eyebrow labels, tabular numerals on prices, dashed borders for spec panels. |

---

## 2. Theme System (CSS Variables)

The app exposes **three themes** by toggling a class on `<html>` in `AppShell`:

1. **`html.tfi-theme`** — public marketing pages (cream background, dark type).
2. **`html.admin-theme`** — admin dashboard (off‑white surface, near‑black ink).
3. **Default (no class)** — dark luxury palette used on auth pages / login / signup (deep dark with warm accent).

### 2.1 Raw brand tokens (`:root`)

```css
:root {
  --tfi-ink:        #0e0f10;             /* primary type / dark surfaces */
  --tfi-ink-2:      #16181a;             /* slightly lifted ink */
  --tfi-cream:      #ece9e2;             /* primary surface */
  --tfi-cream-2:    #e3dfd6;             /* secondary surface (cards, hovers) */
  --tfi-line:       #c8c4b9;             /* hairline borders */
  --tfi-line-dark:  rgba(255,255,255,0.12);
  --tfi-mute:       #6c6d6f;             /* muted text on cream */
  --tfi-mute-dark:  rgba(255,255,255,0.55);
  --tfi-accent:     #b54a2c;             /* warm rust / terracotta */
  --tfi-success:    #4f7d3a;

  --tfi-px:         6vw;                 /* horizontal page padding */
  --tfi-px-min:     24px;
  --tfi-section-y:  120px;               /* vertical section padding */

  --tfi-r-sm: 6px;
  --tfi-r-md: 10px;
  --tfi-r-lg: 18px;
  --tfi-r-pill: 9999px;

  --tfi-ease: cubic-bezier(0.2, 0, 0, 1);
}
```

### 2.2 Public marketing theme — `html.tfi-theme`

```
--background        : #ECE9E2 (cream)
--foreground        : #0E0F10 (ink)
--card              : #FFFFFF
--primary           : #0E0F10
--primary-foreground: #ECE9E2
--secondary         : #E3DFD6 (cream-2)
--muted             : #E3DFD6
--muted-foreground  : #6C6D6F
--accent            : #B54A2C (terracotta)
--accent-foreground : #FFFFFF
--destructive       : #B8302D
--border / --input  : #C8C4B9
--ring              : #0E0F10
--radius            : 0.25rem (4px)
```

body: cream background, ink color, **15px** Inter, `line-height: 1.55`, `letter-spacing: 0.005em`.

### 2.3 Dark luxury palette (default, oklch)

Used on login/signup/forbidden pages.

```
--background : oklch(0.09 0.006 55)   /* near black, warm */
--foreground : oklch(0.93 0.010 80)   /* warm off-white */
--card       : oklch(0.13 0.007 55)
--primary    : oklch(0.93 0.010 80)
--accent     : oklch(0.72 0.095 75)   /* warm amber */
--ring       : oklch(0.72 0.095 75)
```

### 2.4 Admin theme — `html.admin-theme`

```
--admin-surface      : #F3F0EC
--admin-ink          : #212325
--admin-border-subtle: rgba(33,35,37,0.15)
--admin-muted-text   : rgba(33,35,37,0.65)
--primary            : #212325
--primary-foreground : #F3F0EC
```

Alternating table rows: `rgba(33,35,37,0.035)`.

---

## 3. Typography

Five Google fonts are loaded in `app/layout.tsx` and exposed as CSS variables:

| Variable | Font | Weights | Used for |
| --- | --- | --- | --- |
| `--font-geist-sans` | **Geist Sans** | default | UI fallback / Tailwind `font-sans` |
| `--font-geist-mono` | **Geist Mono** | default | code / tabular bits |
| `--font-playfair` | **Playfair Display** | 400, 500, 600, 700, 900 | mapped to `--font-heading` (legacy / admin headings) |
| `--font-inter` | **Inter** | 400, 500, 600, 700 | body text everywhere |
| `--font-inter-tight` | **Inter Tight** | 400, 500, 600 | **display / heading family** (this is the visual signature) |

`<html>` carries all five `*.variable` class names plus `antialiased`. The body uses `var(--font-inter)` as base, all headings use `var(--font-inter-tight)`.

### 3.1 Type Roles (reusable utility classes)

```css
.t-display {                          /* hero / page H1 */
  font-family: var(--font-inter-tight);
  font-weight: 500;
  font-size: clamp(40px, 5.4vw, 76px);
  line-height: 1.05;
  letter-spacing: -0.025em;
}
.t-h2 {                               /* section heading */
  font-family: var(--font-inter-tight);
  font-weight: 500;
  font-size: clamp(28px, 3vw, 44px);
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.t-h3 {
  font-family: var(--font-inter-tight);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.012em;
}
.t-eyebrow {                          /* tiny tracked label above headings */
  font-family: var(--font-inter);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.t-eyebrow .diamond {                 /* 45° rotated bullet */
  display: inline-block;
  transform: rotate(45deg) translateY(-1px);
  margin-right: 8px;
  font-size: 10px;
}
.t-meta { font-size: 12px; letter-spacing: 0.04em; color: var(--tfi-mute); }
```

### 3.2 Heading rules of thumb

| Slot | Family | Weight | Size (clamp) | Letter‑spacing |
| --- | --- | --- | --- | --- |
| Page hero H1 | Inter Tight | 500 | 40 → 76px | −0.025em |
| Section H2 | Inter Tight | 500 | 28 → 56px | −0.022 → −0.025em |
| Card title | Inter Tight | 500 | 17 → 26px | −0.01 to −0.018em |
| Eyebrow | Inter | 600 | 10–11px | **+0.18 to +0.32em**, UPPERCASE |
| Body | Inter | 400 | 15px (14.5 mobile) | +0.005em |
| Price / Number | Inter Tight | 500/600 | 20–60px, tabular nums | −0.02em |

Body line height is **1.55**, headings hover around **1.05 – 1.15**.

### 3.3 Special heading pattern (italic muted second line)

A common pattern on About / Services / CTAs:

```jsx
<h1 className="font-heading font-medium leading-tight">
  <span className="block text-5xl md:text-6xl lg:text-7xl">UK Interior</span>
  <span className="block text-5xl md:text-6xl lg:text-7xl italic text-foreground/40">
    Specialists Since 2010
  </span>
</h1>
```

A bright primary line followed by an **italic, 40% opacity** second line. Use for hero‑level page headings on dark sections.

---

## 4. Spacing, Layout & Grid

* Page horizontal padding: `--tfi-px: 6vw` (clamps down to `clamp(20px, 5vw, 36px)` ≤ 900px, `20px` ≤ 640px).
* Section vertical padding: `--tfi-section-y: 120px` (80 ≤ 900px, 64 ≤ 640px).
* Max content width for admin/about/services: `max-w-7xl` (1280px) centered with `px-6 lg:px-10`.
* Bento grid: `display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px;` collapses to single column ≤ 900px.
* Product grids: 4 cols (default), 3 cols ≤ 1100px, 2 cols ≤ 900px, 2 cols ≤ 540px.
* Hairline dividers everywhere: `border-bottom: 1px solid var(--tfi-line)` (24px padding above & below).

### 4.1 Radii

* Cards / images: `4px` (very subtle).
* Pills / chips / FABs: `9999px`.
* Hero stat cards: square (0).
* Drawer thumbnails: `2px`.
* Big sticky frames: `8px → 0px` animated to flat on scroll.

---

## 5. Buttons & Pills

### 5.1 Primary pill (`.tfi-pill`)

Ink‑filled rounded capsule with cream text and a `↳` arrow glyph.

```css
.tfi-pill {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 10px 18px;
  border-radius: 9999px;
  background: var(--tfi-ink);
  color: var(--tfi-cream);
  font-family: var(--font-inter);
  font-weight: 600; font-size: 11px;
  letter-spacing: 0.16em; text-transform: uppercase;
  transition: opacity 200ms var(--tfi-ease), background 200ms var(--tfi-ease);
}
.tfi-pill:hover { opacity: 0.85; }
.tfi-pill .arrow { font-size: 13px; line-height: 1; }   /* "↳" */
```

Modifiers:

* `.tfi-pill--ghost` — transparent / 8% white / cream border on dark sections.
* `.tfi-pill--light` — cream filled, ink text (used on dark sections).
* `.tfi-pill--outline` — transparent, ink text, 1px ink border.

The arrow character used everywhere is `↳` (HTML `&#x21B3;`).

### 5.2 Inline link (`.tfi-link`)

Same eyebrow tracking, opacity hover.

```css
.tfi-link {
  display: inline-flex; gap: 8px;
  font-family: var(--font-inter); font-weight: 600; font-size: 11px;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: inherit; text-decoration: none;
}
.tfi-link:hover { opacity: 0.7; }
```

### 5.3 Admin pill (`.admin-pill`)

Squared (0 radius), 22px horizontal padding, 11px tall text at `letter-spacing: 0.24em`. `--ghost` modifier swaps to transparent with subtle border.

---

## 6. Navigation — Floating Dock (the signature element)

The nav is **not** at the top. It is a small fixed bar floating bottom‑center.

### 6.1 Resting state — `.tfi-dock`

```
position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
z-index: 70;
height: 56px; width: 420px;  (52 / 360 on mobile)
background: rgba(14,15,16,0.88);
backdrop-filter: blur(12px);
color: cream;
border-radius: 0;
box-shadow: 0 6px 24px rgba(0,0,0,0.28);
overflow: hidden;
display: inline-flex; align-items: center;
```

Three slots laid horizontally (no gap):

1. **Logo** — 56×56 square, TFi monogram PNG (26px tall).
2. **Page label** — flex:1, centered, current page name (`Home`, `Collections`, `Estimate`…). Font: Inter 600, 12px, `letter-spacing: 0.28em`, UPPERCASE.
3. **Burger** — 56×56 square with three 20×2px bars stacked at y=20/27/34.

### 6.2 Burger ⇄ X morph

When the modal opens, the dock animates:

```
width: 56px → 420px reverses (collapse from middle)
opacity: 1 → 0  with 380ms delay
transform: translateX(-50%)
```

Simultaneously the three bars rotate:

```css
.tfi-dock.menu-open span:nth-child(1) { top: 27px; transform: rotate(45deg); }
.tfi-dock.menu-open span:nth-child(2) { opacity: 0; }
.tfi-dock.menu-open span:nth-child(3) { top: 27px; transform: rotate(-45deg); }
```

Transitions:

```
width 460ms cubic-bezier(0.34, 1.2, 0.64, 1)
opacity 200ms var(--tfi-ease) 360ms
bars: all 380ms var(--tfi-ease)
```

### 6.3 Genie‑bottle menu modal — `.tfi-modal`

A full‑screen darkened backdrop (`rgba(14,15,16,0.75)` + `blur(14px)`) with a panel that **emerges from the dock's location** (transform‑origin `center bottom`, scaleY 0.2 → 1, translateY 110% → 0).

```css
.tfi-modal__panel {
  width: min(94vw, 460px);
  max-height: 78vh;
  background: rgba(20,22,24,0.98);
  backdrop-filter: blur(20px);
  color: var(--tfi-cream);
  padding: 36px 36px 40px;
  transform-origin: center bottom;
  transform: translateY(110%) scaleY(0.2);
  transition: opacity 480ms, transform 520ms cubic-bezier(0.34,1.2,0.64,1);
}
.tfi-modal.is-open .tfi-modal__panel { opacity: 1; transform: translateY(0) scaleY(1); }
```

Inside the panel:

* `tfi-modal__eyebrow` ("Menu" label, 10px tracked).
* `tfi-modal__menu` — link list. Each link is **Inter Tight 500 38px** with `letter-spacing: -0.025em`. Each `<li>` enters with `opacity 0 → 1, translateY 12 → 0` on **staggered** delays of `60, 100, 140, 180, 220 ms`. Hover: `opacity: 0.65`.
* `tfi-modal__contact` — 2‑col grid (auto / 1fr) of muted labels + cream values (Phone / Email), entering at +260ms delay.
* `tfi-modal__cta` — full‑width "↳ Get a quote" pill, glass background `rgba(255,255,255,0.10)` + `rgba(255,255,255,0.20)` border, +300ms.
* `tfi-modal__close` — 56×56 black tile with two 20×2px white bars rotated 45°/−45° (X), bottom‑centered, scale‑in 0.35 → 1 (460ms with 280ms delay).

Behavior (`components/tfi-dock.tsx`):

* Auto‑closes on `Escape`.
* Auto‑closes on scroll‑down > 30px.
* Auto‑opens when the **footer** scrolls into view (≥ 90% visible). The footer dispatches a `tfi:footer-menu` CustomEvent.
* Resets on `pathname` change.

### 6.4 Top bar — `.tfi-topbar`

Absolute‑positioned at top of hero / page (`top: 32px`, `padding: 0 6vw`), holds:

* Left: eyebrow label (e.g. `◆ Contact`).
* Right (`.tfi-topbar__right`, gap 32px): a "↳ Get a quote" `.tfi-link` and the floating cart button.

Two modifiers: `.tfi-topbar--on-image` (white) and `.tfi-topbar--on-cream` (ink).

### 6.5 Floating cart FAB — `.tfi-cart-fab`

28×28 transparent button, white SVG cart icon, drop‑shadow `0 2px 8px rgba(0,0,0,0.45)`. A circular count badge `.tfi-cart-fab__count` (16×16, cream/ink, 10px tabular numerals) sits at `top: -6px; right: -8px`. `--ink` modifier flips colors for cream backgrounds.

---

## 7. Hero — Pinned Two‑Stage Reveal (`HeroPin`)

The home hero is a **220vh tall section** with a **sticky inner stage** holding a background image. Framer Motion's `useScroll` + `useSpring` (`{ stiffness: 90, damping: 24, mass: 0.4 }`) drives several `useTransform`s:

| Element | Scroll range | From | To |
| --- | --- | --- | --- |
| Background image scale | 0 → 1 | 1.06 | 1.00 |
| Dark overlay opacity | 0 → 0.5 → 1 | 0.30 → 0.45 → 0.55 |
| Title Y | 0 → 0.4 | `0vh` | `-30vh` |
| Title opacity | 0 → 0.32 → 0.42 | 1 → 1 → 0 |
| Panel opacity | 0.38 → 0.62 | 0 → 1 |
| Panel Y | 0.38 → 0.7 | 30 → 0 |

Stage 1: huge centered headline ("Elevating Interiors / from the Ground Up.") at `bottom: clamp(96px, 14vh, 160px)`, font `clamp(36px, 5vw, 64px)`, `letter-spacing: -0.025em`, white with `text-shadow: 0 2px 24px rgba(0,0,0,0.45)`. Each line is wrapped in the `<Reveal>` mask component (see §11).

Stage 2: a `hero-pin__panel-row` grid (auto | 1fr | auto) with eyebrow / **1px white 0.45 divider line** / supporting copy.

Background image has two extra layers:

* `hero-pin__leaf-l/r` — two radial blurred green vignettes (36% × 70%, blur 28px) anchored top‑left and bottom‑right, simulating foliage shadow.
* `hero-pin__overlay` — animated gradient overlay (`linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.55) 100%)`).

For `prefers-reduced-motion`, the same content renders inside a flat `.home-hero` section (no transforms).

---

## 8. Section Catalogue

### 8.1 Product Collection — Bento grid (`.collection` + `.bento`)

```
background: cream
padding: 80px 6vw 120px
grid: 12 cols, gap 20px
```

Bento card variants:

| Class | Span | Aspect |
| --- | --- | --- |
| `.bc-sm`       | 5 | 5 / 4 |
| `.bc-lg`       | 7 | 16 / 10 |
| `.bc-half-l`   | 6 | 16 / 10 |
| `.bc-half-r`   | 6 | 16 / 10 |
| `.bc-full`     | 12 | 21 / 8 |

Each card (`.bento-card`):

* Dark `#1a1a1c` background, 4px radius.
* Full‑bleed `img` with `transition: transform 700ms cubic-bezier(0.2,0,0,1)` → `scale(1.06)` on hover.
* `::after` pseudo gradient `rgba(0,0,0,0) 60% → rgba(0,0,0,0.18)` fades in (320ms) on hover.
* Inner `.bc-body` with top/bottom content, eyebrow at top (`.bc-eyebrow`, 11px 0.18em), title at bottom (`.bc-title`, Inter Tight 500 26–38px), and a glass pill (`.bc-pill`, 16% white, 30% white border, 6px backdrop blur).

### 8.2 Featured Products grid (`.products` + `.product-grid`)

`background: var(--tfi-cream-2)` (slightly darker cream), 100px top, 4‑col grid, 28px row / 22px column gap.

`.p-card`:

* Cream background, 4px radius, 1px transparent border.
* Hover: `transform: translateY(-4px); box-shadow: 0 12px 32px rgba(14,15,16,0.08); border-color: var(--tfi-line);`.
* Media area `aspect-ratio: 4/5` with `transform: scale(1.04)` on hover (600ms ease).
* `__badge` — black 5×9 pill, 10px 600 0.16em uppercase. `.is-sale` swaps to terracotta.
* `__cart` — 38px circular ink button bottom‑right of media, **opacity 0 + translateY 8px** at rest, becomes visible on card hover.
* `__body` — category eyebrow (10px 0.18em 60% mute), title (Inter Tight 500 17px), price row.

### 8.3 Showroom — Pinned Frame Expansion (`ShowroomScroll`)

220vh tall ink‑backed section. The framed photo starts as a `min(900px, 78vw) × min(54vh, 540px)` card with `border-radius: 8`, then over scroll 0 → 0.7 grows to `100vw × 100vh` with `border-radius: 0` while a title fades out and a caption fades in.

| Channel | 0 | 0.7 |
| --- | --- | --- |
| width | min(900px, 78vw) | 100vw |
| height | min(54vh, 540px) | 100vh |
| borderRadius | 8px | 0px |
| overlay opacity | 0.55 | 0.55 (dips to 0.35 mid) |
| titleScrim | 0.45 → 0.25 → 0 | — |
| title opacity | 1 → 1 → 0 | — |
| title Y | 0 → −40px | — |
| caption opacity | 0 → 1 | — |
| caption Y | 30 → 0 | — |

Smoothed by `useSpring({ stiffness: 90, damping: 24, mass: 0.4 })`. Caption sits bottom‑right of the frame with label `Birmingham · Hamstead` and a "↳ Plan a visit" pill.

### 8.4 Testimonials Marquee (`.testimonials` + `TestimonialsMarquee`)

```
background: ink (#0e0f10)
color: cream
padding: 100px 0
overflow: hidden
```

Header has eyebrow + big "Trusted by Architects, / Homeowners & Trade." heading.

The marquee track is:

* Items doubled (so the loop is seamless).
* `mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)` — soft edges.
* Animated by Framer Motion `useAnimationFrame` (default `speed: 38px/s`); the CSS keyframe `marquee-scroll 48s linear infinite` exists as a fallback (`.marquee__track--js` disables it when JS is driving).
* Hover / touch pauses motion.

Card (`.testimonial`):

* `flex: 0 0 380px` (280px ≤ 900px).
* `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`, 4px radius, 28px padding.
* Stars: `★ / ☆` in `#d49a3a` (warm gold).
* Quote: Inter Tight 400 17px, `line-height: 1.45`.
* Person row: 40×40 round avatar w/ initials + name (13px 600) + role (12px mute‑dark).

### 8.5 Approach band (`.approach`)

Full‑bleed Unsplash photo, 80vh min height, ink overlay 0.15 → 0.6 vertical gradient. Bottom‑left content (`max-width: 720px`) with eyebrow + 36–64px heading + pill CTA.

### 8.6 Stats band (`.stats`)

Cream background, 4‑col grid (2 ≤ 900px, 2 ≤ 540px), 32px gap, `border-top: 1px solid var(--tfi-line)`.

* `.num` — Inter Tight 500 **56px**, `letter-spacing: -0.025em`, `line-height: 1`.
* `.lbl` — 12px 0.04em mute, `max-width: 200px`, 10px above.

### 8.7 Footer — `.tfi-footer` (full‑screen reveal panel)

```
min-height: 92vh
background: #2a2c2e + /assets/image1.jpg cover
padding: 80px 6vw
color: cream
position: relative; overflow: hidden;
```

Pseudo `::before` adds a dark gradient `0.25 → 0.55`.

Layout:

* `.tfi-footer__logo` — TFi monogram 120×120 centered absolutely.
* `.tfi-footer__up` — 40×40 round ink button, bottom 56px, right 6vw. Hover: `background: var(--tfi-accent); transform: translateY(-2px);` plus Framer `whileHover={{ y:-3, scale: 1.05 }}` spring (stiffness 320, damping 24).
* `.tfi-footer__base` — bottom row split between `©2026, TFi · Instagram · Pinterest · LinkedIn` and `Privacy / Terms / Trade portal`.

The footer is observed via `IntersectionObserver(threshold: 0.9)` and fires `tfi:footer-menu` events to auto‑open the dock modal.

### 8.8 Scroll‑to‑top FAB (`.tfi-scroll-top`)

Appears after 400px of scroll. 48×48 round ink button, fixed bottom‑right 28px. Hover: `background: var(--tfi-accent)`. Framer Motion: `initial opacity 0 y 18 scale 0.85 → animate 1, 0, 1; spring 320/24`.

---

## 9. Product Detail Page — "PDV2" Editorial Layout

Two main blocks: a hero with breadcrumbs/title/desc/buy band, then a 50%‑slide gallery strip, then technical specs.

### 9.1 Breadcrumbs (`.pdv2-crumbs`)

11px 0.18em UPPERCASE 600, 60% muted, current item 100% ink. Separators `·` at 40% opacity.

### 9.2 Title cluster

```
.pdv2-collection : Inter Tight 700, clamp(28–44px), -0.022em, 45% ink
.pdv2-title      : same scale, but 100% ink, 4px gap
.pdv2-title__sku : same line, 8px gutter
```

`.pdv2-pills` row — small ink pills (8×16 padding, 9999 radius, 12px 500) listing attributes.

### 9.3 Description with toggle

`.pdv2-desc p` — 15px 1.65 ink, **78ch max width**. `.pdv2-desc__toggle` — 11px tracked button with **1px solid ink border-bottom** ("READ MORE" style underlined link).

### 9.4 Gallery (`.pdv2-gallery`)

* `track` — horizontal scroll-snap (`x mandatory`), each slide `flex: 0 0 50%`, `aspect-ratio: 16 / 10`. On mobile 100%.
* Hidden scrollbars.
* `__nav` — 50×50 white tile buttons (`box-shadow: 0 8px 28px -10px rgba(0,0,0,0.28)`) flush against the page padding on each side. `--left` at `left: 6vw`, `--right` at `right: 6vw`. Disabled state fades to 0 with no pointer events.

### 9.5 Buy band (`.pdv2-buy`)

Above a 1px line. Left: price `clamp(24–32px)` Inter Tight 600 + 12px 0.18em unit label. Right: actions group (quantity stepper + add‑to‑cart pill + outline `Save` pill).

### 9.6 Spec block (`.pdv2-tech` + `.pd-spec__*`)

* `.pdv2-tech__title` — Inter Tight 800 (slightly heavier), 20–28px, UPPERCASE.
* `.pd-spec__toggle` — text + 46×22 pill switch (`.pd-spec__switch`). The 16px circle translates `0 → 24px` over 220ms. Active label flips between `mm` and `in` (font 12px 0.18em 600).
* `.pd-spec__size` — **dashed border** (`1px dashed var(--tfi-line)`) 28×24 box, centered label + dimension value.
* `.pd-spec__grid` — 2‑col grid with rows `padding: 16px 0; border-bottom: 1px solid var(--tfi-line)`. Each row: key (13px mute) + value (15px 600 ink).

### 9.7 Collection carousel below (`.cc`)

* Horizontal scrolling list of related products in the same collection, snap to start.
* `.cc__card` width `clamp(180px, 18vw, 240px)`, 1:1 media.
* Active card outlined `outline: 2px solid var(--tfi-ink); outline-offset: 4px;`
* `__nav` buttons — 44×44 white tiles **outside** the track (left: -22px, right: -22px) with 6px shadow.

---

## 10. Other Page Templates

### 10.1 Auth (login / signup) — split layout (`.auth-shell`)

Two‑column grid `1.05fr / 1fr`. `--reverse` modifier flips order.

* **Visual side** — full bleed `/assets/image1.jpg` (or `image2.jpg`), `transform: scale(1.04)` at rest, `1.08` on container hover (1.4s ease). Overlay `linear-gradient(180deg, 0.30 → 0.05 → 0.65)`. Top‑left brand mark, bottom‑left big editorial pull‑quote (Inter Tight 500 20–30px white, `text-shadow: 0 2px 18px rgba(0,0,0,0.4)`).
* **Form side** — cream, centered panel `max-width: 420px`. Title `Inter Tight 500 26–36px`, sub copy 13px 70%. Inputs are **underlined**: `border: 0; border-bottom: 1px solid var(--tfi-line); padding 6px 0 8px;` focus → ink border. Errors `#b3261e` 11px. Submit pill is full width 42px tall, 11px 0.2em.
* Spinner: 0.9s linear `rotate(360deg)`.
* Collapses to single column ≤ 900px (visual 38vh top, form below).

### 10.2 Calculator (`.est-hero` + `.est-layout` + `.est-card`)

Sticky 2‑col layout (`1fr / 1.15fr`, sticky left side at top 24px).

* **Left** — Eyebrow with `::before { content: "◆" }`, large title, numbered steps list (`.est-step` — 56px col for big translucent 32px Inter Tight numeral + title + copy). Plus a 2×2 trust card grid with internal 1px lines.
* **Right** — `.est-card` is an **ink panel** (cream type) with a top hairline gradient. Header line with title and a small green pulsing dot (`box-shadow: 0 0 8px rgba(141,224,141,0.7)`, 1.6s ease‑in‑out pulse). Fields use **inverted underline inputs** (`border-bottom: 1px solid rgba(255,255,255,0.18)`). Summary section bottom, big total at 30px Inter Tight 500. Two‑column action pills (cream filled + outline).
* Below: `.est-faq` — 2‑col grid of Q/A pairs with internal hairlines, collapses to 1 col ≤ 1024px.

### 10.3 Contact (`.ct`)

Top bar with eyebrow + "↳ Estimate calculator". Section `.ct` has the page H1 (clamp 40–68px) then `.ct__grid` (`1.1fr / 1fr`):

* Left: `.ct__map` Unsplash photo + ink pin (`42px circle, ring shadow: 0 0 0 6px rgba(255,255,255,0.25)`) plus 2‑col address grid.
* Right: form (inputs with 1px line border, 4px radius, 14px padding).

### 10.4 Collections / Products listing (`.col-hero`, `.col-toolbar`, `.col-grid-v2`)

* `.col-hero` — cream, 120/36px padding, breadcrumb (11px 0.22em), title `clamp(40–72px)`, sub 15–17px, then `.col-hero__chips` — a pill bar with sub‑chips inside (active chip = ink fill, inactive = transparent 60%).
* `.col-toolbar` — sticky (`top:0`, `backdrop-filter: blur(6px)`) result count + sort `<select>`. Select uses CSS chevron via two linear‑gradient triangles trick.
* `.col-grid-v2` — 4 / 3 / 2 cols. Card `.col-card-v2`:
  - Media `aspect-ratio: 4/5`, hover scales image to 1.05 (600ms).
  - `__overlay` — bottom gradient + cream "↳ View" pill, fades in on hover.
  - `__badge` — ink chip 9px 0.22em UPPERCASE, top‑left.
  - Body: 9.5px UPPERCASE cat / 14.5px Inter Tight name / 12.5px price.
* `.col-skeleton` — shimmer linear gradient `8 → 18 → 33%` looped over `200% / 100%` background 1.4s.
* `.col-cta` — ink band CTA, 96px padding, centered headline + row of pills.

### 10.5 Cart page (`.cart-hero` + `.cart-stepper` + `.cart-layout`)

* Hero with breadcrumbs + 40–80px title.
* `.cart-stepper` — three‑step horizontal flow (`Cart · Shipping · Payment`), 1px hairlines top/bottom and between, 28×28 circular numerals, active step at full opacity, others at 0.5.
* `.cart-layout` — `1fr / 380px` grid (1 col ≤ 1024px).
* `.cart-list` — bordered table‑like component, 5‑col grid (`140 | 1fr | 120 | 120 | 32`) inside each row. Each `.cart-row` has 140×140 thumbnail, info (cat eyebrow + name + unit), pill quantity stepper, total, remove × icon. Below 1024px the row becomes a 2‑row grid via `grid-template-areas`.
* `.cart-summary__inner` — ink panel, cream type, hairline gradient on top, `box-shadow: 0 30px 80px rgba(14,15,16,0.18)`. Promo input is **underlined**. Total displayed at 30px Inter Tight 500. Checkout button is `tfi-pill.cart-summary__checkout` — cream‑outlined transparent capsule that **fills cream** on hover (color flips to ink).
* Perks list with `◆` marks (9px, 70% opacity).

### 10.6 Checkout (`.ck2`) — payment stage

2‑col grid `1fr / 360px`, both inside an ink box (`border: 1px solid ink; background: ink; overflow: hidden`).

* Left `.ck2__form` — ink background, cream type, 12px 0.32em UPPERCASE 600 section headers (`.ck2__sec`) above hairline rules. Inputs: 1px white‑18% border, transparent‑white‑4% background, cream text. Focus → cream border + 7% bg.
* Right `.ck2__summary` — slightly darker `#0a0b0c`, separated by `border-left: 1px solid rgba(255,255,255,0.1)`.
* `.ck2__actions` — two flat cream‑outlined pills that invert on hover.
* `.ck2__lock` — small "secure" line with 11.5px text 55% opacity.

### 10.7 Visualizer (`.viz-shell`)

Full‑viewport split: ink/cream room photo stage on the left and a **cream rail** (`width: clamp(320px, 28vw, 420px)`) on the right.

Key elements:

* `.viz-back` — top‑left **glass pill** (44px tall, `rgba(255,255,255,0.92)`, `backdrop-filter: blur(18px) saturate(160%)`, multi‑layer shadow + inset white line). Hover translates up 2px. On mobile becomes a 40×40 circle (icon only).
* `.viz-stage__compare` — vertical "Compare" tab at the rail edge with rotated text (writing-mode: vertical-rl). On mobile turns into a slim 34×72 rectangular tab with rounded left corners, attached to the viewport edge.
* `.viz-stage__photo-img` — cross‑fades each new render with a 0.55s opacity animation.
* `.viz-rooms` — horizontal selector of room thumbnails (56×42) inside a translucent ink chip with cream borders.
* `.viz-rail__tabs` — underline tab nav (1px ink bar at bottom of active).
* `.viz-card` — product card with 4/3 media, ink badge top‑right, info round button bottom‑right, 13px name underneath.

### 10.8 Cart drawer (Sheet) — `.tfi-drawer`

Right‑side sheet, `max-width: 460px`, cream background. Header has the `◆ Your selection` eyebrow + `Cart · 3` title + 36px circular outline close button. Each row is a `96 | 1fr | auto` grid with thumbnail / info / quantity + price / remove. Empty state shows a 16px `◆` mark, big "Nothing here yet." headline (Inter Tight 22px), copy and a "↳ Browse the collection" pill.

The rows use Framer Motion `layout` + `AnimatePresence` to smoothly collapse `height: 0` on remove (220ms ease `[0.32, 0.72, 0, 1]`).

### 10.9 Admin dashboard (`html.admin-theme`)

* Page max‑width 1320px centered.
* `.admin-topbar` — 56px tall, 28px gutter, `border-bottom: 1px solid var(--admin-border-subtle)`.
* `.admin-eyebrow` — 10px 0.34em with a 22×1px leading line (45% opacity).
* `.admin-h1` — Inter Tight 500 clamp(30–44px), with a 35%‑opacity accent suffix.
* `.admin-stat` — white cards with 1px subtle border, hover lifts `translateY(-2px)` + `0 14px 32px -22px rgba(33,35,37,0.4)` shadow.
* `.admin-pill` — black squared pill, 11px 0.24em.
* Forms broken into `.admin-form__group` blocks with hairline separators, numbered eyebrow labels (`01`, `02`, …).

---

## 11. Motion System

### 11.1 Standard easing

```ts
const EASE = [0.22, 1, 0.36, 1] as const          // expo-out
const SPRING_OPEN = { type: "spring", stiffness: 320, damping: 24 }
const HERO_SPRING = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
```

CSS variable `--tfi-ease: cubic-bezier(0.2, 0, 0, 1)` is used for the rest (hover, opacity, color).

Custom curves used in dock + modal:

| Where | Curve |
| --- | --- |
| Dock width | `cubic-bezier(0.34, 1.2, 0.64, 1)` (overshoot) |
| Modal panel emergence | `cubic-bezier(0.34, 1.2, 0.64, 1)` |
| Modal close | `cubic-bezier(0.6, 0, 1, 1)` |
| Bento image hover | `cubic-bezier(0.2, 0, 0, 1)` 700ms |
| Cart row collapse | `cubic-bezier(0.32, 0.72, 0, 1)` 220ms |

### 11.2 Reveal primitives (`components/reveal.tsx`)

```tsx
<Reveal>...</Reveal>            // mask reveal: overflow:hidden, child y:110% → 0, opacity 0 → 1, duration 0.85s
<Reveal delay={0.12}>...</Reveal>
<FadeUp y={32} delay={0.2}>...</FadeUp>  // block: y:32 → 0, opacity 0 → 1, 0.7s
<StaggerGroup stagger={0.06}>
  <StaggerItem y={28}>...</StaggerItem>  // y:28 → 0, opacity, 0.6s
  ...
</StaggerGroup>
```

All three use `useInView({ once: true, amount: 0.05–0.1, margin: "0px 0px -8% 0px" })` and bail out to plain divs when `useReducedMotion()` is true.

### 11.3 Page transition (`PageTransition`)

Wraps `{children}` of every public page inside `AnimatePresence mode="popLayout"`:

```ts
initial : { opacity: 0, y: 110, scale: 1,    filter: "blur(8px)" }
animate : { opacity: 1, y: 0,   scale: 1,    filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.05 } }
exit    : { opacity: 0, y: -24, scale: 0.965, filter: "blur(6px)",  transition: { duration: 0.42, ease: [0.4,0,0.6,1] } }
```

Plus an automatic `window.scrollTo({ top: 0, behavior: smooth })` on `pathname` change.

### 11.4 Hero animation (`components/hero-animation.tsx`)

```ts
<HeroItem delay={0.1}>...</HeroItem>
// y: 28 → 0, blur(10px) → blur(0), opacity 0 → 1, 0.9s ease [0.22,1,0.36,1]
```

### 11.5 FadeIn (`components/fade-in.tsx`)

Used on About / Services. Takes `direction = "up" | "down" | "left" | "right" | "none"`, offsets are `±36px`. Animation includes a `blur(6px) → blur(0)`. Duration 0.75s, ease `[0.22,1,0.36,1]`, viewport margin `-72px`.

### 11.6 Marquee (`useAnimationFrame`)

Track is doubled. On each frame `x.set(x - (speed * delta) / 1000)`; if it crosses `-trackWidth`, add it back. `speed` default 38 px/s. Hover/touch pauses by setting a ref flag.

### 11.7 Global reduced‑motion rules

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

All custom motion components branch on `useReducedMotion()` and render plain children.

### 11.8 Keyframes used

```css
@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(calc(-100% - var(--marquee-gap))); } }
@keyframes viz-photo-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes viz-spin       { to   { transform: rotate(360deg); } }
@keyframes auth-spin      { to   { transform: rotate(360deg); } }
@keyframes col-shimmer    { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes est-pulse      { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
```

---

## 12. Iconography & Glyphs

* **Lucide React** for all interface icons (`ArrowRight`, `Check`, `Minus`, `Plus`, `X`, `ChevronsLeft/Right`, etc.) at sizes 13–18px, `strokeWidth: 1.6 – 2`.
* Brand glyphs used as **characters** (not SVGs):
  - `◆` — diamond bullet on eyebrows, rotated 45° via CSS (`.diamond`).
  - `↳` — arrow on all "↳ View / ↳ Get a quote" pills.
  - `★ / ☆` — testimonial ratings (no icon font).
  - `−` and `+` glyphs on the account submenu toggle.
* The TFi monogram is a square PNG (`/assets/TFI-nav-footer.png`), 36px tall in the dock, 120px in the footer.
* The hero logo image is `/assets/TFi-logo.png`, displayed at `height: clamp(72px, 9vw, 120px)`.

---

## 13. Imagery & Overlays

* Hero, footer and showroom backgrounds use **local** `/assets/image1.jpg`, `image2.jpg`, `image3.jpg`.
* Bento and approach sections use **Unsplash** URLs with `?w=1200|1600|2000&q=70`.
* **Every** dark photo block has a layered gradient overlay applied via `::before`:
  - Hero: `linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.45) 100%)`.
  - Footer: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55))`.
  - Approach: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.6))`.
  - Bento card: bottom 18% black at hover only.
* Showroom adds a centered **radial** scrim behind the title to make white text legible: `radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 75%)`.
* `text-shadow: 0 2px 24px rgba(0,0,0,0.4–0.5)` is applied to all white headings sitting over photography.

---

## 14. Responsive Behavior Cheat‑sheet

Breakpoints:

* `1100px` — product grid drops from 4 → 3.
* `1024px` — Visualizer rail goes full‑width; calculator stops being sticky; cart goes single column.
* `900px` — most multi‑col layouts collapse to 1 col; bento spans full width; `--tfi-px = clamp(20px, 5vw, 36px)`; `--tfi-section-y = 80px`; auth split becomes stacked.
* `640px` — `--tfi-px = 20px`, `--tfi-section-y = 64px`; body font drops to 14.5px; product grid 2 cols; dock shrinks to 52px tall × 360px wide; bottom 16px from edge; modal nav links scale to `clamp(24px, 7vw, 32px)`; footer logo 80×80.
* `540px` — fine tuning of headlines, chips, calculator hero.

---

## 15. Component Hierarchy

```
RootLayout (app/layout.tsx)
├── <html lang="en-GB" class="<all-font-vars> antialiased">
│   data-scroll-behavior="smooth"
└── <body bg-background text-foreground flex flex-col>
    ├── <script type="application/ld+json"> (Organization JSON-LD)
    └── AuthProvider
        ├── AppShell                                  (decides theme/route)
        │    ├── if admin    → <div>{children}</div>
        │    ├── if auth     → <main>{children}</main>
        │    └── else (public)
        │         ├── <main><PageTransition>{children}</PageTransition></main>
        │         ├── <TfiFooter />                  (unless visualizer)
        │         └── <TfiDock />                    (unless visualizer)
        ├── <CartDrawer />                            (Sheet, mounted globally)
        └── <Toaster />                               (Sonner)
```

Theme switching in `AppShell` (useLayoutEffect):

```ts
document.documentElement.classList.toggle("admin-theme", isAdmin)
document.documentElement.classList.toggle("tfi-theme",  isPublicTfi)
```

---

## 16. Replication Checklist

To clone the look in a new project, in order:

1. **Fonts** — load Inter, Inter Tight, Playfair Display, Geist Sans, Geist Mono as CSS variables.
2. **Tokens** — drop the entire `:root { --tfi-* }` block from §2.1.
3. **Theme classes** — implement `html.tfi-theme` and (if needed) `html.admin-theme` mappings to your CSS variable system. Toggle them via a layout effect based on the active route.
4. **Type roles** — copy the `.t-display / .t-h2 / .t-h3 / .t-eyebrow / .t-meta` classes verbatim.
5. **Pill component** — implement `.tfi-pill` with the four modifiers (ghost / light / outline / default). Every CTA on the site uses one.
6. **Dock + modal** — replicate `.tfi-dock` and `.tfi-modal` exactly with the burger‑morph and genie‑bottle transitions. Hook it up to a footer `IntersectionObserver(threshold: 0.9)` that auto‑opens it.
7. **Reveal primitives** — port `Reveal / FadeUp / StaggerGroup / StaggerItem / FadeIn / HeroItem`. Use `[0.22, 1, 0.36, 1]` everywhere.
8. **Page transition** — wrap children with the `AnimatePresence` exit‑blur transition.
9. **Hero & Showroom** — implement the two pinned scroll sections (220vh container, sticky 100vh inner). The transforms in §7 and §8.3 are the magic numbers — match them.
10. **Photography overlays** — every dark image block needs the `::before` gradient and text shadow. Don't skip these — they are 50% of the look.
11. **Hairline grid** — use 1px `var(--tfi-line)` borders to separate every section. Avoid heavy boxes.
12. **Glyphs** — use `◆` for eyebrow markers and `↳` for pill arrows. They are characters, not icons.
13. **Reduced motion** — respect `prefers-reduced-motion` in CSS and via `useReducedMotion()`. Both layers exist.
14. **Bento** — 12‑col grid with the `bc-sm 5 / bc-lg 7 / bc-half-l 6 / bc-half-r 6 / bc-full 12` map.
15. **Marquee** — double the array, drive with `useAnimationFrame`, mask both edges.
16. **Cart, Calculator, Cart-summary** — these are **ink panels on cream pages**. Inputs are always **underlined** inside ink panels. Totals are 30px Inter Tight 500 tabular‑nums.
17. **Drawer** — Sheet at 460px max width, cream surface, hairlines between rows, Framer Motion `layout` for row deletions.

Get those 17 right and the rest is just content placement.
