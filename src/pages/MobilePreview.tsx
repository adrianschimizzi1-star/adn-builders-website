import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";

/**
 * Mobile preview — a standalone dev aid (NOT linked in the navbar/footer).
 * Renders every page of the site inside phone-sized frames so you can review
 * the mobile layout on a desktop. Safe to delete when it's no longer needed.
 */

const PAGES = [
  { path: "/", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/gallery", label: "Projects" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const DEVICES = [
  { id: "se", label: "iPhone SE", width: 375 },
  { id: "std", label: "iPhone 14", width: 390 },
  { id: "max", label: "14 Pro Max", width: 430 },
];

const FRAME_HEIGHT = 720;

export default function MobilePreview() {
  usePageMeta("Mobile preview | ADN Builders");
  const [width, setWidth] = useState(390);

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Toolbar */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-navy-950/85 backdrop-blur">
        <div className="container-page flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to site
            </Link>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white">
              Mobile preview
            </h1>
          </div>

          {/* Device width switch */}
          <div
            className="inline-flex rounded-lg bg-white/5 p-1 ring-1 ring-inset ring-white/10"
            role="group"
            aria-label="Preview width"
          >
            {DEVICES.map((d) => {
              const active = d.width === width;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setWidth(d.width)}
                  aria-pressed={active}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent-500 text-navy-950"
                      : "text-navy-200 hover:text-white"
                  }`}
                >
                  {d.label}
                  <span className="ml-1.5 text-xs opacity-70">{d.width}px</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <p className="container-page pt-6 text-sm text-navy-300">
        Each frame is a live copy of the real page at a phone width. Scroll
        inside a frame, or open any page full-screen.
      </p>

      {/* Phone frames */}
      <div className="container-page flex flex-wrap justify-center gap-10 py-8 sm:justify-start">
        {PAGES.map((page) => (
          <div key={page.path} className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">
                {page.label}
              </span>
              <a
                href={page.path}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent-400 transition-colors hover:text-accent-300"
              >
                Open
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>

            {/* Device bezel */}
            <div className="rounded-[2.5rem] border-8 border-navy-700 bg-black shadow-2xl">
              <div
                className="relative overflow-hidden rounded-[2rem] bg-navy-950"
                style={{ width }}
              >
                {/* Notch */}
                <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />
                <iframe
                  title={`${page.label} — mobile preview`}
                  src={page.path}
                  loading="lazy"
                  style={{ width, height: FRAME_HEIGHT }}
                  className="block border-0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
