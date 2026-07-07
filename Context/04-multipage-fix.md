# Multi-Page Conversion (Home Overview + Detail Pages) — Implementation Spec

Read this whole file before writing any code. This spec is the
single source of truth for this task. If something here conflicts
with what you think is "better," follow the spec — the constraints
exist for reasons that aren't always visible from inside the
codebase. If a genuine blocker or ambiguity exists, stop and flag
it rather than guessing.

## 0. Context for the Implementing Agent

What the product is: A marketing website for [Business Name], a
residential builder. It converts visitors into quote enquiries
and phone calls.

Stack (ground truth — do not assume anything beyond this):

* Frontend: Vite + React + TypeScript, Tailwind CSS
* Backend / DB: none — fully static site
* Forms: Formspree (already wired)
* Hosting: Vercel, auto-deploy from GitHub
* What is NOT wired up yet: analytics, payments, CMS, any
  server rendering. Do not invent or add any of these.

Design system / conventions (see context files below):

* Colour tokens and typography per `context/ui-context.md`
  (charcoal blue-grey theme) — no hardcoded values
* All business content lives in `src/data/` — pages render
  from data, they do not embed copy
* Accessibility: pages must be navigable by keyboard; every
  page has exactly one `<h1>`

How to work (non-negotiable): Implement one step at a time.
After each step, verify it (build passes, no type errors, no
lint errors, behaves as described) before starting the next.
Do not batch the whole feature and check at the end.

## 1. Goal

The site becomes multi-page: the home page keeps the complete
one-page overview exactly as it is today, and each major section
gains a dedicated detail page with expanded content — so a
visitor who wants everything at a glance stays on Home, and a
visitor who clicks through to (e.g.) Services gets a full page
of service detail with its related images.

## 2. Out of Scope

* Do NOT change the visual theme, tokens, or typography
  (handled in spec-01)
* Do NOT remove or slim down any section on the home page —
  Home remains the full overview
* Do NOT build a CMS, markdown loader, or admin interface —
  detail-page content is typed data in `src/data/`, same as
  everything else
* Do NOT create new shared components unless this spec names
  them (reuse existing)
* Do NOT touch the Formspree integration internals — the
  contact page reuses the existing QuoteForm section as-is
* Do NOT add dependencies beyond `react-router-dom` (flagged
  and approved by this spec)

## 3. Design Decisions

Context files that govern this feature:

* `context/architecture.md` — system boundaries: sections
  compose components; data lives in `src/data/`. Update the
  boundaries and invariants for routing in the same commit.
* `context/ui-context.md` — layout patterns (navbar, section
  rhythm, max-width) apply unchanged to new pages
* `context/project-overview.md` — "single page" is now
  superseded; update Scope in the same commit

Decisions locked for this feature:

* Routing: `react-router-dom` with `BrowserRouter`. Routes:
  * `/` — Home (existing full one-page overview)
  * `/services` — all services expanded: per-service
    description, what's included, related gallery images
    filtered by that service's category
  * `/gallery` — full gallery, larger grid, all categories,
    existing filter + lightbox
  * `/about` — expanded bio, licence + insurance details,
    how he works / process
  * `/contact` — quote form, phone, email, service area, hours
* Home ↔ detail linking: each home section gets a clearly
  visible "View all [Services / Projects / etc.] →" link to
  its detail page. Navbar anchor links become route links;
  on Home they may still smooth-scroll to sections.
* Data: extend existing types in `src/data/services.ts` with
  optional `longDescription` and `included: string[]` fields;
  detail pages render these. Gallery manifest is reused —
  service pages filter it by category. No new data stores.
* State: none new. Lightbox/filter state stays local, as now.
* Scroll behaviour: navigating to a new route scrolls to top
  (add a small ScrollToTop handler — named component, allowed).
* Vercel/SPA edge case: deep links like `/services` must not
  404 on refresh — add the SPA rewrite in `vercel.json`.
* Not-found: unknown routes render a minimal NotFound page
  linking back to Home.
* SEO: each page sets its own `<title>` and meta description
  via a tiny `usePageMeta` hook (named here, allowed); URLs
  above are the canonical ones.
* Copy: "View all Services →", "View all Projects →",
  "More about [First Name] →", "Get in touch →" [adjust to
  real names in src/data/business.ts]

## 4. Implementation

Step 1 — Routing skeleton

* Files: `package.json` (add react-router-dom),
  `src/main.tsx`, new `src/pages/Home.tsx`,
  new `src/components/ScrollToTop.tsx`,
  new `vercel.json`
* Move the current one-page composition into `pages/Home.tsx`
  unchanged. Wire BrowserRouter with only `/` for now, plus
  ScrollToTop and the vercel.json SPA rewrite.
* Verify: site looks and behaves exactly as before at `/`;
  build passes; deployed refresh on `/` works.

Step 2 — Layout shell + navbar routing

* Files: `src/components/Navbar.tsx`, new `src/pages/Layout.tsx`
  (navbar + footer wrapper via Outlet)
* Navbar links become route links (Services, Projects, About,
  Contact) with the phone CTA unchanged. Footer moves into
  the shared layout.
* Verify: navbar navigates between `/` and a placeholder
  route; mobile navbar still collapses correctly.

Step 3 — Services detail page

* Files: new `src/pages/ServicesPage.tsx`,
  `src/data/services.ts` (extend types + content),
  `src/sections/Services.tsx` (add "View all Services →" link)
* Context: renders per-service blocks: heading,
  longDescription, included list, and a gallery strip
  filtered to that service's category (reuse GalleryGrid).
* Verify: `/services` shows every service with its images;
  home Services section unchanged apart from the new link.

Step 4 — Gallery detail page

* Files: new `src/pages/GalleryPage.tsx`,
  `src/sections/Gallery.tsx` (add "View all Projects →" link;
  optionally cap home grid to the best N photos via data flag)
* Verify: `/gallery` shows all photos with filters + lightbox.

Step 5 — About and Contact pages

* Files: new `src/pages/AboutPage.tsx`,
  new `src/pages/ContactPage.tsx`,
  `src/data/business.ts` (extended about content),
  home About + QuoteForm sections gain their detail links
* Contact page reuses the existing QuoteForm section plus
  business contact details from data.
* Verify: form submits successfully from `/contact`.

Step 6 — NotFound, page meta, and doc sync

* Files: new `src/pages/NotFound.tsx`, new
  `src/hooks/usePageMeta.ts` applied on every page;
  `context/architecture.md`, `context/project-overview.md`,
  `context/progress-tracker.md` updated
* Verify: unknown route shows NotFound; each page has a
  distinct title; docs reflect the new structure.

## 5. Check When Done

* [ ] Goal (Section 1) is fully met and demonstrable
* [ ] Home still contains the complete overview, nothing removed
* [ ] Nothing in "Out of Scope" (Section 2) was built or touched
* [ ] No new components beyond those named in Section 4
      (ScrollToTop, Layout, pages, usePageMeta, NotFound)
* [ ] No type errors
* [ ] No lint errors
* [ ] Build passes
* [ ] Deep links (`/services` etc.) survive a hard refresh on
      the deployed Vercel site
* [ ] Every page: one h1, distinct title/meta, scrolls to top
      on navigation
* [ ] Form still submits from both Home and /contact
* [ ] Context docs updated (architecture, overview, tracker)
* [ ] Each step was verified before the next was started