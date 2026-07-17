# ADN Builders — Progress Tracker

The single running record of what's been built, what's outstanding,
and what still needs the client. Update this file in the same commit
as any feature (both spec 03 and spec 04 require it). Newest work at
the top of each phase.

> Last updated: 2026-07-18

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
| 3 | Website fixes: blends, reviews, team, deep-links (spec `06-website-fixes-V!.md`) | ✅ Done |
| 4 | Admin area — password-gated photo uploads (spec `07-admin-setup.md`) | ✅ Done |
| 5 | Structure, gallery & admin pass (spec `05-website-fixes-v2.md`) | ✅ Done |
| 6 | Website fixes 2: hero, copy, 6-tile gallery, featured review, project uploads (spec `08-website-fixes-2.md`) | ✅ Done |
| — | Client content still needed (`NEEDS_INPUT`) | ⏳ Outstanding |
| — | Live Vercel deploy + hard-refresh check | ⏳ Pending |
| — | Admin "upload photos into this project" checked on the live/preview deploy | ⏳ Pending (owner) |

Build is green (`npm run build` — `tsc -b` + `vite build`, no type
errors) after every step below; the `/api` functions type-check with
`npx tsc -p tsconfig.api.json`. Every text/background pair meets WCAG AA.
Routes + the full admin→public flow verified locally in headless Chrome.

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

## Phase 3 — Website fixes ✅

Spec: `06-website-fixes-V!.md`. Goal: the site reads as one continuous,
polished page — soft section boundaries, a more prominent hero, human
content (team cards + curated reviews) replacing tick clutter, and
Services images that deep-link into the matching Projects category.
Implemented one step at a time; `npm run build` green after each, then
the whole site re-checked in a headless browser.

- [x] **Step 1 — Section fade transitions.** Added six reusable
      gradient-blend classes to `src/index.css` (`fade-t-from-950/900`,
      `fade-b-to-950/900`, `fade-y-in-950/900`) — an ~80px (`--fade-zone`)
      background gradient that eases one dark shade into the next. Applied
      to every shade-change boundary on Home, Services, About, and Contact
      (Gallery page is single-shade). Pure background treatment, so it
      never overlaps content.
- [x] **Step 2 — Copy replacement.** `business.serviceArea` →
      **"Canberra & the Capital Region"** (exact string; renders in Hero,
      QuoteForm, Footer). Grepped for variants — the only other instance
      was the About `longBio` prose ("Canberra and the surrounding ACT"),
      updated to the canonical **"Canberra & the Capital Region"** too.
      Zero "surrounding"/old-tagline instances remain.
- [x] **Step 3 — Hero overlay.** Lightened both legibility overlays in
      `Hero.tsx` ~20% (e.g. horizontal `950 → 950/90 · 850/65 → …/25`),
      keeping the text-side (left/bottom) dark enough for AA while the
      photo now reads clearly through the centre/right. Verified against
      the real `hero-bathroom.jpg`.
- [x] **Step 4 — Team section (about page).** Deleted the licence /
      "Fully insured" badges and the tick highlights on `AboutPage.tsx`;
      replaced with a responsive 4-card grid (4:5 photo, name,
      description; `rounded-2xl` card + clipped image). New `team[]` data
      in `about.ts` — placeholder names/descriptions + placeholder image
      block, all `TODO: replace`. Licence still shown site-wide via the
      footer.
- [x] **Step 5 — Home "Team behind ADN".** Removed only the tick list
      from the home `About.tsx` section; bio, licence/insurance credential
      cards, and CTAs kept.
- [x] **Step 6 — Services.** Trimmed each service's "What's included"
      list from 5 → the 4 strongest (`services.ts`). Added deep-link
      support to `GalleryPage.tsx` (`?cat=<category>` → pre-selected
      filter, applied on direct load / hard refresh, not just on click).
      Home `ServiceCard` gained a clickable representative image (category
      project photo, placeholder fallback) linking to `/gallery?cat=…`
      with a "View projects" hover cue; `/services` blocks gained a
      "View all →" deep-link on each project strip.
- [x] **Step 7 — Reviews component.** New `components/Reviews.tsx` (the
      only new component the spec authorises) + `data/reviews.ts`. Full
      variant (4 cards) on Home, compact (3 cards) on Contact; first-name,
      5-star display, quote, `rounded-2xl` cards matching the team cards,
      and a "Read more on Google" button (`target="_blank"
      rel="noopener noreferrer"`, href falls back to `#` until the owner
      supplies the URL). All content `TODO: replace`.
