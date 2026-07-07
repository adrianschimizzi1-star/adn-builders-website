import { services } from "../data/services";
import { SectionHeading } from "../components/SectionHeading";
import { ServiceCard } from "../components/ServiceCard";

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-navy-950 py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="What we do"
          title="Services built around your project"
          intro="From first sketch to final finish, we handle the trades, timelines, and quality so you don't have to."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
