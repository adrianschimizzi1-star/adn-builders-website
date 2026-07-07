import { business } from "../data/business";

/**
 * ADN Builders logo. The PNG has a transparent background and its navy banner /
 * white "ADN" / orange "BUILDERS" read cleanly on the site's dark theme — so it
 * sits directly on the background with no plate.
 */
export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src="/adn-logo.png"
      alt={`${business.name} logo`}
      width={500}
      height={167}
      className={`${className} w-auto`}
    />
  );
}
