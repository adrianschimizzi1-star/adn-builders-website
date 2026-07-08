import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "./_lib/auth";
import {
  readManifest,
  writeManifest,
  putImage,
  deleteImage,
  PHOTO_CATEGORIES,
  type PhotoCategory,
  type PhotoEntry,
} from "./_lib/store";

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
      const photos = await readManifest();
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

      const entries = await readManifest();
      entries.unshift(entry);
      await writeManifest(entries);
      return res.status(201).json({ photo: entry });
    }

    if (req.method === "DELETE") {
      const id =
        typeof req.query.id === "string"
          ? req.query.id
          : typeof req.body?.id === "string"
            ? req.body.id
            : "";
      if (!id) return res.status(400).json({ error: "Missing id" });

      const entries = await readManifest();
      const entry = entries.find((e) => e.id === id);
      if (!entry) return res.status(404).json({ error: "Photo not found" });

      // Remove the image first, then the manifest record. If the image delete
      // fails we still drop the record so it disappears from the gallery.
      try {
        await deleteImage(entry.url);
      } catch {
        /* best-effort */
      }
      await writeManifest(entries.filter((e) => e.id !== id));
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("photos handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
