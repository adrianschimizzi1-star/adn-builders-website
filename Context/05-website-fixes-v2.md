# ADN Builders Website v3 (Structure, Gallery & Admin Pass) — Implementation Spec

Read this whole file before writing any code. This spec is the single source of truth for this task. If something here conflicts with what you think is "better," follow the spec — the constraints exist for reasons that aren't always visible from inside the codebase. If a genuine blocker or ambiguity exists, stop and flag it rather than guessing.

## 0. Context for the Implementing Agent

**What the product is:** Marketing website for ADN Builders, a Canberra-based building/renovation business. Purpose: showcase services and past projects, build trust, and drive quote requests. Includes a basic admin area currently used for photo management.

**Stack (ground truth — do not assume anything beyond this):**

* Frontend: TypeScript (confirmed via `tsconfig.app.json` — assumed Vite + React; `[CONFIRM ON CODEBASE ACCESS]`)
* Backend / DB: `[CONFIRM — an admin area exists for photos, so some persistence layer exists; identify it before touching admin code]`
* Hosting: `[CONFIRM]`
* What is NOT wired up yet: No CMS beyond the existing admin, no auth changes, no email backend changes, no analytics. Do not invent any of these.

**Design system / conventions:**

* Existing palette, typography, and the rounded-corner card standard from the v2 spec apply here.
* Gallery/lightbox behaviour must feel native and minimal — no heavy lightbox libraries if a lightweight/existing solution works.
* This spec builds ON TOP of the v2 spec (`adn-website-changes-spec.md`). Where both touch the same area (e.g. Contact/Book a Quote), v3 supersedes v2's layout but keeps v2's styling decisions (faded section boundary, compact reviews).

**How to work (non-negotiable):** Implement one step at a time. After each step, verify it (build passes, no type errors, no lint errors, behaves as described) before starting the next. Do not batch the whole feature and check at the end.

## 1. Goal

The site has one clear conversion path (Book a Quote), the Projects section actively pushes visitors toward it, the gallery respects each photo's real shape and supports an "Other" category, all images across Home/Services/Projects come from one consistent source and link into each other correctly, the TypeScript deprecation warning is gone, and the admin area is genuinely useful beyond photo uploads.

## 2. Out of Scope

* Do NOT change "our clients" wording to "customers" — decision analysed and locked: "clients" stays (professional-services positioning).
* Do NOT redesign the quote form fields or its submission behaviour.
* Do NOT add authentication/roles to admin beyond what exists.
* Do NOT upgrade TypeScript or other dependency versions — the tsconfig fix is a config change only.
* Do NOT add a heavyweight lightbox/gallery library without flagging first.
* Do NOT create new shared components unless this spec names them.
* Do NOT touch the v2 animations utility, section fades, team cards, or reviews component except where Step 3 (page consolidation) requires moving them.
* Do NOT add new dependencies without flagging first.

## 3. Design Decisions

**Context files that govern this feature:**

* `tsconfig.app.json` — deprecation fix target
* `adn-website-changes-spec.md` — v2 decisions that remain binding (styling, reviews, services deep-links)
* `[TBD — image data source / admin code]` — must be identified in Step 0 of implementation before Steps 5–7

**Decisions locked for this feature:**

