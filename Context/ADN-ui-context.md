# UI Context

## Theme

Dark premium, on-brand to the ADN Builders logo — a **charcoal
blue-grey** canvas (gunmetal, close to black with a subtle cool
blue cast) with warm orange accents. Modern and trustworthy: the
visual language of an established trade business. Large project
photography sits on the darker surfaces so the work glows;
restrained use of the orange accent keeps calls to action
obvious — and pops harder now that the canvas is darker. Nothing
flashy, nothing that reads as a template.

> Updated 2026-07-07 — retheme (spec 03): shifted the canvas from
> a saturated deep navy to a darker, desaturated charcoal
> blue-grey. Token names are unchanged (`navy-*`); only their hex
> values changed. Every text/background pair re-verified WCAG AA.
> Earlier that day: changed from the original "light mode only"
> brief to this dark premium theme at the client's request.

## Colors

**Charcoal blue-grey** ramp (`navy-*`, a desaturated cool grey —
the token name is kept from the original navy for continuity)
as the dark canvas/neutrals; **orange** (the logo's "BUILDERS"
wordmark) as the accent. Tokens are defined in the Tailwind v4
`@theme` block in `src/index.css` — components use them by class
(e.g. `bg-navy-950`, `text-accent-500`); no hardcoded hex values
in components. The `navy-*` values below match `src/index.css`
exactly.

| Role              | Token / class     | Value      |
| ----------------- | ----------------- | ---------- |
| Page background   | `bg-navy-950`     | `#0b0e13`  |
| Alternate section | `bg-navy-900`     | `#131720`  |
| Card / elevated   | `bg-navy-800`     | `#1a2029`  |
| Primary text      | `text-white`      | `#ffffff`  |
| Body text         | `text-navy-200`   | `#c6cdd9`  |
| Muted text        | `text-navy-300/400`| `#9aa3b2` / `#808a9a` |
| Fine print        | `text-navy-400/500`| `#808a9a` (dark bg) / `#656f7f` (light card) |
| Primary accent    | `accent-500`      | `#e8791f`  |
| Accent hover      | `accent-400/600`  | `#ee8636` / `#cf6413` |
| Border            | `border-white/10` (or `navy-700`) | 10% white / `#232b37` |
| Error             | `state-error`     | `#f87171`  |
| Success           | `state-success`   | `#34d399`  |

Full `navy-*` ramp (light → dark): `50 #f2f4f7` · `100 #e3e7ed`
· `200 #c6cdd9` · `300 #9aa3b2` · `400 #808a9a` · `500 #656f7f`
· `600 #48515f` · `700 #232b37` · `800 #1a2029` · `900 #131720`
· `950 #0b0e13`.

Usage rules:

- `accent-500` (orange) is reserved for calls to action (quote
  button, call button, form submit) and small highlights —
  if everything is accented, nothing is
- Alternate `bg-navy-950` and `bg-navy-900` between sections to
  create rhythm without borders
- The quote form is a deliberate **white** card on the dark page;
  its text (`navy-800/900`) and validation reds (`red-500/600/700`)
  are Tailwind defaults chosen for contrast on white — the
  `state-error` token is a light red for dark surfaces and must
  NOT be used as text on the white card
- Contrast floor: every text/background pair meets WCAG AA
  (≥4.5:1 normal text). Muted text bottoms out at `navy-300`
  (≈7.6:1); `navy-400/500` are for fine print only, and the token
  is picked per background so both directions stay ≥4.5:1
- The logo PNG has a transparent background; its banner +
  white "ADN" + orange "BUILDERS" read directly on the dark theme,
  so it sits with no plate (`components/Logo.tsx`)

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
