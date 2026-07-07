import type { LucideIcon } from "lucide-react";
import { Hammer, House, Bath, Fence } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** The four services from the brief. */
export const services: Service[] = [
  {
    id: "renovations",
    title: "Renovations & Extensions",
    description:
      "Transform and grow your home — from single-room refreshes to full extensions that add space, light, and lasting value.",
    icon: Hammer,
  },
  {
    id: "new-builds",
    title: "New Home Builds",
    description:
      "Ground-up construction of quality homes, managed end to end with clear communication and a finish you'll be proud of.",
    icon: House,
  },
  {
    id: "bathrooms",
    title: "Bathrooms",
    description:
      "Beautiful, functional bathroom renovations — waterproofing, tiling, and fit-out handled by experienced trades.",
    icon: Bath,
  },
  {
    id: "outdoor",
    title: "Decks, Fencing & Outdoor",
    description:
      "Decks, pergolas, fencing, and outdoor living spaces designed for Canberra conditions and made to enjoy year-round.",
    icon: Fence,
  },
];
