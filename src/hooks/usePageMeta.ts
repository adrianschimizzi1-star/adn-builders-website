import { useEffect } from "react";

/**
 * Sets the document <title> and <meta name="description"> for a page.
 * Called by every page so each route has a distinct, SEO-friendly title and
 * description. The values in index.html act as the defaults for the home page.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }
  }, [title, description]);
}
