import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { business, telHref } from "../data/business";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";

const links = [
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-navy-950/85 backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" aria-label={`${business.name} home`}>
          <Logo className="h-11" />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7 text-sm font-medium text-navy-200">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-white" : "hover:text-white"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Button to="/contact">Get a Free Quote</Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <a
            href={telHref}
            aria-label="Call us"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy-100 hover:bg-white/10"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            {open ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-white/10 bg-navy-950 md:hidden">
          <ul className="container-page flex flex-col py-3 text-base font-medium text-navy-100">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-2 py-3 hover:bg-white/5 ${
                      isActive ? "text-white" : ""
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-2 px-2 pb-2">
              <Button
                to="/contact"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Get a Free Quote
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
