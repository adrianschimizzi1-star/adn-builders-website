import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Service } from "../data/services";
import { projects } from "../data/gallery";
import { ProjectImage } from "./ProjectImage";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  // Representative project for this service's category — used as the clickable
  // "service image". Falls back to the styled placeholder until photos exist.
  const cover = projects.find((p) => p.category === service.category);

  return (
    <article className="reveal group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-navy-900 transition-all hover:-translate-y-1 hover:border-accent-500/40 hover:bg-navy-800">
      {cover && (
        // Clickable service image → deep-links to Projects, category pre-selected.
        <Link
          to={`/gallery?cat=${service.category}`}
          aria-label={`View ${service.title} projects`}
          className="relative block aspect-[16/10] overflow-hidden"
        >
          <ProjectImage
            project={cover}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover cue so the image reads as clickable */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-3.5 py-1.5 text-xs font-semibold text-navy-950">
              View projects
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </span>
        </Link>
      )}

      <div className="flex flex-1 flex-col p-6">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400 ring-1 ring-inset ring-accent-500/20">
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h3 className="text-lg font-bold text-white">{service.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-300">
          {service.description}
        </p>
        <a
          href="#quote"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
        >
          Enquire
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </a>
      </div>
    </article>
  );
}
