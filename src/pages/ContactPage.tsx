import { business } from "../data/business";
import { QuoteForm } from "../sections/QuoteForm";
import { Reviews } from "../components/Reviews";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ContactPage() {
  usePageMeta(
    "Contact & Free Quote | ADN Builders",
    "Get in touch with ADN Builders for a free, no-obligation quote. Phone, email, service area, and opening hours for our Canberra building team.",
  );

  return (
    <>
      {/* Page header + opening hours */}
      <section className="fade-b-to-900 bg-navy-950 pb-4 pt-28 sm:pt-32">
        <div className="container-page max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            Contact us
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Get in touch with {business.name}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-navy-300 sm:text-lg">
            Request a free, no-obligation quote or ask us anything about your
            project. Prefer to talk it through? Call or email — the details are
            below.
          </p>
        </div>
      </section>

      {/* Reuse the existing quote form section (form + phone/email/area) as-is */}
      <QuoteForm />

      {/* Compact reuse of the reviews block */}
      <Reviews variant="compact" className="fade-t-from-900 bg-navy-950" />
    </>
  );
}
