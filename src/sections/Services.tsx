import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "../data/services";
import { SectionHeading } from "../components/SectionHeading";
import { ServiceCard } from "../components/ServiceCard";
import { useGalleryTiles } from "../hooks/usePhotos";

export function Services() {
  // Tiles are resolved once here and handed down, rather than each ServiceCard
  // reaching for them: one source, one fetch (spec 05, step 6).
  const { tiles } = useGalleryTiles();

  return (
    <section id="services" className="scroll-mt-20 border-t border-white/10 bg-navy-950 pb-10 pt-16 sm:border-t-0 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="What we do"
          title="Services built around your project"
          intro="From first sketch to final finish, we handle the trades, timelines, and quality so you don't have to."
        />

        <div className="reveal-stagger mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              // Representative image for the service, taken from the same tiles
              // the Projects grid renders — so its category always matches the
              // category its click deep-links to.
              cover={tiles.find((t) => t.category === service.category)?.cover}
            />
          ))}
        </div>

        {/* Tighter on mobile (spec 08): this link + the section paddings were
            stacking into a big dead zone before the "Our work" heading. */}
        <div className="mt-8 sm:mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
          >
            View all Services
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
