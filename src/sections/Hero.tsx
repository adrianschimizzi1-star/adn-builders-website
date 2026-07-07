import { useState } from "react";
import { Phone, ArrowRight, ShieldCheck, MapPin, Award } from "lucide-react";
import { business, telHref } from "../data/business";
import { heroImage } from "../data/gallery";
import { about } from "../data/about";
import { Button } from "../components/Button";

export function Hero() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section id="home" className="relative isolate overflow-hidden bg-navy-950">
      {/* Background photo — hides itself if the file isn't there yet */}
      {imgOk && (
        <img
          src={heroImage.src}
          alt=""
          aria-hidden
          fetchPriority="high"
          onError={() => setImgOk(false)}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      {/* Dark fallback when no photo present */}
      {!imgOk && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-800 via-navy-950 to-black" />
      )}

      {/* Legibility overlays — kept just dark enough behind the (left/bottom)
          text for AA contrast, but ~20% lighter than before so the photo reads
          clearly, especially through the centre and right where there's no copy. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/90 via-navy-950/65 to-navy-950/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-navy-950/55" />
      {/* Warm accent glow */}
      <div
        className="pointer-events-none absolute -right-20 top-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent-500/15 blur-3xl"
        aria-hidden
      />

      <div className="container-page relative flex min-h-[100svh] flex-col justify-center py-28">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-300 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
          {business.serviceArea}
        </p>

        <h1 className="max-w-3xl">
          <span className="mb-3 block text-base font-bold uppercase tracking-[0.2em] text-accent-400">
            {business.name}
          </span>
          <span className="block text-4xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            {business.tagline}
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
          {business.intro}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href="#quote" size="lg">
            Get a Free Quote
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
          <Button href={telHref} size="lg" variant="outline">
            <Phone className="h-5 w-5" aria-hidden />
            Call us
          </Button>
        </div>

        {/* Trust strip */}
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-navy-200">
          <li className="inline-flex items-center gap-2">
            <Award className="h-5 w-5 text-accent-400" aria-hidden />
            {about.yearsExperience}+ years experience
          </li>
          <li className="inline-flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-400" aria-hidden />
            Licensed &amp; fully insured
          </li>
          <li className="inline-flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent-400" aria-hidden />
            {business.serviceArea}
          </li>
        </ul>
      </div>
    </section>
  );
}
