# Admin / photo uploads — setup

A password-gated admin page at **`/admin`** lets you upload, manage, and delete
portfolio photos. Photos are stored in **Vercel Blob** and appear on the live
Gallery (and the Services page strips) automatically — no code change or redeploy.

## How it fits together

| Piece | Where | Does |
| --- | --- | --- |
| Admin UI | `src/pages/AdminPage.tsx` (route `/admin`, lazy-loaded, `noindex`) | Login, drag-drop upload (auto-resizes in the browser), manage/delete |
| Password check | `api/login.ts` + `api/_lib/auth.ts` | Verifies the password **on the server**, issues a signed httpOnly session cookie (8 h) |
| Session / logout | `api/session.ts`, `api/logout.ts` | Is-logged-in check + sign out |
| Photos API | `api/photos.ts` + `api/_lib/store.ts` | `GET` list (public), `POST` add, `DELETE` remove |
| Storage | Vercel Blob | Images under `projects/`, metadata in `projects/manifest.json` |
| Live gallery | `src/hooks/usePhotos.ts` | Fetches `/api/photos`; falls back to the static seed in `src/data/gallery.ts` |

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
- **Concurrency:** the manifest is a single read-modify-write file — fine for one
  admin editing at a time (the intended use).
