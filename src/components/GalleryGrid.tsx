import type { GalleryPhoto } from "../data/gallery";
import { ProjectImage } from "./ProjectImage";

export function GalleryGrid({
  photos,
  onSelect,
}: {
  photos: GalleryPhoto[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {photos.map((project, i) => (
        <button
          key={project.id}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`View ${project.title}`}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-navy-800 ring-1 ring-white/5 focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <ProjectImage
            project={project}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-3 text-left">
            <span className="block text-sm font-semibold text-white">
              {project.title}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
