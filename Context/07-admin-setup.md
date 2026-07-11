# Admin / site content — setup

A password-gated admin page at **`/admin`** manages everything the owner can edit:
**photos, projects, reviews, and the team**. Content is stored in **Vercel Blob**
and appears on the live site automatically — no code change or redeploy.

## How it fits together

| Piece | Where | Does |
| --- | --- | --- |
| Admin UI | `src/pages/AdminPage.tsx` (route `/admin`, lazy-loaded, `noindex`) | Password gate + four tabbed managers |
| Managers | `src/pages/admin/{Photos,Projects,Reviews,Team}Panel.tsx` | Upload/edit/delete/reorder; drag handle + keyboard arrows |
| Password check | `api/login.ts` + `api/_lib/auth.ts` | Verifies the password **on the server**, issues a signed httpOnly session cookie (8 h) |
| Session / logout | `api/session.ts`, `api/logout.ts` | Is-logged-in check + sign out |
| Photos API | `api/photos.ts` + `api/_lib/store.ts` | `GET` list (public), `POST` add, `PATCH` edit **or** bulk reorder, `DELETE` remove |
| Content API | `api/content.ts` | `GET` reviews+team+projects (public), `PUT` one document (authed) |
| Image upload | `api/upload.ts` | Authed upload for team portraits (whitelisted `team/` prefix only) |
| Storage | Vercel Blob | Images under `projects/` + `team/`; **one metadata sidecar per photo** (`projects/<id>.json`); site content in `content/{reviews,team,projects}.json` |
| Live site | `src/hooks/usePhotos.ts`, `src/hooks/useSiteContent.ts` | Fetch `/api/photos` + `/api/content`; fall back to the static seeds in `src/data/` |

## One-time Vercel setup (required before it works)

1. **Create a _public_ Blob store** and connect it to this project
   The gallery serves permanent public image URLs, so the store **must be
   Public** — a Private store rejects the uploads with "Cannot use public
   access on a private store". Access mode is fixed at creation and can't be
   changed later. Either:
   - Dashboard → **Storage** → **Create** → **Blob** → set access to **Public**
     → connect to the project, or
   - CLI: `npx vercel blob create-store <name> --access public --yes \
       --environment production --environment preview --environment development`

   Connecting adds the `BLOB_READ_WRITE_TOKEN` env var (which embeds the store).

2. **Add two environment variables**
   Project → **Settings** → **Environment Variables** (add to Production, Preview,
   and Development so `vercel dev` works too):

   | Name | Value |
   | --- | --- |
   | `ADMIN_PASSWORD` | the password you'll type at `/admin` — pick a strong one |
   | `SESSION_SECRET` | a long random string (below) |

   Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

3. **Redeploy** (push to `main`, or hit Redeploy) so the functions pick up the vars.

Then visit `https://<your-site>/admin`, enter the password, and start uploading.

## Running it locally

Plain `npm run dev` (Vite) does **not** run the `/api` functions — the site still
works (the gallery falls back to the static photos), but login/upload won't.
To test the admin end-to-end locally, use the Vercel CLI:

```bash
npm i -g vercel        # once
vercel link            # once, link this folder to the Vercel project
vercel env pull        # pulls the env vars into .env.local (git-ignored)
vercel dev             # runs the site + functions together
```

## Notes

- **Password strength:** the password is never sent to the browser and is checked
  server-side with a constant-time compare. Keep `ADMIN_PASSWORD` and
  `SESSION_SECRET` secret — anyone with them can manage photos.
- **Image handling:** photos are downscaled to ~2000px and re-encoded to JPEG in
  your browser before upload, so uploads are fast and storage stays small.
- **Backend types:** `/api` isn't part of `npm run build` (Vercel compiles it).
  Type-check it with `npx tsc -p tsconfig.api.json`.
- **Why per-photo sidecars, not a manifest:** Vercel Blob is *eventually
  consistent*. A single shared `manifest.json` can't be safely read-modify-written
  — a read taken right after a write can return the old value, and the next write
  then drops entries. Independent sidecars mean adding/editing/deleting one photo
  never touches another. (This bit us once; see commit `02148ff`.)
- **Why `content/*.json` is safe despite looking like a manifest:** it is only ever
  written as a *whole-document overwrite* from the admin, which holds the complete
  current list. The server never reads-then-writes it, so a stale read can't drop
  entries. The array order *is* the display order, which is also how reordering is
  persisted.
- **Photo↔project membership** lives only in `content/projects.json` (`photoIds`),
  never on the photo — a project needs the *order* of its photos, so storing it on
  both sides would let them drift. Deleting a photo leaves a dangling id, which
  every consumer skips on read (`buildProjectTiles`); there is deliberately no
  server-side cascade, since that would require the unsafe read-modify-write above.
- **Concurrency:** designed for one admin editing at a time (the intended use).
