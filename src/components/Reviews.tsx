import { Star, ArrowRight } from "lucide-react";
import { reviews as fallbackReviews, googleReviewsUrl } from "../data/reviews";
import { Button } from "./Button";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "../hooks/useSiteContent";

function Stars({ rating, center = false }: { rating: number; center?: boolean }) {
  return (
    <div
      className={`flex gap-0.5 ${center ? "justify-center" : ""}`}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s < rating
              ? "fill-accent-400 text-accent-400"
              : "fill-navy-700 text-navy-700"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

/**
 * Reviews block (the only new component spec 06 authorises).
 *
 * `full`     — homepage: up to 4 cards + intro copy.
 * `compact`  — up to 3 cards, tighter header.
 * `featured` — /quote (spec 08): one strong quote as a quiet centred banner —
 *              social proof without a wall of cards on the conversion page.
 *
 * Reviews come from the admin (spec 05, step 7); the static placeholders in
 * `data/reviews.ts` show until the owner has entered real ones. The section
 * background + boundary-blend classes are passed in via `className` so the same
 * component can sit on either shade of the alternating layout. Card radius
 * (rounded-2xl) matches the /about team cards, per spec.
 */
export function Reviews({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact" | "featured";
  className?: string;
}) {
  const compact = variant === "compact";
  const { content } = useSiteContent();
  const source =
    content.reviews.length > 0 ? content.reviews : fallbackReviews;
  const items = compact ? source.slice(0, 3) : source.slice(0, 4);

  if (variant === "featured") {
    const review = source[0];
    if (!review) return null;
    return (
      <section id="reviews" className={`scroll-mt-20 py-14 sm:py-20 ${className}`}>
        <div className="container-page">
          <figure className="reveal mx-auto max-w-3xl text-center">
            <Stars rating={review.rating} center />
            <blockquote className="mt-5 text-xl font-medium leading-relaxed text-white sm:text-2xl">
              &ldquo;{review.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-navy-300">
              — {review.name}
            </figcaption>
            {googleReviewsUrl && (
              <a
                href={googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
              >
                Read more on Google
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            )}
          </figure>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className={`scroll-mt-20 py-16 sm:py-24 ${className}`}>
      <div className="container-page">
        {compact ? (
          <div className="reveal max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
              <span className="h-px w-6 bg-accent-500" />
              Reviews
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              What our clients say
            </h2>
          </div>
        ) : (
          <SectionHeading
            eyebrow="Reviews"
            title="What our clients say"
            intro="A few words from Canberra homeowners we've built and renovated for."
          />
        )}

        {items.length > 0 ? (
          <div
            className={`reveal-stagger mt-10 grid gap-6 ${
              compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {items.map((review, i) => (
              <figure
                key={i}
                className="reveal flex h-full flex-col rounded-2xl border border-white/10 bg-navy-900 p-6"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy-200">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-white">
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-navy-400">
            Reviews are on their way — check back soon.
          </p>
        )}

        {/* Shown once the owner supplies the Google reviews URL — no dead
            "#" link / blank tab while it's still a TODO. */}
        {googleReviewsUrl && (
          <div className="mt-8">
            <Button
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              Read more on Google
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
