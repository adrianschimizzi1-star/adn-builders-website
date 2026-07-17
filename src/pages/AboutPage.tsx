import { User, ArrowRight } from "lucide-react";
import { business } from "../data/business";
import { about } from "../data/about";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContent } from "../hooks/useSiteContent";

export default function AboutPage() {
  usePageMeta(
    "About Us | ADN Builders",
    "Meet the team behind ADN Builders — 25+ years of licensed, insured building experience in Canberra, and how we work from first call to handover.",
  );

  // Team cards come from the admin (spec 05, step 7). No placeholder fallback:
  // the whole "Meet the team" block stays hidden until real members are entered
  // (spec 08).
  const { content } = useSiteContent();
  const team = content.team;

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

          {/* Team grid — admin-entered members only; hidden until some exist
              (spec 08). Centred flex (not a grid) so a partial row — say three
              members — sits centred instead of leaving a hole. */}
          {team.length > 0 && (
          <div className="mt-14">
            <p className="text-sm font-semibold uppercase tracking-wide text-navy-400">
              Meet the team
            </p>
            <div className="reveal-stagger mt-6 flex flex-wrap justify-center gap-6">
              {team.map((member, i) => (
                <article
                  // Owner-entered names aren't guaranteed unique.
                  key={`${member.name}-${i}`}
                  className="reveal group w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-navy-900 transition-colors hover:border-accent-500/40 sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
                >
                  <div className="aspect-[4/5] w-full overflow-hidden bg-navy-800">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={member.alt}
                        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 text-navy-300"
                      >
                        <User
                          className="h-9 w-9 opacity-80"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white">
                      {member.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-300">
                      {member.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* How we work */}
      <section className="fade-y-in-950 bg-navy-900 py-16 sm:py-24">
        <div className="container-page">
          <div className="reveal max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-400">
              <span className="h-px w-6 bg-accent-500" />
              How we work
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              From first call to final handover
            </h2>
          </div>

          <ol className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.process.map((step, i) => (
              <li
                key={step.title}
                className="reveal rounded-xl border border-white/10 bg-navy-950 p-6"
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

          <Button to="/quote" size="lg" className="mt-10">
            Book a Quote
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </section>
    </>
  );
}