- [x] **Step 8 — Contact cleanup.** Deleted the Opening Hours card from
      `ContactPage.tsx` (its only header card — phone/email/area live in
      the reused QuoteForm, so no layout hole); removed the now-unused
      `Clock` import.
- [x] **Step 9 — Scroll animations.** One IntersectionObserver utility
      (`hooks/useScrollReveal.ts`, wired in `Layout.tsx`, re-scans per
      route) toggles `.is-visible` once per element. CSS `.reveal` /
      `.reveal-stagger` (fade-up + small grid stagger) live inside a
      `prefers-reduced-motion: no-preference` guard, so reduced-motion
      users get instant, un-transformed content. Applied to section
      headings, cards, and service blocks.
- [x] **Follow-up — navbar logo.** Bumped the top-left logo `h-9 → h-11`
      (footer logo unchanged).

Adaptations to note: (1) this is a dark site — the "light/dark rhythm"
the spec refers to is the `navy-950`/`navy-900` alternation; boundaries
are softened between those shades. (2) The spec's "clickable service
image" had no literal home equivalent (home service cards were
icon-only), so each home `ServiceCard` gained a representative
category image as that clickable element, plus a deep-link on the
`/services` strips. (3) "Team section" (4-card grid) maps to the About
**page**; "Home — Team behind ADN" maps to the home `About` section
(ticks removed, rest kept). Verified end-to-end via headless Chrome:
hero photo prominence, team grid, compact/full reviews, contact with no
hours card, and `?cat=` deep-link filtering on direct URL load.

---

## Phase 4 — Admin area (photo uploads) ✅

Spec: `07-admin-setup.md`. Goal: a password-gated `/admin` where the owner
uploads and manages portfolio photos without a redeploy; photos live in
Vercel Blob and appear on the live gallery automatically.

- [x] **Serverless auth.** `api/login.ts` + `api/_lib/auth.ts` — password
      checked **server-side** (constant-time), never sent to the browser;
      issues an HMAC-signed httpOnly session cookie (8 h). `api/session.ts`
      + `api/logout.ts` for the is-logged-in check and sign-out.
- [x] **Photos API + storage.** `api/photos.ts` + `api/_lib/store.ts`:
      `GET` (public list), `POST`, `PATCH` (edit), `DELETE`. Each photo is
      **one image blob + one metadata sidecar** (`projects/<id>.json`) — no
      shared manifest, because Vercel Blob is eventually consistent and a
      shared read-modify-write file silently drops entries (learned the hard
      way; commit `02148ff`).
- [x] **Admin UI + live gallery.** `pages/AdminPage.tsx` (lazy-loaded,
      `noindex`): drag-drop upload with in-browser downscale/re-encode,
      category filter, edit modal, delete. `hooks/usePhotos.ts` swaps the
      live list in over the static seed.
- [x] **Docs.** `07-admin-setup.md` (Vercel one-time setup: public Blob
      store + `ADMIN_PASSWORD`/`SESSION_SECRET`).

---

## Phase 5 — Structure, gallery & admin pass ✅

Spec: `05-website-fixes-v2.md` (the "v3" pass). Goal: one clear conversion
path (Book a Quote), a Projects section that pushes toward it, a gallery
that respects each photo's native shape and groups photos into projects,
one shared image source across Home/Services/Projects, the `tsconfig`
deprecation gone, and an admin that manages **all** editable content — not
just photos. Implemented one step at a time; `npm run build` +
`tsc -p tsconfig.api.json` green after each, then driven end-to-end in
headless Chrome.

- [x] **Step 1 — tsconfig.** Removed the deprecated `baseUrl`; `paths` kept
      tsconfig-relative (`"@/*": ["./src/*"]`). Found the matching bundler
      alias was **missing** (the `@/` alias resolved in the editor but would
      break a real build), so added it to `vite.config.ts`. Proved both agree
      by temporarily rewriting an import to `@/…` and building.
- [x] **Step 2 — Projects CTA.** "Want results like these?" + **Book a
      Quote** block at the foot of both Projects surfaces (home `Gallery`
      section + `/gallery`). Inlined, not a new shared component (spec §2).
