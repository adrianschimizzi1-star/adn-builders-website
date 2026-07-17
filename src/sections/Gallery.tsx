import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  galleryFilters,
  type GalleryCategory,
  type GalleryTile,
} from "../data/gallery";
import { SectionHeading } from "../components/SectionHeading";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";
import { useGalleryTiles } from "../hooks/usePhotos";

export function Gallery() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  // The open tile is captured by value, not by index into `visible`: a late
  // photo/content fetch can rebuild `visible` under an open lightbox, and a
  // positional index would then retarget it to a different tile.
  const [openSet, setOpenSet] = useState<GalleryTile | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Same source as /gallery and /services — was the static seed, so admin
  // uploads never reached the home page (spec 05, step 6).
  const { tiles } = useGalleryTiles();

  const visible =
    filter === "all" ? tiles : tiles.filter((t) => t.category === filter);

  // Home shows at most six recent tiles (spec 08); the rest live on /gallery.
  // When there's more, the last row fades out into the "View all Projects" link.
  const shown = visible.slice(0, 6);
  const overflowing = visible.length > shown.length;

  function select(index: number) {
    setOpenSet(shown[index]);
    setPhotoIndex(0);
  }

  return (
    <section
      id="gallery"
      className="fade-y-in-950 scroll-mt-20 bg-navy-900 pb-16 pt-10 sm:py-24"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="Our work"
          title="Recent projects"
          intro="A selection of renovations, new builds, bathrooms, and outdoor spaces we've delivered around Canberra."
        />

        {/* Filter pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {galleryFilters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  setOpenSet(null);
                }}
                aria-pressed={active}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-500 text-navy-950"
                    : "bg-white/5 text-navy-200 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="reveal relative mt-8">
          <GalleryGrid tiles={shown} onSelect={select} />
          {/* The capped grid's last row eases out into the section background,
              leading the eye to the View-all link below. */}
          {overflowing && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-navy-900 via-navy-900/70 to-transparent"
            />
          )}
        </div>

        {visible.length === 0 && (
          <p className="mt-8 text-center text-navy-400">
            No projects in this category yet.
          </p>
        )}

        <div className={overflowing ? "-mt-2 text-center" : "mt-10 text-center"}>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
          >
            View all Projects
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* No "Want results like these?" CTA here any more (owner request,
            after spec 08) — /gallery keeps its copy. */}
      </div>

      <Lightbox
        items={openSet?.photos ?? []}
        index={openSet ? photoIndex : null}
        title={openSet?.title}
        onClose={() => setOpenSet(null)}
        onNavigate={setPhotoIndex}
      />
    </section>
  );
}