* **tsconfig fix:** Remove the deprecated `baseUrl` option. Rewrite `compilerOptions.paths` entries as tsconfig-relative (e.g. `"@/*": ["./src/*"]`). Verify the same alias resolution still works in the bundler config (`vite.config.ts` or equivalent) — the bundler alias is independent of tsconfig and must not break.
* **Projects CTA:** Add a CTA block at the bottom of the Projects section: short line (e.g. "Want results like these?") + one button **"Book a Quote"** that navigates/scrolls to the Book a Quote section. Styled as the site's existing primary button. This is the only CTA added.
* **Page consolidation:** Merge Contact and Book a Quote into ONE section/page titled **"Book a Quote"**. Layout: quote form as the primary element; contact details (phone, email, service area) as a secondary card beside/below it; v2's compact reviews stay in this section. Remove the separate Contact nav item/button — nav and all site CTAs point to the single Book a Quote destination. No duplicate buttons anywhere performing the same action.
* **Gallery "Other" category:** Add an "Other" category to the gallery filter for non-project images. Admin must be able to assign images to it (Step 7).
* **Gallery aspect ratios:** Stop force-cropping all photos to landscape. Grid thumbnails may keep a uniform tile (masonry or current grid — whichever is less invasive), but clicking an image opens it full-size at its **native aspect ratio** (portrait stays portrait) in a minimal lightbox: dark backdrop, rounded corners on the image, close on backdrop click / Esc, prev-next arrows. Reuse an existing lightbox if present; otherwise build a minimal one — this is the only new component this spec authorises (named: `Lightbox`).
* **Image interlinking (Home / Services / Projects):** All three sections must draw from one shared image data source (single manifest/data module or the admin's storage — whichever already exists; do not create a parallel copy). Each image record carries a category tag. Services images use the tag to deep-link into the correctly filtered Projects view (v2 mechanism). Home imagery references the same records — no duplicated/orphaned image files with inconsistent categories. Verify every image shown on Home and Services exists in and matches its Projects category.
* **Admin improvements (beyond photos):** Add management for the site's other editable content, scoped to what the existing admin architecture supports:
  1. **Reviews manager** — add/edit/delete/reorder the manual reviews from v2 (name, stars, quote) for both homepage and quote-section placements.
  2. **Project manager** — create/edit/delete projects: title, category (incl. "Other"), photos attached, reorder photos within a project.
  3. **Image controls** — assign/change category (incl. "Other"), delete, and drag-to-reorder within a category.
  4. **Team manager** — edit the four team cards (photo, name, description) from v2.
  If the existing admin persistence cannot support any of these, stop and flag with the specific limitation rather than hacking around it.
* **Edge cases:** Lightbox on mobile (pinch/scroll must not break page); portrait images taller than viewport scale to fit; empty "Other" category renders cleanly; admin edits reflect on the public site after save/refresh; deleted images must not leave broken references on Home/Services.

## 4. Implementation

> Fill `[TBD]` paths on codebase access before executing. Step 0 is mandatory reconnaissance.

**Step 0 — Recon (no code changes)**
* Identify: bundler + framework, where image data lives, how admin persists data, existing lightbox (if any), nav structure. Fill all `[TBD]`s in this spec. Flag any conflict with Section 3 before proceeding.

**Step 1 — tsconfig fix**
* File: `tsconfig.app.json`
* Remove `baseUrl`; rewrite `paths` as relative. Verify: warning gone, build passes, all alias imports resolve.

**Step 2 — Projects CTA**
* File: `[projects section]`
* Add CTA block per Section 3. Verify scroll/navigation lands on Book a Quote.

**Step 3 — Contact → Book a Quote consolidation**
* Files: `[contact section]`, `[nav]`, `[any component with a Contact CTA]`
* Merge per Section 3; remove Contact nav item; repoint all CTAs. Verify: exactly one destination, no dead links, v2 reviews + faded boundary intact.

**Step 4 — Lightbox + native aspect ratios**
* Files: `[gallery/projects components]`, `[new: Lightbox component]`
* Implement per Section 3. Verify with a portrait, a landscape, and a square image; test mobile.

**Step 5 — "Other" gallery category**
* Files: `[gallery filter]`, `[image data source]`
* Add category to filter + data model. Verify filtering and empty-state.

**Step 6 — Image source unification**
* Files: `[image data source]`, `[home]`, `[services]`, `[projects]`
* Point all three sections at the single source; remove duplicates; confirm services deep-links resolve to correct categories. Verify no broken/missing images anywhere.

**Step 7 — Admin expansion**
* Files: `[admin]`
* Implement the four managers from Section 3 one at a time (reviews → projects → image controls → team), verifying each end-to-end (admin edit → public site reflects it) before the next.

## 5. Check When Done

* Goal (Section 1) fully met and demonstrable
* Nothing in "Out of Scope" (Section 2) was built or touched
* No new components beyond `Lightbox` (Step 4)
* No type errors / no lint errors / build passes / tsconfig deprecation warning gone
* Exactly one quote CTA destination site-wide; Contact page/nav item removed; nothing duplicated
* Projects section ends with the Book a Quote CTA
* Clicking any gallery image opens it at native aspect ratio, rounded corners, working close/prev/next, mobile-safe
* "Other" category exists, filterable, assignable in admin
* Home/Services/Projects all pull from one image source; every services image deep-links to the right category; zero broken image references
* Admin: reviews, projects, image controls, and team are all manageable and changes reflect on the public site
* "Clients" wording untouched
* Each step was verified before the next was started