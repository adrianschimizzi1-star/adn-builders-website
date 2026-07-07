import { Outlet } from "react-router-dom";
import { Navbar } from "../sections/Navbar";
import { Footer } from "../sections/Footer";

/**
 * Shared page shell: the sticky Navbar and the Footer wrap every route via
 * <Outlet />. Each page supplies its own content (and its own single <h1>).
 */
export function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
