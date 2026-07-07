import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "outline" | "solid-light";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:cursor-not-allowed disabled:opacity-70";

const variants: Record<Variant, string> = {
  // Primary CTA — reserved for quote / call / submit (accent = orange)
  primary: "bg-accent-500 text-navy-950 hover:bg-accent-400 shadow-lg shadow-accent-500/20",
  // Ghost/outline on dark backgrounds
  outline: "border border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10",
  // Light solid on dark backgrounds
  "solid-light": "bg-white text-navy-900 hover:bg-navy-100",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

// `to`   → in-app SPA navigation via React Router <Link>
// `href` → plain anchor (external, tel:, mailto:, in-page #hash)
// neither → <button>
type ButtonAsRouterLink = CommonProps &
  Omit<LinkProps, "className"> & { to: string; href?: undefined };
type ButtonAsLink = CommonProps &
  ComponentPropsWithoutRef<"a"> & { href: string; to?: undefined };
type ButtonAsButton = CommonProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined; to?: undefined };

export function Button(props: ButtonAsRouterLink | ButtonAsLink | ButtonAsButton) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("to" in props && props.to !== undefined) {
    const { to, ...linkRest } = rest as Omit<LinkProps, "className">;
    return (
      <Link to={to} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorRest } = rest as ComponentPropsWithoutRef<"a">;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
