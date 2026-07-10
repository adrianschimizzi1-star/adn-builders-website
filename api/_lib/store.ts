import { list, put, del } from "@vercel/blob";

/*
 * Storage layout (Vercel Blob):
 *
 *   projects/<id>.jpg    one image blob per photo
 *   projects/<id>.json   its metadata "sidecar"
 *   team/<id>.jpg        team portraits (no sidecar — referenced by content/team.json)
 *   content/<doc>.json   whole-document site content: reviews, team, projects
 *
 * There is deliberately NO shared manifest for photos. A single mutable JSON
 * manifest can't be safely read-modify-written on Vercel Blob: the store is
 * eventually consistent, so a read taken right after a write can still return the
 * old value, and the next write then drops entries. With independent per-photo
 * sidecars, adding/editing/deleting one photo never touches another, so entries
 * can't be lost. Listing simply reads every sidecar.
 *
 * The `content/*.json` docs look like manifests but are safe for the same reason
 * inverted: they are only ever *whole-document overwrites* driven by the admin
 * (which holds the full current list). The server never reads-then-writes them,
 * so a stale read can't drop entries. See writeDoc().
 */

/** Mirrors `galleryFilters` in src/data/gallery.ts (minus "all"). Keep in sync:
 *  the API rejects any category not in PHOTO_CATEGORIES. */
export type PhotoCategory =
  | "renovations"
  | "new-builds"
  | "bathrooms"
  | "outdoor"
  | "other";

export const PHOTO_CATEGORIES: PhotoCategory[] = [
  "renovations",
  "new-builds",
  "bathrooms",
  "outdoor",
  "other",
];

export interface PhotoEntry {
  id: string;
  title: string;
  category: PhotoCategory;
  alt: string;
  url: string; // public CDN url of the image blob
  pathname: string; // image blob pathname
  createdAt: number;
  /** Explicit sort position, set by the admin's drag-to-reorder. */
  order?: number;
}
// Note: a photo does NOT store its project. `content/projects.json` owns the
// photo→project mapping via `photoIds`, because a project also needs the *order*
// of its photos. Storing it on both sides would let the two drift.

const PREFIX = "projects/";
const sidecarPath = (id: string): string => `${PREFIX}${id}.json`;

/**
 * Display order: photos with no explicit `order` sort FIRST, newest-first; then
 * explicitly-ordered photos ascending.
 *
 * A fresh upload has no `order`, so it lands at the top — matching the default
 * (newest-first) gallery and the admin's optimistic prepend. If instead a
 * no-order photo sorted LAST, then once the owner had ever saved an order every
 * later upload would silently drop to the bottom of the gallery. The unordered
 * sentinel is -1 (all assigned orders are array indices, i.e. >= 0).
 */
function byOrderThenNewest(a: PhotoEntry, b: PhotoEntry): number {
  const ao = a.order ?? -1;
  const bo = b.order ?? -1;
  if (ao !== bo) return ao - bo;
  return b.createdAt - a.createdAt;
}

/** Fetches + parses one metadata sidecar (cache-busted for freshness). */
async function fetchSidecar(url: string): Promise<PhotoEntry | null> {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as PhotoEntry;
    return data && typeof data.id === "string" ? data : null;
  } catch {
    return null;
  }
}

/** All photos, ordered, read from every sidecar under projects/. */
export async function listPhotos(): Promise<PhotoEntry[]> {
  const { blobs } = await list({ prefix: PREFIX });
  const sidecars = blobs.filter((b) => b.pathname.endsWith(".json"));
  const entries = await Promise.all(sidecars.map((b) => fetchSidecar(b.url)));
  return entries
    .filter((e): e is PhotoEntry => e !== null)
    .sort(byOrderThenNewest);
}

/** Reads a single photo's sidecar by id (null if missing). */
export async function readPhoto(id: string): Promise<PhotoEntry | null> {
  const path = sidecarPath(id);
  const { blobs } = await list({ prefix: path, limit: 1 });
  const found = blobs.find((b) => b.pathname === path);
  return found ? fetchSidecar(found.url) : null;
}

/** Stores an image buffer as a public blob, returning its url + pathname. */
export async function putImage(
  pathname: string,
  buffer: Buffer,
  contentType: string,
): Promise<{ url: string; pathname: string }> {
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return { url: blob.url, pathname: blob.pathname };
}

/** Creates or overwrites one photo's metadata sidecar. */
export async function writePhoto(entry: PhotoEntry): Promise<void> {
  await put(sidecarPath(entry.id), JSON.stringify(entry), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

/** Deletes a photo's image + sidecar blobs (best-effort). */
export async function deletePhotoBlobs(entry: PhotoEntry): Promise<void> {
  await Promise.allSettled([del(entry.url), del(sidecarPath(entry.id))]);
}

// ---------------------------------------------------------------------------
// Site content documents (reviews / team / projects)
// ---------------------------------------------------------------------------

export type ContentDoc = "reviews" | "team" | "projects";
export const CONTENT_DOCS: ContentDoc[] = ["reviews", "team", "projects"];

const docPath = (doc: ContentDoc): string => `content/${doc}.json`;

/** Reads one content doc, cache-busted. Returns `fallback` when absent/invalid. */
export async function readDoc<T>(doc: ContentDoc, fallback: T): Promise<T> {
  const path = docPath(doc);
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    const found = blobs.find((b) => b.pathname === path);
    if (!found) return fallback;
    const res = await fetch(`${found.url}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/**
 * Whole-document overwrite. The admin always sends the complete list, so the
 * server never does a read-modify-write — which is exactly what makes this safe
 * on an eventually-consistent store (see the header comment). It's also what
 * makes reordering trivial: the array order *is* the stored order.
 */
export async function writeDoc(doc: ContentDoc, data: unknown): Promise<void> {
  await put(docPath(doc), JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}