- [x] **Step 3 — Contact → Book a Quote.** Merged Contact into one page
      titled **Book a Quote** at `/quote` (form primary, contact details a
      secondary card, v2 compact reviews kept). Removed the Contact nav item;
      repointed **every** quote CTA site-wide to `/quote` (nav, hero, about,
      services, footer, service cards). `/contact` now client-side **redirects**
      to `/quote` so old links never 404. `ContactPage.tsx` → `QuotePage.tsx`.
- [x] **Step 4 — Lightbox native aspect ratio.** Rewrote the existing
      `Lightbox` (the only component the spec authorises touching): the image
      sizes itself to its **native ratio** with `rounded-2xl` on the img
      itself (portraits no longer letterboxed), `svh` caps so a tall portrait
      fits, backdrop/Esc close, prev/next. Added a proper modal **focus trap +
      focus restore** (review follow-up). Verified against real portrait /
      landscape / square images, desktop + mobile.
- [x] **Step 5 — "Other" category.** Added to `galleryFilters`, the
      `ProjectImage` gradient map, and the server-side `PHOTO_CATEGORIES`
      whitelist. Filterable, deep-linkable (`?cat=other`), empty-state clean.
- [x] **Step 6 — One image source.** Home's `Gallery` and `ServiceCard`
      were reading the **static seed directly**, so admin photos never
      reached the home page — the core bug. Everything now flows through
      `usePhotos()`/`useGalleryTiles()` (shared module cache, one fetch per
      endpoint per load). Verified Home/Services/Projects all render the same
      admin photos and every Services deep-link resolves to the right
      category, with zero broken image refs.
- [x] **Step 7 — Admin expansion (4 managers).** `AdminPage` became a tabbed
      shell over `pages/admin/{Photos,Projects,Reviews,Team}Panel.tsx`:
      - **Reviews** — add/edit/delete/reorder (name, stars, quote).
      - **Projects** — new entity: create/edit/delete, attach photos, reorder
        photos within a project. Gallery now renders **one tile per project**
        (cover + count badge) or per loose photo; the lightbox steps through a
        project's photos. `content/projects.json` owns `photoIds` (membership
        + order); deleting a photo leaves a dangling id that's skipped on read
        (no unsafe cascade).
      - **Image controls** — assign/change category (incl. Other), delete,
        drag **and** keyboard reorder within a category.
      - **Team** — edit the four cards (portrait upload, name, description),
        reorder.
      New backend: `api/content.ts` (reviews/team/projects, whole-document
      overwrites — safe on Blob because the client always sends the full
      list), `api/upload.ts` (team portraits, whitelisted prefix), photo
      bulk-reorder in `api/photos.ts`. Public reads via `hooks/useSiteContent.ts`
      with the static `src/data` files as fallback.

Adversarial multi-agent review (5 dimensions × 3 verify lenses). All
confirmed findings fixed: the ProjectsPanel reorder indexing a filtered list
into the unfiltered id array (HIGH); new uploads sorting to the gallery
**end** after any saved order (HIGH); the Lightbox missing a focus trap
(HIGH a11y); a fetch-lands-while-lightbox-open race in Gallery/GalleryPage;
`image/svg+xml` accepted by the loose `image/*` check (would be served inline
from the CDN); a protocol-relative team-photo URL bypassing the origin
allowlist; plus reorder boundary-focus loss, an upload/reorder race, and a
missing success-banner live region.

Adaptations to note: (1) the spec's `[TBD]` paths were filled by recon —
Vite + React 19 + Tailwind v4, Vercel Blob, existing `Lightbox`. (2) "Project
manager" needed a public reading; chose grouped tiles (cover + count →
lightbox steps the set), loose photos still tile individually. (3) `/quote`
chosen as the single destination with a `/contact` redirect rather than
reusing `/contact`, so URL and page title agree.

## Phase 6 — Website fixes 2 ✅

Spec: `08-website-fixes-2.md`. Goal: a hero about the *builders* rather than
the work, tighter and simpler copy site-wide, a six-tile home gallery that
fades into "View all Projects", credentials moved out of the team block, a
single featured review on /quote, a team section that stays hidden until real
members exist, and an admin control that uploads several photos straight into
one project. Taste calls (hero title, review treatment, licence placement)
were put to the owner first — all three recommended options chosen.

