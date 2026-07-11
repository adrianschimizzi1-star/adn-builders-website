import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "./_lib/auth.js";
import {
  readDoc,
  writeDoc,
  CONTENT_DOCS,
  PHOTO_CATEGORIES,
  type ContentDoc,
  type PhotoCategory,
} from "./_lib/store.js";

/*
 * Editable site content: reviews, team, projects.
 *
 *   GET  /api/content            → { reviews, team, projects }   (public, one round trip)
 *   PUT  /api/content            → { doc: "reviews", data: [...] } (authed)
 *
 * PUT replaces the whole document — the admin holds the full list, so there is
 * no server-side read-modify-write and no chance of losing entries to Blob's
 * eventual consistency. The array order IS the display order.
 */

export interface Review {
  name: string;
  rating: number;
  quote: string;
}
export interface TeamMember {
  name: string;
  description: string;
  photo?: string;
  alt: string;
}
export interface Project {
  id: string;
  title: string;
  category: PhotoCategory;
  photoIds: string[];
}

// Bounds keep a compromised/buggy client from writing an unbounded blob.
const LIMITS = { reviews: 60, team: 24, projects: 200, photoIdsPerProject: 100 };

const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function parseReviews(input: unknown): Review[] | string {
  if (!Array.isArray(input)) return "reviews must be an array";
  if (input.length > LIMITS.reviews) return "too many reviews";
  const out: Review[] = [];
  for (const raw of input) {
    const r = raw as Partial<Review>;
    const name = str(r.name, 80);
    const quote = str(r.quote, 600);
    const rating = Math.round(Number(r.rating));
    if (!name) return "every review needs a name";
    if (!quote) return "every review needs a quote";
    if (!Number.isFinite(rating) || rating < 1 || rating > 5)
      return "rating must be 1–5";
    out.push({ name, rating, quote });
  }
  return out;
}

function parseTeam(input: unknown): TeamMember[] | string {
  if (!Array.isArray(input)) return "team must be an array";
  if (input.length > LIMITS.team) return "too many team members";
  const out: TeamMember[] = [];
  for (const raw of input) {
    const m = raw as Partial<TeamMember>;
    const name = str(m.name, 80);
    const description = str(m.description, 400);
    const photo = str(m.photo, 500);
    if (!name) return "every team member needs a name";
    // Only our own Blob CDN, or a same-site absolute path. The second char must
    // not be "/" or "\": a browser resolves "//evil.com" (and "/\evil.com", since
    // it normalises "\" to "/" for http(s)) to a *different origin*, so those must
    // NOT count as site-relative.
    const isOwnBlob = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(photo);
    const isSiteRelative = /^\/(?![/\\])/.test(photo);
    if (photo && !isOwnBlob && !isSiteRelative)
      return "team photo must be an uploaded image";
    out.push({
      name,
      description,
      photo: photo || undefined,
      alt: str(m.alt, 200) || `Portrait of ${name}`,
    });
  }
  return out;
}

function parseProjects(input: unknown): Project[] | string {
  if (!Array.isArray(input)) return "projects must be an array";
  if (input.length > LIMITS.projects) return "too many projects";
  const out: Project[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const p = raw as Partial<Project>;
    const id = str(p.id, 60);
    const title = str(p.title, 120);
    const category = p.category as PhotoCategory;
    if (!id) return "every project needs an id";
    if (seen.has(id)) return "duplicate project id";
    seen.add(id);
    if (!title) return "every project needs a title";
    if (!PHOTO_CATEGORIES.includes(category)) return "invalid project category";
    const photoIds = Array.isArray(p.photoIds)
      ? p.photoIds
          .filter((x): x is string => typeof x === "string")
          .slice(0, LIMITS.photoIdsPerProject)
      : [];
    out.push({ id, title, category, photoIds });
  }
  return out;
}

const PARSERS: Record<ContentDoc, (input: unknown) => unknown[] | string> = {
  reviews: parseReviews,
  team: parseTeam,
  projects: parseProjects,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const [reviews, team, projects] = await Promise.all([
        readDoc<Review[]>("reviews", []),
        readDoc<TeamMember[]>("team", []),
        readDoc<Project[]>("projects", []),
      ]);
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=300",
      );
      return res.status(200).json({ reviews, team, projects });
    }

    if (!isAuthed(req)) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (req.method === "PUT") {
      const body = req.body ?? {};
      const doc = body.doc as ContentDoc;
      if (!CONTENT_DOCS.includes(doc)) {
        return res.status(400).json({ error: "Unknown document" });
      }
      const parsed = PARSERS[doc](body.data);
      if (typeof parsed === "string") {
        return res.status(400).json({ error: parsed });
      }
      await writeDoc(doc, parsed);
      return res.status(200).json({ [doc]: parsed });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("content handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
