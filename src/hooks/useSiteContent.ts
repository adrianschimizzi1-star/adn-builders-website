import { useEffect, useState } from "react";
import { getContent, type SiteContent } from "../lib/adminApi";

/**
 * Owner-editable site content (reviews, team, projects) from /api/content.
 *
 * Same shape as usePhotos(): one shared module-level cache and one in-flight
 * request, so the several consumers on a page (Reviews, the gallery grid, the
 * team grid) don't each fetch. Callers fall back to their static `src/data`
 * defaults when a list comes back empty — nothing has been entered in the admin
 * yet, or the backend isn't reachable (plain `vite dev`).
 */
const EMPTY: SiteContent = { reviews: [], team: [], projects: [] };

let cache: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

function fetchContent(): Promise<SiteContent> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getContent()
      .then((content) => {
        cache = content;
        return content;
      })
      .catch(() => EMPTY) // backend down — callers use their static defaults
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useSiteContent(): { content: SiteContent; loading: boolean } {
  const [content, setContent] = useState<SiteContent>(cache ?? EMPTY);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    void fetchContent()
      .then((next) => {
        if (active) setContent(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { content, loading };
}
