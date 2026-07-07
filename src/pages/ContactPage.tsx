import { Clock } from "lucide-react";
import { business } from "../data/business";
import { QuoteForm } from "../sections/QuoteForm";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ContactPage() {
  usePageMeta(
    "Contact & Free Quote | ADN Builders",
    "Get in touch with ADN Builders for a free, no-obligation quote. Phone, email, service area, and opening hours for our Canberra building team.",
  );

  return (
    <>
      {/* Page header + opening hours */}
      <section className="bg-navy-950 pb-4 pt-28 sm:pt-32">
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

          {/* Opening hours */}
          <div className="mt-8 rounded-xl border border-white/10 bg-navy-900 p-5 sm:max-w-md">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy-400">
              <Clock className="h-4 w-4 text-accent-400" aria-hidden />
              Opening hours
            </p>
            <dl className="mt-3 space-y-1.5 text-sm">
              {business.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4">
                  <dt className="text-navy-200">{h.days}</dt>
                  <dd className="font-medium text-white">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Reuse the existing quote form section (form + phone/email/area) as-is */}
      <QuoteForm />
    </>
  );
}
