/*
 * Image constraints shared by the two upload endpoints (/api/photos and
 * /api/upload). Keeping them in one place means a new raster format or a
 * size-limit change can't be applied to one handler and forgotten in the other.
 */

// Guard against oversized payloads. Client-side resize keeps real uploads far
// below this (and below Vercel's ~4.5MB request-body limit).
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

// Raster formats only. Notably excludes image/svg+xml — an SVG is an active
// document (can carry <script>) and the Blob CDN serves it inline, so it must
// never be storable even though it matches a naive `image/*` check. Reject
// unknown types rather than coercing an extension.
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
