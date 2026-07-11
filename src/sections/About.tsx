import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, ArrowRight } from "lucide-react";
import { business } from "../data/business";
import { about } from "../data/about";
import { SectionHeading } from "../components/SectionHeading";
import { Button } from "../components/Button";

export function About() {
  return (
    <section
      id="about"
      className="fade-y-in-900 scroll-mt-20 bg-navy-950 py-16 sm:py-24"
    >
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        {/* Photo */}
        <div className="reveal relative">
          <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
            <img
              src={about.photo.src}
              alt={about.photo.alt}
              width={1800}
              height={1200}
              className="aspect-[3/2] w-full object-cover"
            />
          </div>

          {/* Experience badge */}
          <div className="absolute -left-3 -top-5 rounded-2xl bg-accent-500 px-5 py-3 text-navy-950 shadow-lg">
            <span className="block text-2xl font-extrabold leading-none">
              {about.yearsExperience}+
            </span>
            <span className="text-xs font-bold uppercase tracking-wide">
              Years experience
            </span>
          </div>
        </div>

        {/* Copy */}
        <div>
          <SectionHeading
            eyebrow="About us"
            title={
              <>
                The team behind {business.name}
              </>
            }
          />

          <p className="mt-6 text-base leading-relaxed text-navy-200 sm:text-lg">
            {about.bio}
          </p>

          {/* Credentials */}
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-navy-900 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  Licence
                </dt>
                <dd className="text-sm font-semibold text-white">
                  {business.licenceNumber}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-navy-900 p-4">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  Insurance
                </dt>
                <dd className="text-sm font-semibold text-white">
                  {business.fullyInsured ? "Fully insured" : "—"}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button to="/quote" size="lg">
              Book a Quote
            </Button>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
            >
              More about the team
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
