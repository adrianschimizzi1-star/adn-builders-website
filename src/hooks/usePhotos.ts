import { useEffect, useMemo, useState } from "react";
import {
  buildProjectTiles,
  seedPhotos,
  type GalleryPhoto,
  type GalleryTile,
} from "../data/gallery";
import { listPhotos } from "../lib/adminApi";
import { useSiteContent } from "./useSiteContent";

/**
 * The single source of portfolio images for the whole public site — Home,
 * Services, and Projects all read from here, so an image can never appear in one
 * place with a category that disagrees with another (spec 05, step 6).
 *
 * Renders immediately with the static `seedPhotos` (no blank flash, and plain
 * `vite dev` works without the backend), then swaps in the live list from
 * /api/photos. If the backend isn't reachable, or no photos have been uploaded
 * yet, the seed stays.
 *
 * The result is cached at module scope and in-flight requests are shared: Home
 * mounts two consumers (Projects section + Services cards), and without this
 * they'd each fire their own /api/photos request on every page load.
 */
let cache: GalleryPhoto[] | null = null;
let inflight: Promise<GalleryPhoto[]> | null = null;

function fetchPhotos(): Promise<GalleryPhoto[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = listPhotos()
      .then((server) => {
        // An empty server list means "nothing uploaded yet" — keep the seed.
        cache =
          server.length === 0
            ? seedPhotos
            : server.map((p) => ({
                id: p.id,
                title: p.title,
                category: p.category,
                alt: p.alt,
                src: p.url,
              }));
        return cache;
      })
      .catch(() => seedPhotos) // backend down — keep the seed, allow a retry
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function usePhotos(): { photos: GalleryPhoto[]; loading: boolean } {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(cache ?? seedPhotos);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    void fetchPhotos()
      .then((list) => {
        if (active) setPhotos(list);
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

/**
 * What every gallery surface actually renders: photos collapsed into tiles by
 * project. Combines the two public content sources so Home, /gallery, and
 * /services can never disagree about what a project is or which photos it holds.
 */
export function useGalleryTiles(): {
  tiles: GalleryTile[];
  photos: GalleryPhoto[];
  loading: boolean;
} {
  const { photos, loading: photosLoading } = usePhotos();
  const { content, loading: contentLoading } = useSiteContent();

  const tiles = useMemo(
    () => buildProjectTiles(photos, content.projects),
    [photos, content.projects],
  );

  return { tiles, photos, loading: photosLoading || contentLoading };
}
