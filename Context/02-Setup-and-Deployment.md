# ADN Builders — Setup & Deployment

Everything you need to take this from scaffold → live site. Work top to bottom.

---

## Already done ✅

- Vite + React + TypeScript + Tailwind v4, dark premium navy+orange theme (from the logo)
- Logo added (`public/adn-logo.png`) and used in the navbar + footer
- Team photos added (`public/team/`) and used in the About section
- 25+ years experience shown in the hero, About badge, and trust strips
- Single-page layout: Hero · Services · Projects · About · Quote · Footer
- Formspree-ready enquiry form with validation + success/error states
- Local SEO: Canberra title/meta, Open Graph, JSON-LD, alt text

---

## 1. Run it locally (optional preview)

```bash
npm install     # first time only
npm run dev      # open the URL it prints (usually http://localhost:5173)
```

---

## 2. Drop in the hero photo  ← needed for the look you asked for

The dark bathroom photo you want as the hero background isn't in the project
yet. Save it here and it appears automatically (with a dark overlay so all the
hero text stays readable):

```
public/projects/hero-bathroom.jpg
```

Until it's there, the hero falls back to a dark navy gradient — nothing breaks.

---

## 3. Add the real content

Content lives in **`src/data/`** — no need to touch components. Replace every
value wrapped in `NEEDS_INPUT(...)` (search the folder for `NEEDS_INPUT`).

| Field                          | File                      |
| ------------------------------ | ------------------------- |
| Phone (click-to-call)          | `src/data/business.ts`    |
| Email                          | `src/data/business.ts`    |
| Licence number                 | `src/data/business.ts`    |
| Formspree form ID              | `src/data/business.ts`    |
| Builder names (confirm!)       | `src/data/about.ts`       |
| Bio / about copy               | `src/data/about.ts`       |

> ⚠️ I inferred the builders are **Anthony & Nato** from the photo filenames —
> please confirm or correct the names and bio in `src/data/about.ts`.

To "un-placeholder" a value, keep the string and drop the wrapper:
`phone: NEEDS_INPUT("0400 000 000")` → `phone: "0412 345 678"`.

---

## 4. More project photos (gallery)

1. Drop images into `public/projects/`.
2. In `src/data/gallery.ts`, add a `src` to each project
   (e.g. `src: "/projects/kitchen-reno.jpg"`) with a descriptive `alt` and the
   right `category`.
3. Projects without a `src` show a tidy "Photo coming soon" placeholder.

---

## 5. Connect the enquiry form (Formspree)

1. Sign up at <https://formspree.io> (free tier is fine).
2. Create a form; set the notification email to the builder's inbox.
3. Copy the form ID (the code after `/f/`, e.g. `xdorwkbz`).
4. Paste it into `FORMSPREE_ID` in `src/data/business.ts`.
5. `npm run dev`, send a test enquiry, confirm the email arrives.

---

## 6. Deploy to Vercel

You have a Vercel account, so the easiest path is the dashboard:

**Option A — via GitHub (recommended, auto-deploys on every push)**
1. Put this project in a GitHub repo (`git init`, commit, push).
2. Vercel → **Add New… → Project → Import** the repo.
3. It auto-detects Vite (build `npm run build`, output `dist`). **Deploy**.

**Option B — via CLI**
```bash
npm i -g vercel
vercel          # link/create the project
vercel --prod   # production deploy
```

**Custom domain** (e.g. `adnbuilders.com.au`): Vercel → Project → Settings →
Domains. Then update the `canonical`/`og:*` URLs in `index.html`.

---

## What I still need from you

- The **bathroom hero photo** saved to `public/projects/hero-bathroom.jpg`
- **Confirm builder names** + a bio (or tweak the draft in `about.ts`)
- **Phone, email, licence number** (step 3)
- **Formspree form ID** (step 5)
