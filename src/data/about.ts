import { NEEDS_INPUT } from "./business";

/**
 * About section content.
 *
 * NOTE: builder names below are inferred from the supplied photo filenames
 * ("Anthony-Nato") — please confirm/correct `builders`, `bio`, and `longBio`.
 */
export interface TeamPhoto {
  src: string;
  alt: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  /** One-to-two line description shown under the name. */
  description: string;
  /**
   * Portrait photo. Drop the file in /public/team and set the path here.
   * Leave undefined to show a styled placeholder until the real photo exists.
   */
  photo?: string;
  alt: string;
}

// NOTE: no placeholder team members here any more (spec 08) — the /about
// "Meet the team" block renders only members entered in the admin, and stays
// hidden until some exist.

export const about = {
  /** Confirm the real names. */
  builders: NEEDS_INPUT("Anthony & Nato"),
  yearsExperience: "25",

  /** Short bio — used on the home About section (trimmed per spec 08). */
  bio: NEEDS_INPUT(
    "We're a local, hands-on team with more than 25 years of building across Canberra. Whether it's a renovation, an extension, or a brand-new home, you get honest advice, clear communication, and work we're proud to put our name on.",
  ),

  /** Expanded bio — /about page (trimmed per spec 08; draft, confirm with client). */
  longBio: [
    "ADN Builders is a local, family-run team that's been building across Canberra & the Capital Region for more than 25 years, a reputation grown on referrals and repeat clients.",
    "You deal with the builders directly. We manage the whole job and every trade, so you have one point of contact from the first site visit to handover, with honest quotes, tidy sites, and workmanship built to last.",
  ],

  /** How we work, start to finish — shown on the /about detail page. */
  process: [
    {
      title: "Consultation & quote",
      description:
        "We meet on site, talk through what you want to achieve, and provide a clear, itemised quote with no surprises.",
    },
    {
      title: "Design & approvals",
      description:
        "We help finalise plans and handle the council approvals and building certification your project needs.",
    },
    {
      title: "Build",
      description:
        "We schedule and coordinate every trade, keep the site tidy and safe, and keep you updated at each stage of the build.",
    },
    {
      title: "Handover & warranty",
      description:
        "We walk you through the finished work, sort any final details, and back it with our workmanship warranty.",
    },
  ] as ProcessStep[],

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
