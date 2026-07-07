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

/**
 * The team grid on the /about page.
 *
 * TODO: replace — the owner will supply four real team members (names,
 * one-to-two line descriptions, and portrait photos). Photos look best as a
 * consistent 4:5 portrait; drop them in /public/team and set each `photo`
 * (undefined renders a placeholder meanwhile). Names/descriptions below are
 * placeholders wrapped in NEEDS_INPUT so they're easy to find.
 */
export const team: TeamMember[] = [
  {
    name: NEEDS_INPUT("Team member one"),
    description: NEEDS_INPUT(
      "Role / title — one to two lines on what they do and the experience they bring.",
    ),
    alt: "Portrait of an ADN Builders team member",
  },
  {
    name: NEEDS_INPUT("Team member two"),
    description: NEEDS_INPUT(
      "Role / title — one to two lines on what they do and the experience they bring.",
    ),
    alt: "Portrait of an ADN Builders team member",
  },
  {
    name: NEEDS_INPUT("Team member three"),
    description: NEEDS_INPUT(
      "Role / title — one to two lines on what they do and the experience they bring.",
    ),
    alt: "Portrait of an ADN Builders team member",
  },
  {
    name: NEEDS_INPUT("Team member four"),
    description: NEEDS_INPUT(
      "Role / title — one to two lines on what they do and the experience they bring.",
    ),
    alt: "Portrait of an ADN Builders team member",
  },
];

export const about = {
  /** Confirm the real names. */
  builders: NEEDS_INPUT("Anthony & Nato"),
  yearsExperience: "25",

  /** Short bio — used on the home About section. */
  bio: NEEDS_INPUT(
    "ADN Builders is a local, hands-on team with more than 25 years of building experience across Canberra. From full renovations and extensions to brand-new family homes, we bring the same commitment to quality workmanship, honest advice, and clear communication to every project. Fully licensed and insured, we treat every build like it's our own.",
  ),

  /** Expanded bio — used on the /about detail page (draft; confirm with client). */
  longBio: [
    "ADN Builders is a local, family-run building team that has been working across Canberra and the Capital Region for more than 25 years. What started as a small operation has grown on the back of referrals and repeat clients — the kind of reputation you only earn by turning up, doing the work properly, and standing behind it.",
    "We keep our projects deliberately hands-on. You deal directly with the builders, not a call centre, so decisions are made quickly and nothing gets lost between trades. From renovations and extensions to complete new homes, bathrooms, and outdoor spaces, we manage the whole job and coordinate every trade so you have a single point of responsibility.",
    "We're fully licensed and insured, and we hold ourselves to the standard we'd want in our own homes. Honest quotes, clear timelines, tidy sites, and workmanship built to last — that's the whole promise.",
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
