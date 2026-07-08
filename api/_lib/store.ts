import { list, put, del } from "@vercel/blob";

/*
 * Photo storage. Images live as public blobs under `projects/` in Vercel Blob;
 * their metadata (title, category, alt) lives in a single JSON manifest blob.
 * The site (and admin) read the manifest to render the gallery.
 *
 * Concurrency note: writes are read-modify-write on one manifest. That's safe
 * for a single admin editing sequentially (the intended use); it is not built
 * for many simultaneous writers.
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
  pathname: string; // blob pathname (kept for deletion)
  createdAt: number;
}

const MANIFEST_PATH = "projects/manifest.json";

/** Reads the manifest blob; returns [] when it doesn't exist yet. */
export async function readManifest(): Promise<PhotoEntry[]> {
  const { blobs } = await list({ prefix: MANIFEST_PATH, limit: 1 });
  const found = blobs.find((b) => b.pathname === MANIFEST_PATH);
  if (!found) return [];
  const res = await fetch(found.url, { cache: "no-store" });
  if (!res.ok) return [];
  try {
    const data = await res.json();
    return Array.isArray(data) ? (data as PhotoEntry[]) : [];
  } catch {
    return [];
  }
}

/** Overwrites the manifest blob (no CDN caching so reads are always fresh). */
export async function writeManifest(entries: PhotoEntry[]): Promise<void> {
  await put(MANIFEST_PATH, JSON.stringify(entries), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
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

/** Removes an image blob by its public url (best-effort). */
export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
