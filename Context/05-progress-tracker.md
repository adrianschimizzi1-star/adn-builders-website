# ADN Builders — Progress Tracker

The single running record of what's been built, what's outstanding,
and what still needs the client. Update this file in the same commit
as any feature (both spec 03 and spec 04 require it). Newest work at
the top of each phase.

> Last updated: 2026-07-07

## Legend

- `[x]` done and verified (build passes, behaves as described)
- `[~]` done in code, pending a real-world check (e.g. live deploy)
- `[ ]` not started / needs client input

---

## Status at a glance

| Phase | What | State |
| ----- | ---- | ----- |
| 0 | Scaffold, theme, content wiring, deploy setup | ✅ Done |
| 1 | Charcoal blue-grey retheme (spec `03-colour-revision.md`) | ✅ Done |
| 2 | Multi-page conversion (spec `04-multipage-fix.md`) | ✅ Done |
| — | Client content still needed (`NEEDS_INPUT`) | ⏳ Outstanding |
| — | Live Vercel deploy + hard-refresh check | ⏳ Pending |

Build is green (`npm run build` — `tsc -b` + `vite build`, no type
errors) after every step below. Every text/background pair meets
WCAG AA. Routes verified locally on the preview server.

---

## Phase 0 — Scaffold & initial build ✅

From `01-Inintal-Prompt.md` and `02-Setup-and-Deployment.md`.

- [x] Vite + React 19 + TypeScript + Tailwind v4 project
- [x] Dark premium navy+orange theme extracted from the logo
- [x] Single-page layout: Hero · Services · Projects · About · Quote · Footer
- [x] Reusable components (Button, SectionHeading, ServiceCard,
      GalleryGrid, Lightbox, ProjectImage, FormInputs, Logo)
- [x] Content moved to typed data in `src/data/`
      (business, services, gallery, about)
- [x] Formspree-ready enquiry form with validation + success/error states
- [x] Local SEO: Canberra title/meta, Open Graph, JSON-LD, alt text
- [x] Vercel config (`vercel.json`), deploy path documented

---

## Phase 1 — Charcoal blue-grey retheme ✅

Spec: `03-colour-revision.md`. Goal: shift the canvas from saturated
deep navy to a darker, desaturated charcoal blue-grey while keeping
every section legible and the orange CTAs the most prominent element.

- [x] **Step 1 — Tokens.** Re-derived the whole `navy-*` ramp in the
      Tailwind v4 `@theme` block (`src/index.css`) to charcoal
      blue-grey. Token *names* unchanged (spec rule); only hex values
      changed. Anchors: `950 #0b0e13` (base), `900 #131720` (surface),
      `800 #1a2029` (elevated), `700 #232b37` (border), `300 #9aa3b2`
      (muted), `50 #f2f4f7` (near-white). Also updated the
      `theme-color` meta in `index.html` (`#080c22` → `#0b0e13`).
- [x] **Step 2 — Hardcoded-colour sweep.** Grep for `#`/`rgb(`/`bg-[`/
      `text-[` in `src/components` + `src/sections` → **zero**
      violations. Flagged (not changed, per spec) the deliberate
      **white** quote-form card and its Tailwind-default `red-*`
      validation colours — the `state-error` token is a light red for
      dark surfaces and would fail contrast on white.
- [x] **Step 3 — Contrast + state audit.** Computed WCAG ratios for
      every text/background pair. Two fine-print spots were AA-large
      only and were fixed by changing *which token a class uses*
      (allowed): footer copyright `navy-500 → navy-400` (5.5:1 on
      dark); form helper + input placeholder `navy-400 → navy-500`
      (5.1:1 on white). Hover / focus / disabled / success / error
      states all confirmed distinct on the new palette.
- [x] **Step 4 — Docs.** `ADN-ui-context.md` Theme description +
      colour table updated to the final hex values (table matches
      `src/index.css` exactly); `ADN-code-standards.md` colour
      reference corrected to the v4 `@theme` block.

Adaptations to note: the spec was written against a `tailwind.config`
file and generic semantic token names (`bg-base`, `text-muted`, …).
This project is Tailwind **v4** (CSS `@theme`, no config file) and uses
the `navy-*`/`accent-*` scale — the spec's proposed hex anchors were
mapped onto those existing tokens, names kept.

---

## Phase 2 — Multi-page conversion ✅

Spec: `04-multipage-fix.md`. Goal: Home keeps the full one-page
overview; each major section gains a dedicated detail page.

- [x] **Step 1 — Routing skeleton.** Added `react-router-dom@7`.
      Moved the one-page composition into `pages/Home.tsx`; wired
      `BrowserRouter` + `ScrollToTop` in `main.tsx`; added the SPA
      rewrite to `vercel.json` (`/(.*) → /index.html`). Removed the
      now-superseded `App.tsx`.