- [x] **Hero.** Removed the service-area pill and the "ADN BUILDERS" eyebrow;
      new headline **"Builders you can trust, start to finish"**
      (`business.tagline` — reads correctly in the footer sentence too).
      "Licensed and fully insured," dropped from the intro; the trust strip
      now carries the real credential: `ACT Builder Licence #20181053 ·
      Fully insured`. Trust-strip gap tightened on mobile (`mt-8 sm:mt-12`).
- [x] **Services → "Our work" spacing (mobile).** The stacked paddings made a
      ~128px dead zone on phones. Now `pb-10`/`pt-10` + `mt-8` on mobile
      (~72px); desktop unchanged (`sm:py-24`).
- [x] **Home gallery capped at 6.** `Gallery` renders at most six tiles
      (`visible.slice(0, 6)`); when more exist, the last row fades into the
      section background (gradient overlay) and the now-centred "View all
      Projects" link sits at the seam. No fade when six or fewer — nothing
      false to tease. Verified with 8 seed photos: 6 rendered, fade present.
- [x] **Home team block.** Licence/insurance credential cards deleted (hero
      trust strip + footer carry them); `about.bio` trimmed to two sentences.
      `/about` `longBio` trimmed 3 → 2 shorter paragraphs.
- [x] **Quote title.** The shared QuoteForm heading is now **"Request a quote
      from us"** (home + /quote; the /quote h1 "Book a Quote" is unchanged).
- [x] **Services copy.** All four `description`s + `longDescription`s
      rewritten shorter and plain-spoken — no corporate fluff, confidence
      kept. "What's included" lists untouched.
- [x] **Team grid.** No placeholder fallback any more (placeholder `team[]`
      deleted from `about.ts`): the whole "Meet the team" block is hidden
      until members are entered in `/admin`. Grid → centred `flex-wrap`, so a
      partial row (e.g. three people) centres instead of leaving a hole.
      Photo-less members show a neutral icon (no "TODO" text).
- [x] **/quote reviews.** New `featured` variant on `Reviews`: one strong
      quote as a quiet centred banner (stars, quote, name) instead of the
      3-card grid the owner felt was forced. Google link only renders once
      `googleReviewsUrl` is set. Card variants unchanged on Home.
