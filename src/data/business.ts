/**
 * All business facts live here (per architecture invariant #2).
 * Components must read from this file — never hardcode these values.
 *
 * ⚠️  Values wrapped in NEEDS_INPUT are placeholders — replace with real details.
 *     Search the src/data folder for "NEEDS_INPUT" to find them all.
 */

/** Marks a value that still needs the client's real content. */
export const NEEDS_INPUT = (placeholder: string) => placeholder;

export interface OpeningHours {
  days: string;
  time: string;
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  intro: string;
  serviceArea: string;
  phone: string;
  email: string;
  licenceNumber: string;
  fullyInsured: boolean;
  /** Opening hours. Not currently rendered (the Opening Hours card was removed
   *  in spec 06); kept as a business fact per the data-layer invariant. */
  hours: OpeningHours[];
  social: { instagram: string; facebook: string };
}

export const business: BusinessInfo = {
  name: "ADN Builders",
  tagline: "Quality renovations and new builds in Canberra",
  intro:
    "Licensed and fully insured, we bring craftsmanship and care to every renovation, extension, and new home across Canberra.",
  serviceArea: "Canberra & the Capital Region",

  // --- Contact ---
  phone: "0417 424 408", // click-to-call
  email: "adnbuilders1@gmail.com",

  // --- Credentials ---
  licenceNumber: "ACT Builder Licence #20181053",
  fullyInsured: true,

  // --- Opening hours (confirm with client) ---
  hours: [
    { days: "Monday – Friday", time: "7:00am – 5:00pm" },
    { days: "Saturday", time: "By appointment" },
    { days: "Sunday", time: "Closed" },
  ],

  social: { instagram: "", facebook: "" },
};

/** Formspree endpoint id (https://formspree.io/f/mvzjybdn). */
export const FORMSPREE_ID = "mvzjybdn";

/** Convenience: a normalised tel: href. */
export const telHref = `tel:${business.phone.replace(/\s+/g, "")}`;
export const mailHref = `mailto:${business.email}`;
