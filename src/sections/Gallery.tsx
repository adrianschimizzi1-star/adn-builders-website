import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { projects, galleryFilters, type GalleryCategory } from "../data/gallery";
import { SectionHeading } from "../components/SectionHeading";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";

export function Gallery() {
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visible =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category === filter);

  return (
    <section
      id="gallery"
      className="fade-y-in-950 scroll-mt-20 bg-navy-900 py-16 sm:py-24"
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

        <div className="reveal mt-8">
          <GalleryGrid photos={visible} onSelect={setActiveIndex} />
        </div>

        {visible.length === 0 && (
          <p className="mt-8 text-center text-navy-400">
            No projects in this category yet.
          </p>
        )}

        <div className="mt-10">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
          >
            View all Projects
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <Lightbox
        items={visible}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </section>
  );
}
