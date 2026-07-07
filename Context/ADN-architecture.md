# Architecture Context

## Stack

| Layer     | Technology              | Role                                      |
| --------- | ----------------------- | ----------------------------------------- |
| Framework | Vite + React + TypeScript | Static multi-page SPA, fast dev server   |
| Routing   | react-router-dom (v7)   | Client-side routes; Vercel SPA rewrite    |
| UI        | Tailwind CSS            | All styling via utility classes + tokens  |
| Forms     | Formspree               | Quote enquiries emailed, no backend       |
| Images    | Optimized static assets | Compressed/resized at build time          |
| Hosting   | Vercel                  | Static deploy, auto-deploy from GitHub    |

## System Boundaries

- `src/main.tsx` — App entry: mounts `BrowserRouter`, the
  `ScrollToTop` handler, and the route table (all routes nest
  under the shared `Layout`; `*` renders `NotFound`)
- `src/pages/` — One component per route. `Layout` (Navbar +
  `<Outlet/>` + Footer), `Home` (full one-page overview),
  `ServicesPage`, `GalleryPage`, `AboutPage`, `ContactPage`,
  `NotFound`. Pages compose sections + components; they hold
  page-local state (e.g. gallery filter/lightbox)
- `src/sections/` — Page sections composed from components
  (Hero, Services, Gallery, About, QuoteForm, Footer). Reused
  across pages (e.g. ContactPage reuses QuoteForm as-is)
- `src/components/` — Reusable presentational components
  (Button — now also renders a router `<Link>` via a `to` prop —
  SectionHeading, ServiceCard, GalleryGrid, Lightbox, ScrollToTop)
- `src/hooks/` — `usePageMeta` (per-page `<title>` + meta
  description; called by every page)
- `src/data/` — All site content as typed constants
  (services + longDescription/included, gallery photo manifest,
  business details incl. opening hours, about bio/process)
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
   service area, opening hours) live in `src/data/business.ts`
   only — never hardcoded inside components
3. Every gallery image must have descriptive alt text and
   a defined width/height to prevent layout shift
4. Phone numbers render as `tel:` links; email addresses
   render as `mailto:` links — never plain text
5. The quote form must never fail silently: every submission
   attempt ends in a visible success or error state
6. Routing is client-side: every route also resolves from a
   cold URL because `vercel.json` rewrites all paths to
   `/index.html` (deep links must survive a hard refresh)
7. Every page has exactly one `<h1>`, sets its own title +
   meta description via `usePageMeta`, and scrolls to top on
   navigation (`ScrollToTop`)
8. Home remains the complete overview — detail pages add depth,
   they never become the only home for a section's content
