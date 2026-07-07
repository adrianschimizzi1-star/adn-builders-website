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
] as const;

export type GalleryCategory = (typeof galleryFilters)[number]["id"];

export interface GalleryPhoto {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, "all">;
  src?: string; // e.g. "/projects/kitchen-reno.jpg"
  alt: string;
}

/** Full-bleed hero background — the "best shot". Drop the photo at this path. */
export const heroImage = {
  src: "/projects/hero-bathroom.jpg",
  alt: "Dark, modern bathroom renovation by ADN Builders in Canberra featuring a freestanding stone bath",
};

export const projects: GalleryPhoto[] = [
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
