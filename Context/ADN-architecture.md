# Architecture Context

## Stack

| Layer     | Technology              | Role                                      |
| --------- | ----------------------- | ----------------------------------------- |
| Framework | Vite + React + TypeScript | Static single-page site, fast dev server |
| UI        | Tailwind CSS            | All styling via utility classes + tokens  |
| Forms     | Formspree               | Quote enquiries emailed, no backend       |
| Images    | Optimized static assets | Compressed/resized at build time          |
| Hosting   | Vercel                  | Static deploy, auto-deploy from GitHub    |

## System Boundaries

- `src/components/` — Reusable presentational components
  (Button, SectionHeading, ServiceCard, GalleryGrid, Lightbox)
- `src/sections/` — Page sections composed from components
  (Hero, Services, Gallery, About, QuoteForm, Footer)
- `src/data/` — All site content as typed constants
  (services list, gallery photo manifest, business details)
- `src/assets/` — Logo, optimized project photos
- `public/` — Favicon, Open Graph image, static files
  served as-is

## Storage Model

- **No database.** All content is typed constants in
  `src/data/` — editing content means editing those files.
- **Static assets**: Gallery photos live in `src/assets/`
  and are imported so Vite fingerprints and optimizes them.
- **Form submissions**: Held by Formspree and forwarded to
  [email]. Nothing is stored in this codebase.

## Auth and Access Model

- No authentication. The site is fully public.
- The only inbound data is the quote form, which posts
  directly to Formspree's endpoint.
- No cookies, no tracking of personal data (keeps privacy
  obligations minimal).

## Invariants

1. No backend code: the site must always build to purely
   static output deployable on any static host
2. All business facts (name, phone, email, licence number,
   service area) live in `src/data/business.ts` only —
   never hardcoded inside components
3. Every gallery image must have descriptive alt text and
   a defined width/height to prevent layout shift
4. Phone numbers render as `tel:` links; email addresses
   render as `mailto:` links — never plain text
5. The quote form must never fail silently: every submission
   attempt ends in a visible success or error state
