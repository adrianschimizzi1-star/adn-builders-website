import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { business, telHref, mailHref } from "../data/business";
import { Logo } from "../components/Logo";

const year = "2025"; // bump as needed

// No `id="contact"` any more — Contact merged into Book a Quote (spec 05) and
// nothing linked to that anchor.
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-navy-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-400">
            {business.tagline}. Licensed and fully insured builder proudly
            serving {business.serviceArea}.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={telHref}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-accent-300"
              >
                <Phone className="h-4 w-4 text-accent-400" aria-hidden />
                {business.phone}
              </a>
            </li>
            <li>
              <a
                href={mailHref}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-accent-300"
              >
                <Mail className="h-4 w-4 text-accent-400" aria-hidden />
                {business.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-accent-400" aria-hidden />
              {business.serviceArea}
            </li>
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Explore
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link to="/services" className="hover:text-accent-300">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-accent-300">Projects</Link></li>
            <li><Link to="/about" className="hover:text-accent-300">About</Link></li>
            <li><Link to="/quote" className="hover:text-accent-300">Book a Quote</Link></li>
          </ul>
        </div>

        {/* Credentials */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Credentials
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="inline-flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-accent-400" aria-hidden />
              {business.licenceNumber}
            </li>
            {business.fullyInsured && (
              <li className="inline-flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent-400" aria-hidden />
                Fully insured
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-navy-400 sm:flex-row">
          <p>© {year} {business.name}. All rights reserved.</p>
          <p>{business.licenceNumber}</p>
        </div>
      </div>
    </footer>
  );
}
