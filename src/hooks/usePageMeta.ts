import { useEffect } from "react";

/**
 * The index.html <meta name="description"> value, captured once at module load
 * (before any route renders). Pages that don't set their own description fall
 * back to this instead of inheriting the previous route's description.
 */
const defaultDescription =
  document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.content ?? "";

/**
 * Sets the document <title> and <meta name="description"> for a page.
 * Called by every page so each route has a distinct, SEO-friendly title and
 * description. The values in index.html act as the defaults for the home page.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title;

    let tag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    // Always write, so a description never leaks from the previous route.
    tag.content = description ?? defaultDescription;
  }, [title, description]);
}
