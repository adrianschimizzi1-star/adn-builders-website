Read this whole file before writing any code. This spec is the single source of truth for this task. If something here conflicts with what you think is "better," follow the spec — the constraints exist for reasons that aren't always visible from inside the codebase. If a genuine blocker or ambiguity exists, stop and flag it rather than guessing.

## 0. Context for the Implementing Agent

**What the product is:** Marketing website for ADN Builders, a Canberra-based building/renovation business. Purpose: showcase services and past projects, build trust, and drive quote requests. Audience: local homeowners.

**Stack (ground truth — do not assume anything beyond this):**

* Frontend: `[CONFIRM ON CODEBASE ACCESS — assumed static HTML/CSS/JS or React single-page site]`
* Backend / DB: None. Static site.
* Hosting: `[CONFIRM — assumed Vercel/Netlify style static hosting]`
* What is NOT wired up yet: No CMS, no Google Reviews API/embed, no analytics changes, no payments, no email backend changes. Do not invent any of these.

**Design system / conventions:**

* Existing palette only. The site alternates light and dark sections — preserve that rhythm, only soften the boundaries (Section 3).
* Existing typography only. No new fonts.
* Rounded corners are the standard card treatment site-wide after this task — team cards and review cards must match each other's radius.
* Animations must be subtle and professional: fade-up on scroll, slight hover lifts. Nothing bouncy, nothing looping, nothing that draws attention to itself. If an animation is noticeable as an animation, it's too much.
* Accessibility: all animations must respect `prefers-reduced-motion` (disable/reduce when set).

**How to work (non-negotiable):** Implement one step at a time. After each step, verify it (build passes, no type errors, no lint errors, behaves as described) before starting the next. Do not batch the whole feature and check at the end.

## 1. Goal

The site reads as one continuous, professionally polished page: sections blend instead of hard-cutting, the hero image is prominent, tick-mark clutter is replaced with human content (team cards, curated reviews), and Services images deep-link into the matching Projects category. A visitor can see who the team is, read real reviews, and click from a service straight to proof of that work.

## 2. Out of Scope

* Do NOT embed a live Google Reviews widget or call any Google API. Reviews are manual/static (decision locked, Section 3).
* Do NOT redesign the overall layout, nav, colour palette, or typography.
* Do NOT add a CMS, database, or any backend.
* Do NOT change the quote/contact form fields or its submission behaviour.
* Do NOT restructure the Projects section's existing filter system — only hook into it.
* Do NOT create new shared components unless this spec names them (reuse existing card/button patterns).
* Do NOT add new dependencies without flagging first. Scroll animations should use IntersectionObserver + CSS, not an animation library, unless one already exists in the project.
* Do NOT add heavy parallax, page-load splash animations, or anything "flashy."

## 3. Design Decisions

**Context files that govern this feature:**

* `[TBD — main stylesheet]` — section background colours, existing card styles, border-radius token
* `[TBD — Projects section component/file]` — existing category filter mechanism (site already supports "view all" + per-category filtering; deep-linking must reuse this exact mechanism)
* `[TBD — images/assets dir]` — team member photos (4) to be provided by owner

**Decisions locked for this feature:**

* **Section transitions:** Replace hard light↔dark cuts with a *very slight* gradient blend at each boundary (~60–100px transition zone via `linear-gradient` on a boundary element or section-edge pseudo-element). It should read as "not a straight cut," nothing more. Every light/dark boundary on the site gets this, including the top of Contact/Book a Quote.
* **Copy — location tagline:** Replace every instance of "Canberra & Surrounding ACT" with **"Canberra & the Capital Region"**. Exact string, site-wide, all instances.
* **Team section:** Delete the license badge, "Fully Insured" badge, and ALL tick-mark list items. Replace with a 4-card grid: photo on top (consistent aspect ratio, e.g. 4:5 or 1:1 — pick one and use it for all four), name below, short one-to-two line description below that. Rounded corners on the card and on the image top edges. Responsive: 4-across desktop, 2×2 tablet, stacked mobile. Placeholder images + placeholder names/descriptions until owner supplies real ones — mark clearly as `TODO: replace`.
* **Homepage — hero:** Reduce the dark overlay opacity on the hero image so the photo is clearly more visible. Keep enough overlay that headline text still passes contrast — target roughly a 15–25% reduction in overlay opacity, tuned by eye against text legibility.
* **Homepage — "Team behind ADN":** Remove all tick marks from this block. Keep the rest of the block's content/copy.
* **Homepage — reviews:** Add a new reviews section (manual, static). 3–4 review cards: reviewer first name, 5-star display, short quote. Below the cards, one button: **"Read more on Google"** → links to ADN's actual Google Business reviews page (`href` = `TODO: owner supplies Google reviews URL`, opens in new tab). Rounded corners matching team cards. Placeholder review content marked `TODO: replace with real reviews`.
* **Contact/Book a Quote — reviews:** Reuse the same review card component/markup (2–3 cards, can be a compact variant). Same "Read more on Google" link.
* **Contact/Book a Quote:** Delete the Opening Hours card entirely. Reflow remaining contact cards so the layout doesn't leave a hole.
* **Services:** Each service's image is clickable → navigates to the Projects section with that service's category pre-selected (e.g. Renovation image → Projects filtered to Renovations). Implementation must reuse the Projects section's existing filter: navigate/scroll to Projects and programmatically apply the matching category (hash/query param like `#projects?cat=renovations` or a direct filter-state call — whichever fits the existing mechanism). Add a hover cue on service images (slight zoom/overlay + "View projects" hint) so clickability is discoverable. Each service description is capped at **max 4** tick items — trim any list longer than 4 down to the 4 strongest.
* **Animations (site-wide):** Fade-up-on-scroll (opacity 0→1, translateY ~16–24px, ~500–700ms ease-out, small stagger within card grids) applied to section headings, cards, and service blocks via a single reusable IntersectionObserver utility. Trigger once per element (no re-animating on scroll back up). Subtle hover lift on cards/buttons. Respect `prefers-reduced-motion`.
* **Edge cases:** Direct-load of the projects deep-link URL must apply the filter on page load, not just on click. Review section with no reviews yet should still render cleanly with placeholders. Reduced-motion users get instant-visible content, no fades.

