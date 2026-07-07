# UI Context

## Theme

Dark premium, on-brand to the ADN Builders logo — a deep navy
canvas with warm orange accents. Modern and trustworthy: the
visual language of an established trade business. Large project
photography sits on dark surfaces so the work glows; restrained
use of the orange accent keeps calls to action obvious. Nothing
flashy, nothing that reads as a template.

> Updated 2026-07-07 — changed from the original "light mode
> only" brief to this dark premium theme at the client's request.

## Colors

Palette is extracted from the logo: **navy** (the "ADN"
wordmark) as the dark canvas/neutrals, **orange** (the
"BUILDERS" wordmark) as the accent. Tokens are defined in the
Tailwind v4 `@theme` block in `src/index.css` — components use
them by class (e.g. `bg-navy-950`, `text-accent-500`); no
hardcoded hex values in components.

| Role              | Token / class     | Value      |
| ----------------- | ----------------- | ---------- |
| Page background   | `bg-navy-950`     | `#080c22`  |
| Alternate section | `bg-navy-900`     | `#101736`  |
| Card / elevated   | `bg-navy-800`     | `#182146`  |
| Primary text      | `text-white`      | `#ffffff`  |
| Body text         | `text-navy-200`   | `#c2cbe7`  |
| Muted text        | `text-navy-300/400`| `#97a5d3` / `#6577b0` |
| Primary accent    | `accent-500`      | `#e8791f`  |
| Accent hover      | `accent-400/600`  | `#ee8636` / `#cf6413` |
| Border            | `border-white/10` | 10% white  |
| Error             | `state-error`     | `#f87171`  |
| Success           | `state-success`   | `#34d399`  |

Usage rules:

- `accent-500` (orange) is reserved for calls to action (quote
  button, call button, form submit) and small highlights —
  if everything is accented, nothing is
- Alternate `bg-navy-950` and `bg-navy-900` between sections to
  create rhythm without borders
- On dark backgrounds the full-colour logo sits on a small white
  plate (`components/Logo.tsx`) so the navy wordmark stays legible

## Typography

| Role      | Font                          | Token         |
| --------- | ----------------------------- | ------------- |
| Headings  | Plus Jakarta Sans, extra-bold | `font-heading` |
| Body text | Plus Jakarta Sans, regular    | `font-sans`   |

- One typeface family site-wide, weight creates hierarchy
- Hero headline: large and confident (`text-4xl` mobile,
  `text-6xl` desktop)
- Body: `text-base` minimum — many visitors are 40+ and
  on phones

## Border Radius

| Context           | Class        |
| ----------------- | ------------ |
| Buttons, inputs   | `rounded-lg` |
| Cards, photos     | `rounded-xl` |
| Lightbox overlay  | `rounded-2xl`|

## Component Library

None — plain React + Tailwind. The site is small enough that
hand-built components stay consistent, and it avoids a
dependency. Build: Button, SectionHeading, ServiceCard,
GalleryGrid, Lightbox, TextInput/SelectInput for the form.

## Layout Patterns

- Single scrolling page; sticky top navbar with logo left,
  anchor links center, phone number right (collapses to
  logo + call button on mobile)
- Content constrained to `max-w-6xl mx-auto px-4`
- Sections: `py-16` mobile, `py-24` desktop
- Hero: full-width background photo (best project shot)
  with a subtle dark overlay for text legibility
- Gallery: 1 column mobile, 2 columns tablet, 3 columns
  desktop; filter pills above the grid
- Quote form: single column, max-w-md, centered

## Icons

Lucide React. Stroke-based only. `h-4 w-4` inline,
`h-5 w-5` in buttons. Icons support meaning (phone, mail,
map-pin, hammer/wrench for services) — never decoration
for its own sake.