- [x] **Step 2 — Layout shell + navbar routing.** New `pages/Layout.tsx`
      (Navbar + `<main><Outlet/></main>` + Footer). Navbar + footer
      links became router links (`NavLink` with active state); phone
      CTA unchanged; quote CTA → `/contact`. Extended `Button` with a
      `to` prop so CTAs navigate via `<Link>` (SPA, no reload).
- [x] **Step 3 — Services page.** New `pages/ServicesPage.tsx`: per-
      service block with `longDescription`, "what's included", and a
      gallery strip filtered by the service's category (reuses
      GalleryGrid + Lightbox). Extended the `Service` type with
      `category`, `longDescription`, `included`. Home Services section
      gained a "View all Services →" link.
- [x] **Step 4 — Gallery page.** New `pages/GalleryPage.tsx`: full grid,
      all categories, filter pills + lightbox. Home Gallery section
      gained a "View all Projects →" link.
- [x] **Step 5 — About + Contact pages.** New `pages/AboutPage.tsx`
      (expanded bio, licence/insurance, "how we work" process) and
      `pages/ContactPage.tsx` (page header + opening hours, then the
      existing QuoteForm reused **as-is**). Extended `about.ts`
      (`longBio`, `process`) and `business.ts` (`hours`). Home About
      gained "More about the team →"; home QuoteForm gained
      "Get in touch →" (via an opt-in `showContactLink` prop so the
      Contact page's reuse stays as-is).
- [x] **Step 6 — NotFound, meta, docs.** New `pages/NotFound.tsx`
      (catch-all `*` route, links home) and `hooks/usePageMeta.ts`
      (distinct `<title>` + meta description, called by every page).
      Updated `ADN-architecture.md` (boundaries + invariants for
      routing) and `ADN-project-overview.md` (scope no longer
      "single page"). This tracker created.
- [~] **Deep-link hard refresh on live Vercel.** Verified locally on
      the preview server (all routes 200, SPA fallback works) and via
      the `vercel.json` rewrite; confirm once on the deployed site.

Adaptations to note: the spec pointed "extended about content" at
`business.ts`, but this repo keeps about narrative in `about.ts` and
business facts in `business.ts` — content was split accordingly
(process/bio → `about.ts`, opening hours → `business.ts`). Context
filenames in the specs (`context/ui-context.md`, etc.) map to this
repo's `Context/ADN-*.md` files.

---

## Outstanding — needs the client (`NEEDS_INPUT`)

Search `src/data/` for `NEEDS_INPUT` to find these in code.

- [ ] **Licence number** — `business.ts` (`ACT Builder Licence #000000`)
- [ ] **Formspree form ID** — `business.ts` (`FORMSPREE_ID`); form
      shows a clear "not connected yet" error until set
- [ ] **Builder names + bio** — `about.ts` (`builders`, `bio`,
      `longBio` are inferred drafts — confirm "Anthony & Nato")
- [ ] **Opening hours** — `business.ts` `hours` are sensible defaults;
      confirm the real ones
- [ ] **Hero photo** — drop `public/projects/hero-bathroom.jpg`
      (falls back to a dark gradient until then)
- [ ] **Gallery photos** — add images to `public/projects/` and set
      `src` on entries in `gallery.ts` (placeholders show meanwhile)

## Verification checklist (both specs' "Check When Done")

- [x] Build passes, no type errors, each step verified before the next
- [x] All text passes WCAG AA on the new charcoal palette
- [x] Home still contains the complete overview; nothing removed
- [x] No new shared components beyond those the spec named
      (ScrollToTop, Layout, pages, usePageMeta, NotFound)
- [x] Every page: one `<h1>`, distinct title/meta, scrolls to top
- [x] Form submits from both Home and `/contact` (same QuoteForm)
- [x] Context docs updated (ui-context, architecture, overview, tracker)
- [~] Deep links survive a hard refresh on the **deployed** site

## Dev aids (not part of either spec)

- [x] **Mobile preview page** — `pages/MobilePreview.tsx` at `/preview`
      (standalone, not linked in nav/footer). Shows every page inside
      phone frames with a width switch (375 / 390 / 430px) for
      reviewing the mobile layout on desktop. Safe to delete later.

## Possible next steps (not scoped yet)

- Analytics (none wired — was explicitly out of scope)
- Real project photography + per-project detail/case studies
- Social links in the footer (fields exist, empty in `business.ts`)
- Sitemap.xml / per-route canonical + OG tags for the new pages
