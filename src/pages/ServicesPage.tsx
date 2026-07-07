import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { services } from "../data/services";
import { projects, type GalleryPhoto } from "../data/gallery";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ServicesPage() {
  usePageMeta(
    "Building Services in Canberra | ADN Builders",
    "Renovations & extensions, new home builds, bathrooms, and decks & outdoor — see what each ADN Builders service includes, with recent Canberra projects.",
  );

  // One shared lightbox for every service strip on the page.
  const [lb, setLb] = useState<{ items: GalleryPhoto[]; index: number } | null>(
    null,
  );

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
        const related = projects.filter((p) => p.category === service.category);
        return (
          <section
            key={service.id}
            id={service.id}
            className={`scroll-mt-20 py-14 sm:py-20 ${
              i % 2 === 0 ? "bg-navy-950" : "bg-navy-900"
            }`}
          >
            <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Copy */}
              <div>
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
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-400">
                  Recent {service.title.toLowerCase()} projects
                </h3>
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
