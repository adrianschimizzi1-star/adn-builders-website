/**
 * Project gallery manifest + filters.
 *
 * Photos live in /public/projects/ and are referenced by path. Drop images in
 * and add a `src`; entries without a `src` render a styled "Photo coming soon"
 * placeholder so the grid + lightbox stay previewable.
 *
 * Every entry carries descriptive alt text and a fixed aspect ratio (via the
 * grid) to prevent layout shift.
 */

export const galleryFilters = [
  { id: "all", label: "All Projects" },
  { id: "renovations", label: "Renovations & Extensions" },
  { id: "new-builds", label: "New Home Builds" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "outdoor", label: "Decks & Outdoor" },
  // Catch-all for images that aren't one of the four service categories.
  // Kept last so it reads as the fallback. Mirrored in api/_lib/store.ts —
  // the server validates uploads against its own PHOTO_CATEGORIES list.
  { id: "other", label: "Other" },
] as const;

export type GalleryCategory = (typeof galleryFilters)[number]["id"];

export type PhotoCategory = Exclude<GalleryCategory, "all">;

export interface GalleryPhoto {
  id: string;
  title: string;
  category: PhotoCategory;
  src?: string; // e.g. "/projects/kitchen-reno.jpg"
  alt: string;
}

/**
 * A project groups several photos of the same job. Managed in the admin and
 * stored in `content/projects.json`; `photoIds` is the single source of truth for
 * both membership *and* the order photos appear in the lightbox.
 */
export interface Project {
  id: string;
  title: string;
  category: PhotoCategory;
  photoIds: string[];
}

/**
 * What the gallery grid renders: one tile per project (its cover photo + the
 * whole set behind it), plus one tile per loose photo that belongs to no project.
 */
export interface GalleryTile {
  key: string;
  title: string;
  category: PhotoCategory;
  cover: GalleryPhoto;
  /** Every photo behind this tile, in display order. Always at least one. */
  photos: GalleryPhoto[];
}

/**
 * Collapses photos + projects into the tiles the grid renders.
 *
 * - `photoIds` pointing at a photo that no longer exists are skipped, so deleting
 *   a photo can never leave a broken reference (there is no server-side cascade —
 *   see the delete handler in api/photos.ts).
 * - A project whose photos have all been deleted disappears rather than rendering
 *   an empty tile.
 * - Tiles inherit the position of their earliest photo in `photos`, so the admin's
 *   drag-to-reorder drives tile order too.
 */
export function buildProjectTiles(
  photos: GalleryPhoto[],
  projects: Project[],
): GalleryTile[] {
  const byId = new Map(photos.map((p) => [p.id, p]));
  const rank = new Map(photos.map((p, i) => [p.id, i]));
  const claimed = new Set<string>();

  const projectTiles = projects.flatMap((project) => {
    const members = project.photoIds
      .map((id) => byId.get(id))
      .filter((p): p is GalleryPhoto => p !== undefined);
    if (members.length === 0) return [];
    members.forEach((p) => claimed.add(p.id));
    return [
      {
        key: `project:${project.id}`,
        title: project.title,
        category: project.category,
        cover: members[0],
        photos: members,
        rank: Math.min(...members.map((p) => rank.get(p.id) ?? Infinity)),
      },
    ];
  });

  const looseTiles = photos
    .filter((p) => !claimed.has(p.id))
    .map((p) => ({
      key: `photo:${p.id}`,
      title: p.title,
      category: p.category,
      cover: p,
      photos: [p],
      rank: rank.get(p.id) ?? Infinity,
    }));

  return [...projectTiles, ...looseTiles]
    .sort((a, b) => a.rank - b.rank)
    .map(({ rank: _rank, ...tile }) => tile);
}

/** Full-bleed hero background — the "best shot". Drop the photo at this path. */
export const heroImage = {
  src: "/projects/hero-bathroom.jpg",
  alt: "Dark, modern bathroom renovation by ADN Builders in Canberra featuring a freestanding stone bath",
};

/**
 * Static seed photos — the fallback when the admin/Blob backend has nothing (or
 * isn't reachable). Never imported by components directly: everything on the
 * public site goes through `usePhotos()` so there is exactly one image source.
 */
export const seedPhotos: GalleryPhoto[] = [
  {
    id: "p1",
    title: "Dark Ensuite Renovation",
    category: "bathrooms",
    alt: "Moody dark-tiled ensuite with a freestanding stone bath renovated by ADN Builders",
  },
  {
    id: "p2",
    title: "New Family Home",
    category: "new-builds",
    alt: "Newly built contemporary family home constructed by ADN Builders in Canberra",
  },
  {
    id: "p3",
    title: "Kitchen & Living Renovation",
    category: "renovations",
    alt: "Renovated open-plan kitchen and living area by ADN Builders in Canberra",
  },
  {
    id: "p4",
    title: "Merbau Entertaining Deck",
    category: "outdoor",
    alt: "Timber entertaining deck built by ADN Builders for a Canberra backyard",
  },
  {
    id: "p5",
    title: "Rear Home Extension",
    category: "renovations",
    alt: "Single-storey rear home extension with large glass doors by ADN Builders",
  },
  {
    id: "p6",
    title: "Main Bathroom Remodel",
    category: "bathrooms",
    alt: "Remodelled main bathroom with freestanding bath and custom vanity",
  },
];
