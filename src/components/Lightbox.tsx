import { useEffect } from "react";
import type { GalleryPhoto } from "../data/gallery";
import { ProjectImage } from "./ProjectImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryPhoto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const isOpen = index !== null;

  // Global keyboard nav + scroll lock require an effect (event listeners).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index! + 1) % items.length);
      if (e.key === "ArrowLeft")
        onNavigate((index! - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, index, items.length, onClose, onNavigate]);

  if (!isOpen) return null;
  const project = items[index!];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/92 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous project"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! - 1 + items.length) % items.length);
            }}
            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! + 1) % items.length);
            }}
            className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </>
      )}

      <figure
        className="flex max-h-[85vh] w-full max-w-4xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex max-h-[72vh] w-full items-center justify-center overflow-hidden rounded-2xl">
          <ProjectImage
            project={project}
            cover={false}
            className="min-h-[40vh] w-full rounded-2xl"
          />
        </div>
        <figcaption className="mt-4 text-center text-white">
          <p className="text-lg font-semibold">{project.title}</p>
          <p className="text-sm text-navy-300">
            {index! + 1} / {items.length}
          </p>
        </figcaption>
      </figure>
    </div>
  );
}
