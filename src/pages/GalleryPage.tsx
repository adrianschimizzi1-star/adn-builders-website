import { useState } from "react";
import {
  projects,
  galleryFilters,
  type GalleryCategory,
} from "../data/gallery";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";
import { usePageMeta } from "../hooks/usePageMeta";

export default function GalleryPage() {
  usePageMeta(
    "Project Gallery | ADN Builders",
    "Browse renovations, new builds, bathrooms, and outdoor projects completed by ADN Builders across Canberra.",
  );

  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visible =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category === filter);

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
                  onClick={() => setFilter(f.id)}
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
            <GalleryGrid photos={visible} onSelect={setActiveIndex} />
          </div>

          {visible.length === 0 && (
            <p className="mt-8 text-center text-navy-400">
              No projects in this category yet.
            </p>
          )}
        </div>
      </section>

      <Lightbox
        items={visible}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
