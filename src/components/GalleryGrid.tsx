import { Images } from "lucide-react";
import type { GalleryTile } from "../data/gallery";
import { ProjectImage } from "./ProjectImage";

/**
 * Uniform tile grid — one tile per project (cover photo + a count badge) or per
 * loose photo. Tiles stay a fixed 4:3 so the grid never reflows; the *lightbox*
 * is where a photo's native aspect ratio is honoured.
 */
export function GalleryGrid({
  tiles,
  onSelect,
}: {
  tiles: GalleryTile[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {tiles.map((tile, i) => (
        <button
          key={tile.key}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={
            tile.photos.length > 1
              ? `View ${tile.title} (${tile.photos.length} photos)`
              : `View ${tile.title}`
          }
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-navy-800 ring-1 ring-white/5 focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <ProjectImage
            project={tile.cover}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />

          {tile.photos.length > 1 && (
            <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-navy-950/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
              <Images className="h-3.5 w-3.5" aria-hidden />
              {tile.photos.length}
            </span>
          )}

          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-3 text-left">
            <span className="block text-sm font-semibold text-white">
              {tile.title}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
