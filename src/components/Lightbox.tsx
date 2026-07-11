import { useEffect, useRef } from "react";
import type { GalleryPhoto } from "../data/gallery";
import { ProjectImage } from "./ProjectImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Minimal lightbox: dark backdrop, the photo at its **native aspect ratio** with
 * rounded corners on the image itself, close on backdrop click / Esc, and
 * prev-next arrows (also ← / →).
 *
 * Sizing: the image is intrinsically sized and capped by `max-h`/`max-w`, so a
 * portrait stays portrait and a portrait taller than the viewport scales down to
 * fit. `svh` (not `vh`) so mobile browser chrome can't push the image off-screen.
 *
 * `title`/`counter` describe the *set* being viewed — a project's photos, or a
 * single loose photo.
 */
export function Lightbox({
  items,
  index,
  title,
  onClose,
  onNavigate,
}: {
  items: GalleryPhoto[];
  index: number | null;
  /** Optional label for the set (e.g. the project title). */
  title?: string;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const isOpen = index !== null && index >= 0 && index < items.length;
  const dialogRef = useRef<HTMLDivElement>(null);

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

  // Modal focus management: move focus into the dialog on open, keep Tab inside
  // it, and restore focus to whatever was focused before (the gallery tile) on
  // close. Without this, a keyboard/screen-reader user stays on the page behind
  // the backdrop despite aria-modal.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));

    focusables()[0]?.focus();

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onTab);
    return () => {
      dialog.removeEventListener("keydown", onTab);
      // Restore focus to the trigger (the gallery tile). Unconditional: the trap
      // keeps focus inside the dialog while it's open, and by the time this
      // passive-effect cleanup runs the dialog is already unmounting — the
      // focused button is gone and focus has fallen to <body>, so a
      // "still inside the dialog?" check would always fail here.
      previouslyFocused?.focus();
    };
    // Re-run only on open/close, not per-navigation, so arrow-key paging within
    // an open lightbox doesn't keep stealing focus back to the first control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Guard, not just `index !== null`: the filtered set can shrink underneath an
  // open lightbox (admin delete, category switch), which would index past the end.
  if (!isOpen) return null;
  const project = items[index!];
  const caption = title ?? project.title;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={caption}
      className="fixed inset-0 z-[60] flex touch-manipulation items-center justify-center overscroll-contain bg-navy-950/92 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! - 1 + items.length) % items.length);
            }}
            className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index! + 1) % items.length);
            }}
            className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </>
      )}

      {/* `w-full max-w-5xl` gives children a definite width to resolve against
          (the placeholder's `w-full` would otherwise collapse). */}
      <figure
        className="flex max-h-[88svh] w-full max-w-5xl flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* No wrapper box: the image sizes itself, so `rounded-2xl` follows the
            real photo edges and portraits are never letterboxed. */}
        <ProjectImage
          project={project}
          cover={false}
          className="max-h-[68svh] rounded-2xl shadow-2xl sm:max-h-[74svh]"
        />
        <figcaption className="mt-4 shrink-0 text-center text-white">
          <p className="text-lg font-semibold">{caption}</p>
          <p className="text-sm text-navy-300">
            {title && project.title !== title ? `${project.title} · ` : ""}
            {index! + 1} / {items.length}
          </p>
        </figcaption>
      </figure>
    </div>
  );
}
