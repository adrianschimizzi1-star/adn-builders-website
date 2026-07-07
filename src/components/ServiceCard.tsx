import type { Service } from "../data/services";
import { ArrowRight } from "lucide-react";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article className="group flex flex-col rounded-xl border border-white/10 bg-navy-900 p-6 transition-all hover:-translate-y-1 hover:border-accent-500/40 hover:bg-navy-800">
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
    </article>
  );
}
