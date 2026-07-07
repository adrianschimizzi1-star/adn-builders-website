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

/** The four services from the brief. */
export const services: Service[] = [
  {
    id: "renovations",
    title: "Renovations & Extensions",
    description:
      "Transform and grow your home — from single-room refreshes to full extensions that add space, light, and lasting value.",
    icon: Hammer,
    category: "renovations",
    longDescription:
      "Whether you're reworking a tired floor plan or adding a whole new wing, we manage renovations and extensions end to end. We work with you (and your architect or designer, if you have one) to open up living spaces, bring in natural light, and make sure the new work sits seamlessly against the old. Every job is planned around your budget and how you actually live in the home.",
    included: [
      "Design and planning support",
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
      "Ground-up construction of quality homes, managed end to end with clear communication and a finish you'll be proud of.",
    icon: House,
    category: "new-builds",
    longDescription:
      "Building a new home is the biggest project most people take on, so we keep it clear and predictable from the first site meeting to the final walk-through. You get a single point of contact, a realistic schedule, and honest advice on where your money is best spent. The result is a solid, well-finished home built to the standards we'd want for our own families.",
    included: [
      "Fixed-price building contracts",
      "Site preparation, slab, and footings",
      "Full lock-up, fit-out, and finishing",
      "Licensed trades coordinated on your behalf",
      "Handover, defects, and warranty support",
    ],
  },
  {
    id: "bathrooms",
    title: "Bathrooms",
    description:
      "Beautiful, functional bathroom renovations — waterproofing, tiling, and fit-out handled by experienced trades.",
    icon: Bath,
    category: "bathrooms",
    longDescription:
      "A bathroom is small but unforgiving — get the waterproofing or fall wrong and you pay for it later. We handle the whole renovation with experienced trades, from stripping out the old room to the final silicone bead, so it looks sharp and stays watertight for the long haul.",
    included: [
      "Waterproofing to Australian Standards",
      "Wall and floor tiling",
      "Vanities, tapware, and fixtures",
      "Underfloor heating (optional)",
      "Plumbing and electrical by licensed trades",
    ],
  },
  {
    id: "outdoor",
    title: "Decks, Fencing & Outdoor",
    description:
      "Decks, pergolas, fencing, and outdoor living spaces designed for Canberra conditions and made to enjoy year-round.",
    icon: Fence,
    category: "outdoor",
    longDescription:
      "Canberra's summers and frosts are hard on outdoor timber, so we build decks, pergolas, and fences to handle it — properly detailed, correctly fixed, and finished to last. From an entertaining deck off the living room to a full backyard makeover, we design outdoor spaces you'll actually use through the seasons.",
    included: [
      "Merbau and composite decking",
      "Pergolas, patios, and carports",
      "Fencing, gates, and screens",
      "Retaining walls and landscaping structures",
      "Weatherproof, low-maintenance finishes",
    ],
  },
];
