import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  galleryFilters,
  type GalleryCategory,
  type GalleryTile,
} from "../data/gallery";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";
import { useGalleryTiles } from "../hooks/usePhotos";

/** Coerce a `?cat=` value to a known filter id, falling back to "all". */
function toCategory(value: string | null): GalleryCategory {
  return galleryFilters.some((f) => f.id === value)
    ? (value as GalleryCategory)
    : "all";
}

export default function GalleryPage() {
  usePageMeta(
    "Project Gallery | ADN Builders",
    "Browse renovations, new builds, bathrooms, and outdoor projects completed by ADN Builders across Canberra.",
  );

  // Deep link support: Services images link here as /gallery?cat=<category>.
  // Read the param for the initial filter (so it's applied on direct load /
  // hard refresh, not just on click) and keep it in sync if the param changes.
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get("cat");
  const [filter, setFilter] = useState<GalleryCategory>(() =>
    toCategory(catParam),
  );
  // Captured by value (see Gallery.tsx): a late fetch can rebuild `visible`
  // under an open lightbox, so a positional index would retarget it.
  const [openSet, setOpenSet] = useState<GalleryTile | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Live photos + projects from the admin/Blob backend (falls back to the seed).
  const { tiles } = useGalleryTiles();

  useEffect(() => {
    setFilter(toCategory(catParam));
    setOpenSet(null);
  }, [catParam]);

  const visible =
    filter === "all" ? tiles : tiles.filter((t) => t.category === filter);

  return (
    <>
      {/* Page header */}
      <section className="bg-navy-950 pb-8 pt-28 sm:pt-32">
        <div className="container-page max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            Our work
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Project gallery
          </h1>
          <p className="mt-5 text-base leading-relaxed text-navy-300 sm:text-lg">
            Renovations, new builds, bathrooms, and outdoor spaces we've
            delivered around Canberra. Filter by type, and click any project to
            see it larger.
          </p>
        </div>
      </section>

      {/* Filterable grid */}
      <section className="bg-navy-950 pb-20 sm:pb-28">
        <div className="container-page">
          <div className="flex flex-wrap gap-2">
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

          <div className="mt-8">
            <GalleryGrid
              tiles={visible}
              onSelect={(i) => {
                setOpenSet(visible[i]);
                setPhotoIndex(0);
              }}
            />
          </div>

          {visible.length === 0 && (
            <p className="mt-8 text-center text-navy-400">
              No projects in this category yet.
            </p>
          )}

          {/* Conversion CTA — mirrors the home Projects section. Inlined rather
              than extracted: spec 05 authorises no new shared components. */}
          <div className="reveal mt-12 flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-navy-900 px-6 py-8 text-center sm:flex-row sm:justify-between sm:gap-8 sm:text-left">
            <p className="text-lg font-semibold text-white sm:text-xl">
              Want results like these?
            </p>
            <Button to="/quote" size="lg" className="shrink-0">
              Book a Quote
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      <Lightbox
        items={openSet?.photos ?? []}
        index={openSet ? photoIndex : null}
        title={openSet?.title}
        onClose={() => setOpenSet(null)}
        onNavigate={setPhotoIndex}
      />
    </>
  );
}
