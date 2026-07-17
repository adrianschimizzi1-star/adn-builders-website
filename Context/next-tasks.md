# ADN Builders — Next Tasks

What's open right now, in priority order. Companion to
`ADN-progress-tracker.md` (the full history lives there); this file is the
short "what do we do next" list. Update both in the same commit as any
feature.

> Last updated: 2026-07-18 (after spec `08-website-fixes-2.md`)

## 1 · Review & merge the spec-08 PR

- [ ] Open the Vercel **preview link** on the PR (`feat/website-fixes-2`) and
      walk every page — this is the "see the entire website fully functioning"
      preview the owner asked for. Tip: `<preview-url>/preview` shows all five
      pages in phone frames for the mobile check.
- [ ] Check the mobile spacing between "View all Services" and "Our work"
      feels right on a real phone.
- [ ] Address CodeRabbit feedback, then merge → auto-deploys to production.

## 2 · Owner check — admin project uploads (needs `ADMIN_PASSWORD`)

Couldn't be driven locally (serverless API + password only exist on Vercel):

- [ ] Log into `/admin` → **Projects** → give a project a title → **"Upload
      photos into this project"** → pick 2–3 photos at once.
- [ ] Confirm: photos upload with progress, the success banner appears, and
      the public gallery shows **one tile** with a photo-count badge whose
      lightbox arrows step through all of them.
- [ ] Also confirm the Photos tab lists the new uploads (they should appear
      at the top).

## 3 · Owner content (site shows placeholders / hides sections until then)

- [ ] **Reviews** — enter real ones in `/admin` → Reviews. The /quote page
      now features the **first** review as a single quote — put the
      strongest one first.
- [ ] **Team** — enter members in `/admin` → Team. The /about "Meet the
      team" block is hidden until at least one exists; partial rows centre
      automatically.
- [ ] **Project photos** — upload real photos (ideally via the new
      into-project control) and drop the hero shot at
      `public/projects/hero-bathroom.jpg`.
- [ ] **Google reviews URL** — `src/data/reviews.ts` `googleReviewsUrl`
      (the "Read more on Google" buttons stay hidden until set).
- [ ] Confirm builder names/bio drafts (`src/data/about.ts`) and opening
      hours (`src/data/business.ts`).

## 4 · Nice-to-have / not scoped yet

- [ ] Live-submit the quote form once on production (Formspree `mvzjybdn`
      is wired; confirm the email arrives).
- [ ] Fix the pre-existing quirk that a *direct* load of a hash URL (e.g.
      `/#gallery`) doesn't scroll — `ScrollToTop` resets scroll on mount.
- [ ] Sitemap.xml / per-route canonical + OG tags; footer social links;
      analytics (was out of scope); real per-project case studies.
- [ ] Delete `/preview` (dev aid) when no longer useful.
