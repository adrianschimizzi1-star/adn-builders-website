import type { GalleryPhoto } from "../data/gallery";
import { ImageIcon } from "lucide-react";

// Exhaustive over the category union — adding a category to `galleryFilters`
// without a gradient here is a type error, not a runtime `undefined` class.
const gradients: Record<GalleryPhoto["category"], string> = {
  renovations: "from-accent-500 via-accent-700 to-navy-900",
  "new-builds": "from-navy-500 via-navy-700 to-navy-950",
  bathrooms: "from-navy-600 via-navy-800 to-navy-950",
  outdoor: "from-accent-600 via-navy-700 to-navy-950",
  other: "from-navy-700 via-navy-800 to-navy-950",
};

/**
 * Renders the real photo when `project.src` is set, otherwise a styled
 * placeholder so the grid + lightbox are previewable before photos are added.
 *
 * `cover`  (default) — fills its container, cropped. Used by the uniform grid tiles.
 * `!cover`           — **intrinsic sizing**: the element takes the photo's own
 *                      width/height, so a portrait stays portrait and any
 *                      `rounded-*` in `className` hugs the real image edges
 *                      rather than a letterboxed box. The caller supplies the
 *                      cap (e.g. `max-h-[72svh]`); deliberately no `max-h-full`
 *                      here, since an equal-specificity base class would fight
 *                      the caller's cap depending on stylesheet order.
 */
export function ProjectImage({
  project,
  cover = true,
  className = "",
}: {
  project: GalleryPhoto;
  cover?: boolean;
  className?: string;
}) {
  if (project.src) {
    return (
      <img
        src={project.src}
        alt={project.alt}
        loading="lazy"
        decoding="async"
        className={`${cover ? "h-full w-full object-cover" : "h-auto w-auto max-w-full object-contain"} ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={project.alt}
      className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${gradients[project.category]} p-6 text-center text-white/90 ${
        // Placeholders have no intrinsic size — give the non-cover (lightbox)
        // variant a box, or it collapses to zero height.
        cover ? "h-full w-full" : "aspect-[4/3] w-full max-w-2xl"
      } ${className}`}
    >
      <ImageIcon className="h-8 w-8 opacity-90" strokeWidth={1.5} aria-hidden />
      <span className="text-sm font-semibold">{project.title}</span>
      <span className="text-xs uppercase tracking-wide opacity-70">
        Photo coming soon
      </span>
    </div>
  );
}
