import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";
import { useScrollReveal } from "../hooks/useScrollReveal";

/**
 * Shared page shell: the sticky Navbar and the Footer wrap every route via
 * <Outlet />. Each page supplies its own content (and its own single <h1>).
 */
export function Layout() {
  // Fade-up-on-scroll for `.reveal` elements across every routed page.
  useScrollReveal();

  // Page-entrance fade-up: the whole routed page rises in as one motion on
  // each navigation (keyed by pathname so the animation replays per route).
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />
      <main>
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
