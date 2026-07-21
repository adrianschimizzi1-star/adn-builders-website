import type { LucideIcon } from "lucide-react";
import { Hammer, House, Bath, Fence } from "lucide-react";
import type { GalleryCategory } from "./gallery";

export interface Service {
  id: string;
  title: string;
  /** Short blurb used on the home Services cards. */
  description: string;
  icon: LucideIcon;
  /**
   * Gallery category this service maps to — the Services detail page filters
   * the shared gallery manifest by this to show related project photos.
   */
  category: Exclude<GalleryCategory, "all">;
  /** Expanded copy shown on the /services detail page. */
  longDescription?: string;
  /** "What's included" bullets shown on the /services detail page. */
  included?: string[];
}

/**
 * The four services from the brief. Copy deliberately short and plain-spoken
 * (spec 08): show we're good at what we do without the marketing fluff.
 */
export const services: Service[] = [
  {
    id: "renovations",
    title: "Renovations & Extensions",
    description:
      "Single rooms to full extensions, planned well, built properly, finished to last.",
    icon: Hammer,
    category: "renovations",
    longDescription:
      "We handle renovations and extensions end to end: planning, approvals, trades, and the build itself. New work sits cleanly against old, the job runs to the plan we agreed, and you deal with one builder the whole way through.",
    // Capped at 4 (spec 06): dropped "Design and planning support" as the most
    // generic of the five.
    included: [
      "Structural alterations and second storeys",
      "Kitchen, living, and open-plan upgrades",
      "Council approvals and building certification",
      "Full project management to handover",
    ],
  },
  {
    id: "new-builds",
    title: "New Home Builds",
    description:
      "Your new home built from the ground up, with one point of contact the whole way.",
    icon: House,
    category: "new-builds",
    longDescription:
      "A new home is a big undertaking, so we keep it simple: one point of contact, a realistic schedule, and straight answers on where your money is best spent. The result is a solid, well-finished home, the standard we'd want for our own families.",
    // Capped at 4 (spec 06): dropped "Licensed trades coordinated on your
    // behalf" — implied by full end-to-end management.
    included: [
      "Fixed-price building contracts",
      "Site preparation, slab, and footings",
      "Full lock-up, fit-out, and finishing",
      "Handover, defects, and warranty support",
    ],
  },
  {
    id: "bathrooms",
    title: "Bathrooms",
    description:
      "Waterproofing, tiling, and fit-out done right the first time.",
    icon: Bath,
    category: "bathrooms",
    longDescription:
      "Bathrooms are small rooms with no margin for error. We strip out the old, waterproof properly, tile straight, and fit off cleanly, so it looks sharp on day one and stays watertight for years.",
    // Capped at 4 (spec 06): dropped "Underfloor heating (optional)" as the
    // only optional, non-core item.
    included: [
      "Waterproofing to Australian Standards",
      "Wall and floor tiling",
      "Vanities, tapware, and fixtures",
      "Plumbing and electrical by licensed trades",
    ],
  },
  {
    id: "outdoor",
    title: "Decks, Fencing & Outdoor",
    description:
      "Decks, pergolas, and fences built to handle Canberra's seasons.",
    icon: Fence,
    category: "outdoor",
    longDescription:
      "Canberra summers and frosts are hard on outdoor timber, so we build decks, pergolas, and fences to take it, properly detailed, correctly fixed, and finished to last. Outdoor spaces you'll actually use, year-round.",
    // Capped at 4 (spec 06): dropped "Weatherproof, low-maintenance finishes"
    // as the most generic marketing line.
    included: [
      "Merbau and composite decking",
      "Pergolas, patios, and carports",
      "Fencing, gates, and screens",
      "Retaining walls and landscaping structures",
    ],
  },
];