- [x] **Admin — upload photos into a project.** `ProjectsPanel` gains an
      "Upload photos into this project" button per project (shared hidden
      multi-file input): each file is downscaled, uploaded (inheriting the
      project's category), attached to the project's `photoIds`, and the
      projects document is **auto-saved** — one action, live at the end.
      Guards: project must have a title first; attach resolves against the
      latest draft (not a stale closure) so edits made during a slow upload
      survive; project deleted mid-upload → photos remain as loose gallery
      photos with a clear message; save failure keeps the attachment as a
      dirty draft ("press Save projects to finish"). New photos are also
      handed up to the shell (`onPhotosUploaded`) so the Photos tab and
      attach dropdowns see them immediately. `prettifyName` moved to
      `lib/adminApi.ts` (shared with PhotosPanel).
- [x] **Follow-up (owner request).** Removed the "Want results like these? /
      Book a Quote" CTA block from the **home** Projects section, then from
      `/gallery` too. This deliberately supersedes spec 05's "Projects section
      ends with the Book a Quote CTA" check — the navbar / hero / about /
      services CTAs carry the single `/quote` conversion path now.
- [~] **Owner check on the deployed preview:** log into `/admin` → Projects →
      "Upload photos into this project" with 2–3 photos → confirm they group
      under one tile on the public gallery and the lightbox steps through
      them. (Not drivable locally: the serverless API + `ADMIN_PASSWORD`
      only exist on Vercel.)

Verified locally in headless Chrome (dev server, screenshots + rendered-DOM
assertions on `/`, `/services`, `/about`, `/quote`, `/admin`, `/preview`);
`npm run build` + `npx tsc -p tsconfig.api.json` green.

Adaptations to note: (1) "include licence/insured in the actual home page
area" → the hero trust strip was upgraded to show the licence *number*
(owner-approved option) rather than adding a new home-page block. (2) The
public multi-photo behaviour (project tile + lightbox stepping) already
existed from spec 05 — spec 08's gap was the missing one-step admin control,
which is what was built.

## Outstanding — needs the client (`NEEDS_INPUT`)

> **Now editable in `/admin`** (no code change needed): reviews, team members
> + photos, projects, and all gallery photos + categories. The `src/data/*`
> placeholders below only show until the owner enters real content in the
> admin (or the backend is unreachable).

Search `src/data/` for `NEEDS_INPUT` to find these in code.

- [x] **Licence number** — `business.ts` → `ACT Builder Licence #20181053`
- [x] **Formspree form ID** — `business.ts` `FORMSPREE_ID = "mvzjybdn"`
      (connected; live-submit check still worth doing once deployed)
- [ ] **Builder names + bio** — `about.ts` (`builders`, `bio`,
      `longBio` are inferred drafts — confirm "Anthony & Nato")
- [ ] **Opening hours** — `business.ts` `hours` are sensible defaults;
      confirm the real ones
- [ ] **Hero photo** — drop `public/projects/hero-bathroom.jpg`
      (falls back to a dark gradient until then)
- [ ] **Gallery photos** — upload real project photos in `/admin`
      (static seed placeholders show meanwhile)
- [ ] **Team members** — enter in `/admin` → Team (names, descriptions,
      portraits). The /about "Meet the team" block stays **hidden** until
      at least one member exists (spec 08) — no placeholders any more.
- [ ] **Reviews** — enter in `/admin` → Reviews (`reviews.ts` placeholders
      show meanwhile, including the featured one on /quote)
- [ ] **Google reviews URL** — `reviews.ts` `googleReviewsUrl`: ADN's
      Google Business reviews page (the "Read more on Google" button falls
      back to `#` until set)

## Verification checklist (both specs' "Check When Done")

- [x] Build passes, no type errors, each step verified before the next
- [x] All text passes WCAG AA on the new charcoal palette
- [x] Home still contains the complete overview; nothing removed
- [x] No new shared components beyond those the spec named
      (ScrollToTop, Layout, pages, usePageMeta, NotFound)
- [x] Every page: one `<h1>`, distinct title/meta, scrolls to top
- [x] Form submits from both Home and `/quote` (same QuoteForm; `/contact`
      redirects to `/quote`)
- [x] Context docs updated (ui-context, architecture, overview, tracker,
      admin-setup)
- [~] Deep links survive a hard refresh on the **deployed** site

Spec 06 "Check When Done":

- [x] Nothing from "Out of Scope" touched (no live Google widget/API, no
      CMS/backend, form fields + submission unchanged, filter system
      reused not rebuilt); only one new component (Reviews)
- [x] Zero "Canberra & Surrounding ACT" (and variants) remain
- [x] All light/dark boundaries blend; no hard cuts
- [x] Team: no licence/insured/ticks; 4 rounded cards, responsive
- [x] Home: hero image more prominent + legible; team block ticks gone;
      reviews present with Google-link placeholder
- [x] Contact: no Opening Hours card; compact reviews; top boundary faded
- [x] Services: image click → Projects filtered (incl. direct URL load);
      no service has >4 ticks; hover cue present
- [x] Animations subtle, fire once, respect `prefers-reduced-motion`
- [x] All `TODO` placeholders clearly marked for the owner

Spec 05 (v3) "Check When Done":

- [x] Goal met: one Book-a-Quote path, Projects pushes to it, gallery keeps
      native aspect ratios + "Other", one image source, tsconfig warning gone,
      admin useful beyond photos
- [x] Nothing in "Out of Scope" built (no "clients"→"customers", form
      unchanged, no auth/role changes, no dependency bumps, no new npm deps,
      only `Lightbox` reworked among shared components)
- [x] No type errors; `npm run build` + `npx tsc -p tsconfig.api.json` green;
      `baseUrl` deprecation gone and the `@/` alias resolves in both tsc + vite
- [x] Exactly one quote CTA destination (`/quote`); Contact nav item removed;
      `/contact` redirects; nothing duplicated
- [x] Projects section ends with the Book a Quote CTA
- [x] Gallery image opens at native aspect ratio, rounded corners, working
      close/prev/next, mobile-safe, focus-trapped
- [x] "Other" category exists, filterable, assignable in admin
- [x] Home/Services/Projects pull from one source; Services deep-links resolve
      to the right category; zero broken image refs
- [x] Admin: reviews, projects, image controls, and team all manageable and
      reflected on the public site after save (verified admin→public e2e)
- [x] "Clients" wording untouched
- [x] Each step verified before the next; adversarial review's confirmed
      findings all fixed and re-verified

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
