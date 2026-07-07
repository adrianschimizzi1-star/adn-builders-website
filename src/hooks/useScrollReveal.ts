import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reveals elements carrying the `.reveal` class as they scroll into view, once
 * each (no re-animating on scroll back up). One shared IntersectionObserver;
 * re-scans on route change so freshly mounted page content is picked up.
 *
 * No-ops under `prefers-reduced-motion: reduce` — the matching CSS keeps
 * `.reveal` content fully visible in that case, so nothing stays hidden.
 */
export function useScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const els = document.querySelectorAll<HTMLElement>(
      ".reveal:not(.is-visible)",
    );

    // Reduced motion, or (defensively) no IntersectionObserver support:
    // show everything immediately, no animation.
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);
}
