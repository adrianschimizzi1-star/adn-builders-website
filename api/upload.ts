import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "./_lib/auth.js";
import { putImage } from "./_lib/store.js";

/*
 * Authed image upload for content that isn't a portfolio photo (currently just
 * team portraits). Portfolio photos keep their own endpoint (/api/photos) because
 * they carry a metadata sidecar; these are plain images referenced by url from
 * content/team.json.
 */

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_PREFIXES = ["team"] as const;
type Prefix = (typeof ALLOWED_PREFIXES)[number];

// Raster only — no image/svg+xml (an SVG is an active document served inline
// from the Blob CDN). Reject unknown types rather than coercing the extension.
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (!isAuthed(req)) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const body = req.body ?? {};
    const prefix = body.prefix as Prefix;
    const dataBase64 =
      typeof body.dataBase64 === "string" ? body.dataBase64 : "";
    const contentType =
      typeof body.contentType === "string" ? body.contentType : "image/jpeg";
    const ext = IMAGE_TYPES[contentType];

    // Whitelist, not interpolation — otherwise `prefix` is a path-traversal hole.
    if (!ALLOWED_PREFIXES.includes(prefix)) {
      return res.status(400).json({ error: "Invalid upload target" });
    }
    if (!dataBase64) return res.status(400).json({ error: "Missing image data" });
    if (!ext) return res.status(400).json({ error: "Unsupported image type" });

    const buffer = Buffer.from(dataBase64, "base64");
    if (buffer.length === 0) return res.status(400).json({ error: "Empty image" });
    if (buffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: "Image too large" });
    }

    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const { url, pathname } = await putImage(
      `${prefix}/${id}.${ext}`,
      buffer,
      contentType,
    );
    return res.status(201).json({ url, pathname });
  } catch (err) {
    console.error("upload handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
