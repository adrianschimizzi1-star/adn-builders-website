import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "./_lib/auth.js";
import {
  listPhotos,
  readPhoto,
  writePhoto,
  putImage,
  deletePhotoBlobs,
  PHOTO_CATEGORIES,
  type PhotoCategory,
  type PhotoEntry,
} from "./_lib/store.js";

// Guard against oversized payloads. Client-side resize keeps real uploads far
// below this (and below Vercel's ~4.5MB request-body limit).
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function newId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function extFor(contentType: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // ---- Public read: the live gallery list ------------------------------
    if (req.method === "GET") {
      const photos = await listPhotos();
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=300",
      );
      return res.status(200).json({ photos });
    }

    // ---- Everything below mutates and requires a valid session -----------
    if (!isAuthed(req)) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      const dataBase64 =
        typeof body.dataBase64 === "string" ? body.dataBase64 : "";
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const category = body.category as PhotoCategory;
      const alt = typeof body.alt === "string" ? body.alt.trim() : "";
      const contentType =
        typeof body.contentType === "string" &&
        body.contentType.startsWith("image/")
          ? body.contentType
          : "image/jpeg";

      if (!dataBase64) return res.status(400).json({ error: "Missing image data" });
      if (!title) return res.status(400).json({ error: "Missing title" });
      if (!PHOTO_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      const buffer = Buffer.from(dataBase64, "base64");
      if (buffer.length === 0) return res.status(400).json({ error: "Empty image" });
      if (buffer.length > MAX_IMAGE_BYTES) {
        return res.status(413).json({ error: "Image too large" });
      }

      const id = newId();
      const { url, pathname } = await putImage(
        `projects/${id}.${extFor(contentType)}`,
        buffer,
        contentType,
      );

      const entry: PhotoEntry = {
        id,
        title,
        category,
        alt: alt || title,
        url,
        pathname,
        createdAt: Date.now(),
      };
      await writePhoto(entry);
      return res.status(201).json({ photo: entry });
    }

    if (req.method === "PATCH") {
      const body = req.body ?? {};
      const id = typeof body.id === "string" ? body.id : "";
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const category = body.category as PhotoCategory;
      const alt = typeof body.alt === "string" ? body.alt.trim() : "";

      if (!id) return res.status(400).json({ error: "Missing id" });
      if (!title) return res.status(400).json({ error: "Missing title" });
      if (!PHOTO_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }

      const existing = await readPhoto(id);
      if (!existing) return res.status(404).json({ error: "Photo not found" });

      // Metadata-only edit — the stored image (url/pathname) is untouched.
      const updated: PhotoEntry = { ...existing, title, category, alt: alt || title };
      await writePhoto(updated);
      return res.status(200).json({ photo: updated });
    }

    if (req.method === "DELETE") {
      const id =
        typeof req.query.id === "string"
          ? req.query.id
          : typeof req.body?.id === "string"
            ? req.body.id
            : "";
      if (!id) return res.status(400).json({ error: "Missing id" });

      const existing = await readPhoto(id);
      if (!existing) return res.status(404).json({ error: "Photo not found" });

      await deletePhotoBlobs(existing);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("photos handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
