# ADN Builders — Website

Marketing website for **ADN Builders**, a licensed, fully insured builder serving
Canberra (renovations, extensions, new home builds, bathrooms, decks & outdoor).

Built with **Vite + React + TypeScript** and **Tailwind CSS v4**. Mobile-first,
single-page, fast-loading, with a **dark premium** navy + orange theme drawn from
the logo.

## Getting started

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # type-check + production build -> dist/
npm run preview  # preview the production build
```

## Where to edit things

**All content lives in [`src/data/`](src/data/)** — you shouldn't need to touch
components to change copy, contact details, services, projects, or the About text.

Anything wrapped in `NEEDS_INPUT(...)` is a placeholder to replace:

| Field                         | File                    |
| ----------------------------- | ----------------------- |
| Phone / email / licence       | `src/data/business.ts`  |
| Formspree form ID             | `src/data/business.ts`  |
| Builder names / bio           | `src/data/about.ts`     |
| Services (4 cards)            | `src/data/services.ts`  |
| Project gallery + hero image  | `src/data/gallery.ts`   |

## Photos

- **Logo** — `public/adn-logo.png` (already added; shown on a white plate so the
  navy wordmark reads on dark backgrounds).
- **Team** — `public/team/` (already added; used in About).
- **Hero background** — save the dark bathroom shot to
  `public/projects/hero-bathroom.jpg`. Overlays keep the hero text legible; if the
  file is missing the hero falls back to a dark navy gradient.
- **Gallery** — drop images in `public/projects/` and reference them from
  `src/data/gallery.ts`. Entries without a `src` render a "Photo coming soon" tile.

## Theme / branding

Palette tokens (navy + orange from the logo) live in the Tailwind v4 `@theme`
block of [`src/index.css`](src/index.css) — change them there to re-theme the whole
site. See [`Context/ADN-ui-context.md`](Context/ADN-ui-context.md) for the token map.

## Enquiry form (Formspree)

[`src/sections/QuoteForm.tsx`](src/sections/QuoteForm.tsx) validates fields and posts
to Formspree — no backend. Add your form ID to `FORMSPREE_ID` in
`src/data/business.ts`. Until then the form shows a friendly "not connected yet"
message instead of failing silently.

## Deploying to Vercel

See [`Context/02-Setup-and-Deployment.md`](Context/02-Setup-and-Deployment.md).
Vercel auto-detects Vite (`vite build` → `dist`); [`vercel.json`](vercel.json) makes
it explicit.

## Structure

```
.
├── index.html                # SEO title/meta, fonts, theme-color, JSON-LD
├── src/
│   ├── main.tsx  ·  App.tsx   # entry + section order
│   ├── index.css             # Tailwind v4 + theme tokens (navy/orange)
│   ├── data/                 # ← all content: business, services, gallery, about
│   ├── components/           # Button, Logo, SectionHeading, ServiceCard,
│   │                         #   GalleryGrid, Lightbox, ProjectImage, FormInputs
│   └── sections/             # Navbar, Hero, Services, Gallery, About,
│                             #   QuoteForm, Footer
├── public/
│   ├── adn-logo.png · favicon.svg
│   ├── team/                 # team photos
│   └── projects/             # ← gallery + hero photos go here
└── vercel.json
```
