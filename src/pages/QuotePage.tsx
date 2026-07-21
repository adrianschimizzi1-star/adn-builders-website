import { QuoteForm } from "../sections/QuoteForm";
import { Reviews } from "../components/Reviews";
import { usePageMeta } from "../hooks/usePageMeta";

/**
 * Book a Quote — the site's single conversion destination (spec 05, step 3).
 *
 * Supersedes the old /contact page: the quote form is the primary element, the
 * contact details (phone, email, service area) sit beside it in a secondary card
 * inside QuoteForm, and v2's compact reviews close the page. /contact redirects
 * here (see main.tsx) so old links and bookmarks never 404.
 */
export default function QuotePage() {
  usePageMeta(
    "Book a Quote | ADN Builders",
    "Book a free, no-obligation quote with ADN Builders. Licensed, insured builders serving Canberra & the Capital Region. Call, email, or send us your project details.",
  );

  return (
    <>
      {/* Page header */}
      <section className="fade-b-to-900 bg-navy-950 pb-4 pt-28 sm:pt-32">
        <div className="container-page max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            Book a quote
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Book a Quote
          </h1>
          <p className="mt-5 text-base leading-relaxed text-navy-300 sm:text-lg">
            Tell us about your project and we'll come back to you with a free,
            no-obligation quote. Prefer to talk it through? Call or email. The
            details are right below.
          </p>
        </div>
      </section>

      {/* Form (primary) + contact details card (secondary) */}
      <QuoteForm />

      {/* One featured quote instead of the 3-card grid (spec 08) — the card
          wall felt forced on the conversion page. */}
      <Reviews variant="featured" className="fade-t-from-900 bg-navy-950" />
    </>
  );
}
