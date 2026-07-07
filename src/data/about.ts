import { NEEDS_INPUT } from "./business";

/**
 * About section content.
 *
 * NOTE: builder names below are inferred from the supplied photo filenames
 * ("Anthony-Nato") — please confirm/correct `builders` and `bio`.
 */
export interface TeamPhoto {
  src: string;
  alt: string;
}

export const about = {
  /** Confirm the real names. */
  builders: NEEDS_INPUT("Anthony & Nato"),
  yearsExperience: "25",

  bio: NEEDS_INPUT(
    "ADN Builders is a local, hands-on team with more than 25 years of building experience across Canberra. From full renovations and extensions to brand-new family homes, we bring the same commitment to quality workmanship, honest advice, and clear communication to every project. Fully licensed and insured, we treat every build like it's our own.",
  ),

  photo: {
    src: "/team/adn-team.jpg",
    alt: "The ADN Builders team on site at a new home build in Canberra",
  } as TeamPhoto,

  highlights: [
    "25+ years of experience",
    "Licensed builder",
    "Fully insured",
    "Local & family-run",
  ],
};

/** Quick trust stats shown as a strip. */
export const stats = [
  { value: "25+", label: "Years of experience" },
  { value: "100%", label: "Licensed & insured" },
  { value: "Canberra", label: "Local & trusted" },
];
