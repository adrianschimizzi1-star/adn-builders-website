import { NEEDS_INPUT } from "./business";

/**
 * Manual, static reviews (spec 06). We deliberately do NOT embed a live Google
 * widget or call any Google API — these are hand-entered.
 *
 * TODO: replace with real reviews once collected, and set `googleReviewsUrl`
 * to ADN's actual Google Business reviews page. Placeholders below are wrapped
 * in NEEDS_INPUT so they're easy to find.
 */
export interface Review {
  /** Reviewer's first name. */
  name: string;
  /** Star rating out of 5. */
  rating: number;
  /** Short quote. */
  quote: string;
}

export const reviews: Review[] = [
  {
    name: NEEDS_INPUT("Reviewer one"),
    rating: 5,
    quote: NEEDS_INPUT(
      "Short, genuine quote from a happy Canberra client about the quality of ADN Builders' work.",
    ),
  },
  {
    name: NEEDS_INPUT("Reviewer two"),
    rating: 5,
    quote: NEEDS_INPUT(
      "A second placeholder review. Replace with a real testimonial once collected.",
    ),
  },
  {
    name: NEEDS_INPUT("Reviewer three"),
    rating: 5,
    quote: NEEDS_INPUT(
      "A third placeholder review. Replace with a real testimonial once collected.",
    ),
  },
  {
    name: NEEDS_INPUT("Reviewer four"),
    rating: 5,
    quote: NEEDS_INPUT(
      "A fourth placeholder review. Replace with a real testimonial once collected.",
    ),
  },
];

/**
 * ADN's Google Business reviews page — the "Read more on Google" button.
 * TODO: owner supplies the real URL (leave blank until then; the button falls
 * back to "#" so nothing breaks).
 */
export const googleReviewsUrl = NEEDS_INPUT("");
