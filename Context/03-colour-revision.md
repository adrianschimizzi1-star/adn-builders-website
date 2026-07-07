# Theme Retheme: Dark Blue → Charcoal Blue-Grey — Implementation Spec

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
* What is NOT wired up yet: analytics, payments, email beyond
  Formspree, CMS. Do not invent or add any of these.

Design system / conventions (see context files below):

* All colors are Tailwind tokens defined in `tailwind.config`
  per `context/ui-context.md` — components never hardcode hex
* Accent color is reserved for calls to action only
* Accessibility bar: all text must keep WCAG AA contrast
  against its background after the retheme

How to work (non-negotiable): Implement one step at a time.
After each step, verify it (build passes, no type errors, no
lint errors, behaves as described) before starting the next.
Do not batch the whole feature and check at the end.

## 1. Goal

The site's overall colour theme shifts from its current dark
blue look to a darker, desaturated charcoal blue-grey — closer
to black with a cool blue undertone — while every section, the
gallery, and the quote form remain fully legible and the CTAs
remain clearly the most prominent elements on the page.

## 2. Out of Scope

* Do NOT change any layout, spacing, typography, or content
* Do NOT restructure routing or pages (that is a separate spec)
* Do NOT touch component logic — this task changes token
  values and, only where necessary, which token a class uses
* Do NOT create new shared components (reuse existing)
* Do NOT add new dependencies
* Do NOT hardcode any hex value inside a component — all
  changes flow through the token definitions

## 3. Design Decisions

Context files that govern this feature:

* `context/ui-context.md` — token table is the single source
  of colour truth; update it in the same commit as the config
* `context/code-standards.md` — "no hardcoded hex values"
  rule applies to every change here
* `context/ai-workflow-rules.md` — docs must be updated in
  sync with implementation

Decisions locked for this feature:

* Direction: darker and less saturated than the current blue.
  Target feel: charcoal / gunmetal with a subtle blue cast.
* Proposed token values (starting point — tune on screen,
  then record finals in ui-context.md):
  * `bg-base`: #0B0E13 (near-black, blue undertone)
  * `bg-surface`: #131720 (raised sections/cards)
  * `bg-elevated`: #1A2029 (navbar, lightbox, form fields)
  * `text-primary`: #F2F4F7
  * `text-muted`: #9AA3B2
  * `border-default`: #232B37
  * `accent-primary`: keep hue family of the logo but ensure
    it pops against #0B0E13 — likely a brighter step of the
    current accent [confirm against logo]
  * `state-error` / `state-success`: keep, but verify AA
    contrast on the new dark surfaces
* Photos: gallery images sit on `bg-surface` with the existing
  rounded corners; add no overlays or filters to photos
* Hero: the existing dark overlay on the hero photo may need
  its opacity reduced now that surrounding UI is darker —
  adjust only if hero text contrast fails AA
* Edge cases: form focus rings, disabled button state, and
  lightbox backdrop must all be re-checked on the new palette

## 4. Implementation

Step 1 — Update token definitions

* File: `tailwind.config.[ts/js]`
* Replace the colour token values with the palette in
  Section 3. Do not rename any token.
* Verify: build passes; site renders with new palette.

Step 2 — Sweep for hardcoded colours

* Files: `src/components/*`, `src/sections/*`
* Grep for `#`, `rgb(`, `bg-[`, `text-[` arbitrary values.
  Replace any hardcoded colour with the correct token class.
  Flag (do not silently change) anything ambiguous.
* Verify: grep returns no raw colour values in components.

Step 3 — Contrast and state audit

* Files: `src/sections/QuoteForm.tsx`, `src/components/Button.tsx`,
  `src/components/Lightbox.tsx`, hero section
* Check text/background pairs for WCAG AA; adjust `text-muted`
  or surface tokens (in config only) if any pair fails.
  Confirm hover, focus, disabled, success, and error states
  are all visibly distinct on the new palette.
* Verify: manual pass on mobile viewport + desktop.

Step 4 — Sync documentation

* File: `context/ui-context.md`
* Record the final hex values in the token table and change
  the Theme description to reflect the charcoal blue-grey
  direction. Update `context/progress-tracker.md`.
* Verify: docs match `tailwind.config` exactly.

## 5. Check When Done

* [ ] Goal (Section 1) is fully met and demonstrable
* [ ] Nothing in "Out of Scope" (Section 2) was built or touched
* [ ] No new components created beyond those named in Section 4
* [ ] No type errors
* [ ] No lint errors
* [ ] Build passes
* [ ] All text passes AA contrast on new backgrounds
* [ ] Hover / focus / disabled / error / success states audited
* [ ] `context/ui-context.md` token table matches the config
* [ ] Each step was verified before the next was started