import type { PhotoCategory, Project } from "../data/gallery";
import type { Review } from "../data/reviews";
import type { TeamMember } from "../data/about";

/**
 * Thin client for the /api backend (login/session, photo CRUD, site content)
 * plus an in-browser image downscaler. All calls are same-origin so the httpOnly
 * session cookie rides along automatically.
 */

export type { PhotoCategory };

export interface ServerPhoto {
  id: string;
  title: string;
  category: PhotoCategory;
  alt: string;
  url: string;
  pathname: string;
  createdAt: number;
  order?: number;
}

/** Everything the owner can edit that isn't a portfolio photo. */
export interface SiteContent {
  reviews: Review[];
  team: TeamMember[];
  projects: Project[];
}

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & Record<string, unknown>;
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export async function login(password: string): Promise<void> {
  await jsonFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function logout(): Promise<void> {
  await jsonFetch("/api/logout", { method: "POST" });
}

export async function checkSession(): Promise<boolean> {
  try {
    const { authed } = await jsonFetch<{ authed: boolean }>("/api/session");
    return authed;
  } catch {
    return false;
  }
}

/**
 * Lists photos. Pass `fresh` in the admin to bypass the ~30s edge cache so a
 * refresh right after an add/edit/delete reflects the true server state; the
 * public gallery omits it and keeps the cache for speed.
 */
export async function listPhotos(fresh = false): Promise<ServerPhoto[]> {
  const url = fresh ? `/api/photos?t=${Date.now()}` : "/api/photos";
  const { photos } = await jsonFetch<{ photos: ServerPhoto[] }>(url);
  return Array.isArray(photos) ? photos : [];
}

export async function uploadPhoto(input: {
  dataBase64: string;
  contentType: string;
  title: string;
  category: PhotoCategory;
  alt: string;
}): Promise<ServerPhoto> {
  const { photo } = await jsonFetch<{ photo: ServerPhoto }>("/api/photos", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return photo;
}

export async function updatePhoto(
  id: string,
  input: { title: string; category: PhotoCategory; alt: string },
): Promise<ServerPhoto> {
  const { photo } = await jsonFetch<{ photo: ServerPhoto }>("/api/photos", {
    method: "PATCH",
    body: JSON.stringify({ id, ...input }),
  });
  return photo;
}

export async function deletePhoto(id: string): Promise<void> {
  await jsonFetch(`/api/photos?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Persists a new display order. Pass the complete list of photo ids in their new
 * global sequence — the server rewrites only the sidecars that actually moved.
 */
export async function reorderPhotos(ids: string[]): Promise<void> {
  await jsonFetch("/api/photos", {
    method: "PATCH",
    body: JSON.stringify({ order: ids }),
  });
}

// ---- Site content (reviews / team / projects) ------------------------------

/** Pass `fresh` in the admin to bypass the ~30s edge cache. */
export async function getContent(fresh = false): Promise<SiteContent> {
  const url = fresh ? `/api/content?t=${Date.now()}` : "/api/content";
  const body = await jsonFetch<Partial<SiteContent>>(url);
  return {
    reviews: Array.isArray(body.reviews) ? body.reviews : [],
    team: Array.isArray(body.team) ? body.team : [],
    projects: Array.isArray(body.projects) ? body.projects : [],
  };
}

/**
 * Replaces one content document wholesale. The array order IS the display order,
 * so this is also how reordering is saved.
 */
export async function saveContent<K extends keyof SiteContent>(
  doc: K,
  data: SiteContent[K],
): Promise<SiteContent[K]> {
  const body = await jsonFetch<Record<string, SiteContent[K]>>("/api/content", {
    method: "PUT",
    body: JSON.stringify({ doc, data }),
  });
  return body[doc];
}

/** Uploads a non-portfolio image (currently team portraits) and returns its url. */
export async function uploadImage(input: {
  dataBase64: string;
  contentType: string;
  prefix: "team";
}): Promise<string> {
  const { url } = await jsonFetch<{ url: string }>("/api/upload", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return url;
}

/**
 * Downscales + re-encodes an image to JPEG in the browser before upload:
 * keeps files small (fast uploads, less storage) and safely under the API's
 * request-body limit. Honours EXIF orientation so phone photos aren't sideways.
 */
export async function resizeImage(
  file: File,
  maxDim = 2000,
  quality = 0.82,
): Promise<{ dataBase64: string; contentType: string }> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Your browser can't process images here.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) throw new Error("Could not process that image.");

  return { dataBase64: await blobToBase64(blob), contentType: "image/jpeg" };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
