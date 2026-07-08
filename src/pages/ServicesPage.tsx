import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { services } from "../data/services";
import { type GalleryPhoto } from "../data/gallery";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";
import { usePhotos } from "../hooks/usePhotos";

export default function ServicesPage() {
  usePageMeta(
    "Building Services in Canberra | ADN Builders",
    "Renovations & extensions, new home builds, bathrooms, and decks & outdoor — see what each ADN Builders service includes, with recent Canberra projects.",
  );

  // One shared lightbox for every service strip on the page.
  const [lb, setLb] = useState<{ items: GalleryPhoto[]; index: number } | null>(
    null,
  );

  // Live photos from the admin/Blob backend (falls back to the static seed).
  const { photos } = usePhotos();

  return (
    <>
      {/* Page header */}
      <section className="bg-navy-950 pb-8 pt-28 sm:pt-32">
        <div className="container-page max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            What we do
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Our building services
          </h1>
          <p className="mt-5 text-base leading-relaxed text-navy-300 sm:text-lg">
            From first sketch to final finish, ADN Builders handles the trades,
            timelines, and quality across every kind of residential project in
            Canberra. Here's what each service covers — with recent work to match.
          </p>
        </div>
      </section>

      {/* Per-service detail blocks */}
      {services.map((service, i) => {
        const Icon = service.icon;
        const related = photos.filter((p) => p.category === service.category);
        // Soft boundary blend. Blocks alternate navy-950 / navy-900; the header
        // above is navy-950 and the footer below is navy-950, so:
        //   • block 0 (navy-950) only needs to ease its bottom into block 1;
        //   • every navy-900 block is flanked by navy-950 on both sides;
        //   • every later navy-950 block is flanked by navy-900 on both sides.
        // (Assumes an even service count, which the four-service brief holds.)
        const blend =
          i === 0
            ? "fade-b-to-900"
            : i % 2 === 1
              ? "fade-y-in-950"
              : "fade-y-in-900";
        return (
          <section
            key={service.id}
            id={service.id}
            className={`${blend} scroll-mt-20 py-14 sm:py-20 ${
              i % 2 === 0 ? "bg-navy-950" : "bg-navy-900"
            }`}
          >
            <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Copy */}
              <div className="reveal">
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400 ring-1 ring-inset ring-accent-500/20">
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {service.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-navy-200">
                  {service.longDescription ?? service.description}
                </p>

                {service.included && (
                  <>
                    <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy-400">
                      What's included
                    </h3>
                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {service.included.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-navy-200"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-accent-400"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <Button to="/contact" className="mt-8">
                  Enquire about this service
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>

              {/* Related gallery strip */}
              <div className="reveal">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
                    Recent {service.title.toLowerCase()} projects
                  </h3>
                  {/* Deep-links to Projects with this category pre-selected */}
                  <Link
                    to={`/gallery?cat=${service.category}`}
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-accent-400 transition-colors hover:text-accent-300"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
                {related.length > 0 ? (
                  <GalleryGrid
                    photos={related}
                    onSelect={(index) => setLb({ items: related, index })}
                  />
                ) : (
                  <p className="text-sm text-navy-400">
                    Project photos coming soon.
                  </p>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <Lightbox
        items={lb?.items ?? []}
        index={lb ? lb.index : null}
        onClose={() => setLb(null)}
        onNavigate={(index) =>
          setLb((cur) => (cur ? { ...cur, index } : cur))
        }
      />
    </>
  );
}
