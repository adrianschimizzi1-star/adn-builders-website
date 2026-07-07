import { ShieldCheck, BadgeCheck, Check, ArrowRight } from "lucide-react";
import { business } from "../data/business";
import { about } from "../data/about";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";

export default function AboutPage() {
  usePageMeta(
    "About Us | ADN Builders",
    "Meet the team behind ADN Builders — 25+ years of licensed, insured building experience in Canberra, and how we work from first call to handover.",
  );

  return (
    <>
      {/* Intro + photo + credentials */}
      <section className="bg-navy-950 pb-14 pt-28 sm:pt-32">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
              <span className="h-px w-6 bg-accent-500" />
              About us
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              The team behind {business.name}
            </h1>
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
            {/* Photo */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                <img
                  src={about.photo.src}
                  alt={about.photo.alt}
                  width={1800}
                  height={1200}
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
              <div className="absolute -left-3 -top-5 rounded-2xl bg-accent-500 px-5 py-3 text-navy-950 shadow-lg">
                <span className="block text-2xl font-extrabold leading-none">
                  {about.yearsExperience}+
                </span>
                <span className="text-xs font-bold uppercase tracking-wide">
                  Years experience
                </span>
              </div>
            </div>

            {/* Expanded bio */}
            <div className="space-y-4">
              {about.longBio.map((para, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-navy-200 sm:text-lg"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-navy-900 p-4">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-accent-400"
                aria-hidden
              />
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
              <BadgeCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-accent-400"
                aria-hidden
              />
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

          {/* Highlights */}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {about.highlights.map((h) => (
              <li
                key={h}
                className="inline-flex items-center gap-2 text-sm font-medium text-navy-100"
              >
                <Check className="h-4 w-4 text-accent-400" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we work */}
      <section className="bg-navy-900 py-16 sm:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
              <span className="h-px w-6 bg-accent-500" />
              How we work
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              From first call to final handover
            </h2>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.process.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-white/10 bg-navy-950 p-6"
              >
                <span className="text-sm font-extrabold text-accent-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-300">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <Button to="/contact" size="lg" className="mt-10">
            Get in touch
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </section>
    </>
  );
}
