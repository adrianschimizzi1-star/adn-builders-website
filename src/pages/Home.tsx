import { Hero } from "../sections/Hero";
import { Services } from "../sections/Services";
import { Gallery } from "../sections/Gallery";
import { About } from "../sections/About";
import { Reviews } from "../components/Reviews";
import { QuoteForm } from "../sections/QuoteForm";
import { usePageMeta } from "../hooks/usePageMeta";

/**
 * Home — the complete one-page overview, unchanged in content:
 * Hero · Services · Projects · About · Quote. The Navbar and Footer are
 * provided by the shared Layout; each home section links through to its
 * dedicated detail page.
 */
export default function Home() {
  usePageMeta(
    "ADN Builders – Builder in Canberra | Renovations, New Builds & Decks",
    "ADN Builders is a licensed, fully insured builder in Canberra specialising in renovations, extensions, new home builds, bathrooms, and decks. Get a free quote today.",
  );

  return (
    <>
      <Hero />
      <Services />
      <Gallery />
      <About />
      <Reviews className="fade-t-from-950 border-t border-white/10 bg-navy-900 sm:border-t-0" />
      <QuoteForm />
    </>
  );
}
