import { useEffect, useState } from "react";
import { projects, type GalleryPhoto } from "../data/gallery";
import { listPhotos } from "../lib/adminApi";

/**
 * Live portfolio photos for the gallery + service strips.
 *
 * Renders immediately with the static `projects` seed (so there's never a blank
 * flash and local `vite dev` still works without the backend), then swaps in the
 * live list from /api/photos once it loads. If the backend isn't reachable, or
 * hasn't had any photos uploaded yet, the static seed stays in place.
 */
export function usePhotos(): { photos: GalleryPhoto[]; loading: boolean } {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(projects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listPhotos()
      .then((server) => {
        if (!active || server.length === 0) return;
        setPhotos(
          server.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            alt: p.alt,
            src: p.url,
          })),
        );
      })
      .catch(() => {
        /* keep the static seed */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { photos, loading };
}
