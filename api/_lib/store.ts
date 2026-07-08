import { list, put, del } from "@vercel/blob";

/*
 * Photo storage — one image blob plus one metadata "sidecar" JSON blob per
 * photo, both under `projects/` (e.g. `projects/<id>.jpg` + `projects/<id>.json`).
 *
 * There is deliberately NO shared manifest file. A single mutable JSON manifest
 * can't be safely read-modify-written on Vercel Blob: the store is eventually
 * consistent, so a read taken right after a write can still return the old
 * value, and the next write then drops entries. With independent per-photo
 * sidecars, adding/editing/deleting one photo never touches another, so entries
 * can't be lost. Listing simply reads every sidecar.
 */

export type PhotoCategory =
  | "renovations"
  | "new-builds"
  | "bathrooms"
  | "outdoor";

export const PHOTO_CATEGORIES: PhotoCategory[] = [
  "renovations",
  "new-builds",
  "bathrooms",
  "outdoor",
];

export interface PhotoEntry {
  id: string;
  title: string;
  category: PhotoCategory;
  alt: string;
  url: string; // public CDN url of the image blob
  pathname: string; // image blob pathname
  createdAt: number;
}

const PREFIX = "projects/";
const sidecarPath = (id: string): string => `${PREFIX}${id}.json`;

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

/** All photos, newest first, read from every sidecar under projects/. */
export async function listPhotos(): Promise<PhotoEntry[]> {
  const { blobs } = await list({ prefix: PREFIX });
  const sidecars = blobs.filter((b) => b.pathname.endsWith(".json"));
  const entries = await Promise.all(sidecars.map((b) => fetchSidecar(b.url)));
  return entries
    .filter((e): e is PhotoEntry => e !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
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
