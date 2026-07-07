# Code Standards

## General

- Keep components small and single-purpose; a section
  composes components, a component does one job
- Fix root causes, do not layer workarounds
- Content and presentation stay separate: components
  receive content from `src/data/`, they do not embed it

## TypeScript

- Strict mode is required throughout the project
- Avoid `any` — define interfaces for all data shapes
  (Service, GalleryPhoto, BusinessInfo, QuoteFormFields)
- Validate the quote form fields before submission
  (required fields, basic email/phone format)

## React

- Functional components with hooks only
- Local state (`useState`) is sufficient — no state
  management library
- The lightbox and gallery filter are the only stateful
  features; keep their state in their own components
- No `useEffect` for things achievable with plain
  rendering or event handlers

## Styling

- Tailwind utility classes only — no separate CSS files
  except the Tailwind entry point
- Colors come from the palette tokens defined in the
  Tailwind v4 `@theme` block in `src/index.css` per
  `ui-context.md` — no hardcoded hex values inside components
- Mobile-first: write base styles for small screens,
  layer `md:` / `lg:` variants on top
- Follow the border radius and spacing scale defined
  in `ui-context.md`

## Forms

- The quote form posts to Formspree; the form ID lives
  in one constant, not scattered through JSX
- Disable the submit button while a submission is in
  flight; show explicit success and error states
- Every input has a visible `<label>` — no
  placeholder-only fields

## Data and Content

- All copy, service definitions, and the photo manifest
  live in `src/data/` as typed exports
- Gallery photos are imported (not referenced by string
  path) so the bundler optimizes them
- Each photo entry carries: image import, alt text,
  and category for filtering

## File Organization

- `src/sections/` — One file per page section, ordered
  as they appear on the page
- `src/components/` — Shared building blocks used by
  two or more sections
- `src/data/` — `business.ts`, `services.ts`, `gallery.ts`
- `src/assets/` — `logo/`, `photos/` (optimized only —
  raw originals stay out of the repo)
