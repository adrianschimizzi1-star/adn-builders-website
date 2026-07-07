import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top whenever the route (pathname) changes, so
 * navigating between pages always starts at the top. In-page hash links on
 * Home (e.g. #quote) are left alone — only pathname changes trigger a scroll.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