## 4. Implementation

> File paths below are placeholders — fill with exact paths on codebase access before executing.

**Step 1 — Section fade transitions**
* File: `[main stylesheet / section components]`
* Add a reusable boundary-blend treatment (gradient transition zone) and apply to every light↔dark section boundary, including top of Contact. Verify visually at every boundary, both directions.

**Step 2 — Copy replacement**
* Files: all files containing the string
* Global find/replace: `Canberra & Surrounding ACT` → `Canberra & the Capital Region`. Grep afterwards to confirm zero remaining instances (check for variant spellings/ampersand vs "and").

**Step 3 — Hero overlay**
* File: `[hero section]`
* Reduce dark overlay opacity per Section 3. Verify headline/subtext contrast on desktop and mobile widths.

**Step 4 — Team section rebuild**
* File: `[team section]`
* Remove license/insured badges and all tick lists. Build the 4-card grid (image / name / description, rounded corners) with placeholder content marked `TODO`. Verify responsive at desktop/tablet/mobile.

**Step 5 — Homepage "Team behind ADN" ticks**
* File: `[homepage team-behind block]`
* Remove all tick marks, keep surrounding copy. Verify layout doesn't collapse.

**Step 6 — Services: tick cap + clickable images**
* File: `[services section]`, `[projects section]`
* Trim each service's ticks to max 4. Make each service image a link that navigates to Projects with the matching category filter applied (reusing the existing filter mechanism); add hover cue. Verify: click each service image → correct category shows; direct URL load also applies the filter.

**Step 7 — Reviews component + placements**
* Files: `[new: reviews component/partial]`, `[homepage]`, `[contact section]`
* Build the static review card block (name, stars, quote, rounded corners) + "Read more on Google" button (`TODO` href, `target="_blank" rel="noopener"`). Place full version on homepage, compact version in Contact. This is the ONLY new component this spec authorises.

**Step 8 — Contact section cleanup**
* File: `[contact section]`
* Delete Opening Hours card, reflow remaining cards. Verify no layout hole at all breakpoints.

**Step 9 — Scroll animations**
* Files: `[new: single JS utility or existing script file]`, `[stylesheet]`
* One IntersectionObserver utility + CSS classes for fade-up with stagger; apply to headings, cards, service blocks. Wrap in `prefers-reduced-motion` check. Verify: subtle, fires once, nothing animates for reduced-motion users.

## 5. Check When Done

* Goal (Section 1) fully met and demonstrable
* Nothing in "Out of Scope" (Section 2) was built or touched
* No new components beyond the reviews block (Step 7)
* No type errors / no lint errors / build passes
* Zero instances of "Canberra & Surrounding ACT" remain
* All light/dark boundaries blend; no hard cuts anywhere
* Team section: no license/insured/ticks; 4 rounded cards render responsively
* Homepage: hero image visibly more prominent, text still legible; "Team behind ADN" has no ticks; reviews section present with working Google link placeholder
* Contact: no Opening Hours card; compact reviews present; top boundary faded
* Services: every image click lands on Projects with correct category filtered (including direct URL load); no service has >4 ticks; hover cue present
* Animations subtle, fire once, respect `prefers-reduced-motion`
* All `TODO` placeholders (team photos/names/descriptions, real reviews, Google reviews URL) clearly marked for owner
* Each step was verified before the next was started