/**
 * All business facts live here (per architecture invariant #2).
 * Components must read from this file — never hardcode these values.
 *
 * ⚠️  Values wrapped in NEEDS_INPUT are placeholders — replace with real details.
 *     Search the src/data folder for "NEEDS_INPUT" to find them all.
 */

/** Marks a value that still needs the client's real content. */
export const NEEDS_INPUT = (placeholder: string) => placeholder;

export interface BusinessInfo {
  name: string;
  tagline: string;
  intro: string;
  serviceArea: string;
  phone: string;
  email: string;
  licenceNumber: string;
  fullyInsured: boolean;
  social: { instagram: string; facebook: string };
}

export const business: BusinessInfo = {
  name: "ADN Builders",
  tagline: "Quality renovations and new builds in Canberra",
  intro:
    "Licensed and fully insured, we bring craftsmanship and care to every renovation, extension, and new home across Canberra.",
  serviceArea: "Canberra & surrounding ACT",

  // --- Contact ---
  phone: NEEDS_INPUT("0400 000 000"), // click-to-call
  email: NEEDS_INPUT("hello@adnbuilders.com.au"),

  // --- Credentials ---
  licenceNumber: NEEDS_INPUT("ACT Builder Licence #000000"),
  fullyInsured: true,

  social: { instagram: "", facebook: "" },
};

/** Formspree endpoint id. Create a form at https://formspree.io and paste it. */
export const FORMSPREE_ID = NEEDS_INPUT("your-form-id"); // e.g. "xdorwkbz"

/** Convenience: a normalised tel: href. */
export const telHref = `tel:${business.phone.replace(/\s+/g, "")}`;
export const mailHref = `mailto:${business.email}`;
